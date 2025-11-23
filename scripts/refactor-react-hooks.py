#!/usr/bin/env python3
"""Refactor React hook usage in source files.

This script performs a text-based refactor that:
- removes hook names from named imports from 'react'
- ensures a default `import React from 'react'` exists (if hooks were removed)
- replaces hook usages like `useState` with `React.useState` (skips `React.useState` already)

Usage:
  python3 scripts/refactor-react-hooks.py [root] [--dry-run]

Options:
  --dry-run         Don't write files; print affected files and a brief diff
  --exclude DIR     Directory names to exclude (can be passed multiple times)
  --hooks H1 H2     Override hooks to search for
  --extensions      Comma-separated file extensions to target (default: .js,.jsx,.ts,.tsx)

This is a heuristic textual refactor. For precise AST-safe transforms consider using a
JavaScript/TypeScript parser and source-to-source tooling (e.g., jscodeshift, ts-morph).
"""
import argparse
import os
import re
import sys
from typing import List, Set, Tuple

DEFAULT_EXCLUDES = {"node_modules", ".git", ".next", "dist", "build", "public", "venv", "__pycache__"}

DEFAULT_HOOKS = [
    "useState", "useEffect", "useContext", "useReducer",
    "useMemo", "useCallback", "useRef", "useLayoutEffect",
    "useImperativeHandle", "useDebugValue", "useDeferredValue", "useId"
]


def parse_import_from_react_lines(content: str) -> List[Tuple[re.Match, str]]:
    """Return list of (match, import_line) for imports from 'react'."""
    pattern = re.compile(r"(^\s*import\s+[^;]+?\s+from\s+['\"]react['\"]\s*;?)", re.M)
    return [(m, m.group(1)) for m in pattern.finditer(content)]


def process_import_line(import_line: str, hook_set: Set[str]) -> Tuple[str, bool]:
    """Process a single import line. Returns (new_line_or_empty, removed_hooks_flag).

    Rules:
    - If named imports include hooks, remove those named hooks.
    - Preserve non-hook named imports.
    - Preserve default import if present.
    - If import only contained hooks and no default/namespace import, remove the whole line.
    """
    orig = import_line
    removed = False

    # detect namespace imports: import * as React from 'react'
    if re.search(r"import\s+\*\s+as\s+\w+\s+from\s+['\"]react['\"]", import_line):
        return import_line, False

    # detect default import name (e.g., import React, { ... } from 'react')
    default_match = re.match(r"^\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]*)\}\s*from\s+['\"]react['\"]", import_line)
    if default_match:
        default_name = default_match.group(1)
        named = default_match.group(2)
        names = [n.strip() for n in named.split(',') if n.strip()]
        remaining = [n for n in names if n not in hook_set]
        removed = len(names) != len(remaining)
        if remaining:
            new_named = '{ ' + ', '.join(remaining) + ' }'
            return f"import {default_name}, {new_named} from 'react';", removed
        else:
            # keep only default import
            return f"import {default_name} from 'react';", removed

    # detect named-only imports: import { a, b } from 'react'
    named_match = re.match(r"^\s*import\s*\{([^}]*)\}\s*from\s+['\"]react['\"]\s*;?", import_line)
    if named_match:
        names = [n.strip() for n in named_match.group(1).split(',') if n.strip()]
        remaining = [n for n in names if n not in hook_set]
        removed = len(names) != len(remaining)
        if remaining:
            return "import { " + ', '.join(remaining) + " } from 'react';", removed
        else:
            # entire import can be removed
            return "", removed

    # other forms (e.g., import React from 'react') -> keep as-is
    return import_line, False


def ensure_react_import(content_lines: List[str]) -> List[str]:
    """Ensure `import React from 'react';` exists; insert after 'use client' if present else at top."""
    has_react_default = any(re.match(r"^\s*import\s+React\s+from\s+['\"]react['\"]", l) for l in content_lines)
    has_namespace = any(re.match(r"^\s*import\s+\*\s+as\s+\w+\s+from\s+['\"]react['\"]", l) for l in content_lines)
    if has_react_default or has_namespace:
        return content_lines

    # find insertion point (after 'use client' directive if present)
    insert_idx = 0
    if content_lines and content_lines[0].strip().startswith("'use client'"):
        insert_idx = 1
    content_lines.insert(insert_idx, "import React from 'react';")
    return content_lines


def replace_hooks_in_content(content: str, hooks: List[str]) -> str:
    # avoid double-replacing existing React.useX (negative lookbehind)
    pattern = re.compile(r'(?<!\bReact\.)\b(' + '|'.join(re.escape(h) for h in hooks) + r')\b')
    return pattern.sub(lambda m: 'React.' + m.group(1), content)


def process_file(path: str, hooks: List[str], dry_run: bool) -> Tuple[bool, str]:
    """Process a single file. Returns (changed_flag, diff_summary).

    diff_summary is a short message describing what would be changed or was changed.
    """
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f'skipped(unreadable): {e}'

    original = content
    hook_set = set(hooks)

    # Process imports
    import_matches = parse_import_from_react_lines(content)
    new_content = content
    removed_any_hooks = False

    # Replace import lines in reverse order to keep indices valid
    for m, import_line in reversed(import_matches):
        new_line, removed = process_import_line(import_line, hook_set)
        if removed:
            removed_any_hooks = True
        if new_line == import_line:
            continue
        if new_line == "":
            # remove the line
            start, end = m.span()
            # remove including following newline if present
            if end < len(new_content) and new_content[end] == '\n':
                end += 1
            new_content = new_content[:start] + new_content[end:]
        else:
            start, end = m.span()
            new_content = new_content[:start] + new_line + new_content[end:]

    # If we removed hooks from imports, ensure React default import exists
    if removed_any_hooks:
        lines = new_content.splitlines()
        lines = ensure_react_import(lines)
        new_content = '\n'.join(lines) + ("\n" if new_content.endswith("\n") else "")

    # Replace hook usages (skip already React.useX)
    replaced_content = replace_hooks_in_content(new_content, hooks)

    if replaced_content != original:
        if not dry_run:
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(replaced_content)
            except Exception as e:
                return False, f'error(writing): {e}'
        # produce a small diff summary (list of changes)
        return True, 'would change' if dry_run else 'changed'

    return False, 'no change'


def find_target_files(root: str, exts: List[str], excludes: Set[str]) -> List[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk(root, topdown=True):
        dirnames[:] = [d for d in dirnames if d not in excludes]
        for fname in filenames:
            if any(fname.endswith(ext) for ext in exts):
                out.append(os.path.join(dirpath, fname))
    return out


def main(argv: List[str]):
    p = argparse.ArgumentParser(description='Refactor React hook usages to React.useX')
    p.add_argument('root', nargs='?', default='.', help='Root path to search')
    p.add_argument('--dry-run', action='store_true', help="Don't write files; just report")
    p.add_argument('--exclude', '-e', action='append', default=[], help='Directory names to exclude')
    p.add_argument('--hooks', '-k', nargs='*', help='Custom hooks list')
    p.add_argument('--extensions', default='.js,.jsx,.ts,.tsx', help='Comma-separated file extensions to process')
    args = p.parse_args(argv)

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f'Error: {root} is not a directory', file=sys.stderr)
        return 2

    excludes = set(DEFAULT_EXCLUDES) | set(args.exclude)
    hooks = args.hooks if args.hooks else DEFAULT_HOOKS
    exts = [e if e.startswith('.') else '.' + e for e in args.extensions.split(',')]

    files = find_target_files(root, exts, excludes)
    changed_files = []
    skipped = 0

    for f in files:
        ok, msg = process_file(f, hooks, args.dry_run)
        if ok:
            changed_files.append((f, msg))
        else:
            if msg.startswith('skipped'):
                skipped += 1

    if not changed_files:
        print('No files would be changed.' if args.dry_run else 'No files changed.')
        return 0

    print(('Dry-run: files that would be changed:' if args.dry_run else 'Files changed:'))
    for f, msg in changed_files:
        print(f, msg)
    if skipped:
        print(f'Skipped unreadable files: {skipped}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
