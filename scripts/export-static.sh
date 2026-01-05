#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./export-static.sh -c container <host-dest>
#
# Notes:
#   - This script only copies from an existing container specified by name.
#   - It will remove everything inside <host-dest> before copying (DEST is preserved).

CONTAINER=""
while getopts ":c:" opt; do
  case ${opt} in
    c) CONTAINER="${OPTARG}" ;;
    \?) echo "Invalid option: -${OPTARG}" >&2; exit 1 ;;
    :) echo "Option -${OPTARG} requires an argument." >&2; exit 1 ;;
  esac
done
shift $((OPTIND -1))

DEST="${1:-}"
if [ -z "${DEST}" ] || [ -z "${CONTAINER}" ]; then
  echo "ERROR: container name (-c) and destination directory are required."
  exit 1
fi

if [[ "${CONTAINER}" =~ ^[0-9a-f]{12,64}$ ]]; then
  echo "ERROR: it looks like you passed a container id. Please pass a container NAME, not an id."
  exit 2
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker CLI not found in PATH."
  exit 3
fi

if ! docker inspect "${CONTAINER}" >/dev/null 2>&1; then
  echo "ERROR: container '${CONTAINER}' not found."
  exit 4
fi

mkdir -p "${DEST}"
dest_full=$(cd "${DEST}" && pwd -P)

if [ "${dest_full}" = "/" ]; then
  echo "ERROR: refusing to wipe root '/'"
  exit 5
fi

echo "Removing all contents of ${dest_full} ..."
if ! find "${dest_full}" -mindepth 1 -delete 2>/dev/null; then
  rm -rf "${dest_full:?}/"* "${dest_full:?}/".[!.]* "${dest_full:?}/"..?* 2>/dev/null || true
fi

copy_if_exists() {
  local src_path="$1"
  local dest_subpath="$2"
  local dest_path="${DEST}"
  if [ -n "${dest_subpath}" ]; then
    dest_path="${DEST%/}/${dest_subpath}"
  fi

  # Ensure destination parent exists
  mkdir -p "$(dirname "${dest_path}")" 2>/dev/null || true

  if docker cp "${CONTAINER}:${src_path}" "${dest_path}" 2>/dev/null; then
    echo "Copied ${src_path} -> ${dest_path}"
  else
    echo "Skipping ${src_path} (not present in container ${CONTAINER})"
  fi
}

merge_into_dest_overwrite() {
  local label_dir="$1"
  [ -d "${label_dir}" ] || return 0

  find "${label_dir}" -type d -print0 2>/dev/null | while IFS= read -r -d '' d; do
    rel="${d#${label_dir}/}"
    [ -z "$rel" ] && continue
    mkdir -p "${DEST%/}/${rel}"
  done

  find "${label_dir}" \( -type f -o -type l -o -type c -o -type b -o -type p \) -print0 2>/dev/null | while IFS= read -r -d '' src; do
    rel="${src#${label_dir}/}"
    dest="${DEST%/}/${rel}"
    mkdir -p "$(dirname -- "${dest}")"
    mv -f -- "${src}" "${dest}" 2>/dev/null || cp -a -- "${src}" "${dest}" 2>/dev/null || true
  done

  rm -rf "${label_dir}" >/dev/null 2>&1 || true
}


merge_into_dest_skip_existing() {
  local label_dir="$1"
  [ -d "${label_dir}" ] || return 0

  find "${label_dir}" -type d -print0 2>/dev/null | while IFS= read -r -d '' d; do
    rel="${d#${label_dir}/}"
    [ -z "$rel" ] && continue
    mkdir -p "${DEST%/}/${rel}"
  done

  find "${label_dir}" \( -type f -o -type l -o -type c -o -type b -o -type p \) -print0 2>/dev/null | while IFS= read -r -d '' src; do
    rel="${src#${label_dir}/}"
    dest="${DEST%/}/${rel}"
    mkdir -p "$(dirname -- "${dest}")"
    if [ ! -e "${dest}" ]; then
      mv -- "${src}" "${dest}" 2>/dev/null || cp -a -- "${src}" "${dest}" 2>/dev/null || true
    else
      echo "Skipping copy of ${rel} from ${label_dir##*/} because ${dest} already exists"
    fi
  done

  rm -rf "${label_dir}" >/dev/null 2>&1 || true
}

echo "Copying likely outputs from container ${CONTAINER} -> ${DEST} ..."
copy_if_exists "/app/.next/static" "_next/static"
copy_if_exists "/app/public" "temp_public"
copy_if_exists "/app/.next/server/app" "temp_app"
merge_into_dest_overwrite "${DEST%/}/temp_app"
merge_into_dest_skip_existing "${DEST%/}/temp_public"


rm -rf "${DEST%/}/favicon.ico" "${DEST%/}/icon.svg" "${DEST%/}/icon.png"

TARGET_MEDIA_DIR="/app/.next/static/media"

# Find and copy icon
ICON_PATH=$(docker exec "${CONTAINER}" find "${TARGET_MEDIA_DIR}" -name "icon.*.png" 2>/dev/null | head -n 1)
if [ -n "${ICON_PATH}" ]; then
  docker cp "${CONTAINER}:${ICON_PATH}" "${DEST%/}/icon.png"
  echo "Copied ${ICON_PATH} -> ${DEST%/}/icon.png"
fi



echo "Adjusting permissions (best-effort; you may need sudo)..."
if chown -R www-data:www-data "${DEST}" >/dev/null 2>&1; then
  echo "Ownership changed to www-data:www-data"
else
  echo "Warning: couldn't chown ${DEST}. You may need to run: sudo chown -R www-data:www-data ${DEST}"
fi
if chmod -R 755 "${DEST}" >/dev/null 2>&1; then
  echo "Permissions set to 755"
else
  echo "Warning: couldn't chmod ${DEST}. You may need to run: sudo chmod -R 755 ${DEST}"
fi

echo "Done. Files exported to ${DEST}"