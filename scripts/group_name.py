"""The group's name: the pack says BKB, the platform says SITL (owner, 24 Nov 2026).

The pack is never edited, so every script that reads it calls `rename_group` on what it read, first thing:
the rest of the script, the files under src/ and the backend's seeds all say SITL. Codes change with the
name (BKB-POL-006 -> SITL-POL-006). backend/scripts/build_desk_decisions.py does the same in its own repo.
"""
PACK_NAME, NAME = "BKB", "SITL"


def rename_group(text: str) -> str:
    return text.replace(PACK_NAME, NAME)
