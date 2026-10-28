# Instructions for Codex on this branch

This branch (`art/codex`) is for generating Hearthfall's art. Your whole job is in `art-codex/`: start with `art-codex/BRIEF.md`, then `art-codex/CHARACTERS.md` and `art-codex/ASSETS.md`.

- Make images with your image generation tool and save them under `art-codex/out/` at the exact paths and sizes in `art-codex/ASSETS.md`.
- Build the character animations with `python3 art-codex/tools/compose_character.py <name>`.
- Check your work with `python3 art-codex/tools/check_art.py --batch <N>` and fix every failure before committing.
- Do not change anything outside `art-codex/`: no game code, no docs, no other art.
- Work batch by batch (1, then 2, 3, 4). Commit and push each batch to `art/codex`.
