#!/usr/bin/env python3
"""Find files that reference common React hooks.

Usage:
  python3 scripts/find-react-hooks.py [root]

Options:
  --exclude DIR    Additional directory names to exclude (can be used multiple times)
  --hooks H1 H2    Override hooks list
  --require-react-import  Only print files that also import from 'react'
  --list-react-imports    Print files that import from 'react' (regardless of hooks)

This is a lightweight heuristic script (text-based); for zero false-positives
consider using a proper JS/TS parser.
"""
import os
import re
import argparse
from typing import List, Set

DEFAULT_EXCLUDES = {"node_modules", ".git", ".next", "dist", "build", "public", "venv", "__pycache__"}

DEFAULT_HOOKS = [
    "useState", "useEffect", "useContext", "useReducer",
    "useMemo", "useCallback", "useRef", "useLayoutEffect",
    "useImperativeHandle", "useDebugValue", "useDeferredValue", "useId"
]

FILE_EXTENSIONS = (".js", ".jsx", ".ts", ".tsx")


def has_react_import(content: str) -> bool:
    # matches: import ... from 'react'  or require('react')
    return bool(re.search(r"from\s+['\"]react['\"]", content) or re.search(r"require\(\s*['\"]react['\"]\s*\)", content))


def find_files_with_hooks(root: str, hooks: List[str], excludes: Set[str], require_react_import: bool, list_react_imports: bool) -> Set[str]:
    hooks_pattern = re.compile(r"\b(" + "|".join(re.escape(h) for h in hooks) + r")\b")
    matches = set()
    react_imports = set()

    for dirpath, dirnames, filenames in os.walk(root, topdown=True):
        # prune excluded directories in-place to speed traversal
        dirnames[:] = [d for d in dirnames if d not in excludes]

        for fname in filenames:
            if not fname.endswith(FILE_EXTENSIONS):
                continue
            fpath = os.path.join(dirpath, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
            except (UnicodeDecodeError, FileNotFoundError, PermissionError):
                continue

            imported = has_react_import(content)
            if imported:
                react_imports.add(fpath)

            if list_react_imports:
                continue

            if hooks_pattern.search(content):
                if require_react_import:
                    if imported:
                        matches.add(fpath)
                else:
                    matches.add(fpath)

    return (matches, react_imports)


def main():
    p = argparse.ArgumentParser(description="Find files containing React hooks.")
    p.add_argument("root", nargs="?", default=".", help="Root directory to search (default: current directory)")
    p.add_argument("--exclude", "-e", action="append", default=[], help="Additional directory names to exclude")
    p.add_argument("--hooks", "-k", nargs="*", help="Custom hook names to search for (space separated)")
    p.add_argument("--require-react-import", action="store_true", help="Only print files that also import from 'react'")
    p.add_argument("--list-react-imports", action="store_true", help="Print files that import from 'react' (regardless of hooks)")
    args = p.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f"Error: root path does not exist or is not a directory: {root}")
        return 2

    excludes = set(DEFAULT_EXCLUDES) | set(args.exclude)
    hooks = args.hooks if args.hooks else DEFAULT_HOOKS

    matches, react_imports = find_files_with_hooks(root, hooks, excludes, args.require_react_import, args.list_react_imports)

    if args.list_react_imports:
        if not react_imports:
            print("No files with a 'react' import found.")
            return 0
        print("Files importing from 'react':")
        for pth in sorted(react_imports):
            print(pth)
        return 0

    if not matches:
        print("No files containing React hooks found (with the given options).")
        return 0

    print("Files containing React hooks:")
    for pth in sorted(matches):
        print(pth)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())