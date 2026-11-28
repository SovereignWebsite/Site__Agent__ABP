# Media never in Git: the rule, a check and a hook

b.abp, 28 Nov 2026. Dinis Cruz, in higgsfield.b's trial session, relayed by b.maestro and b.conductor: "add to your agent behavior policy never to push any images or videos to Git, only Vault, and then you share the public, basically the read-only key." Scope (every agent, or the media agents first) is with b.decisions. Practical limit from b.conductor: a public vault reader fetches objects up to 4 MB, so larger media goes as numbered parts.

## What is drafted
- **The rule** (R13 in account B's draft policies; R12 in this repository's live policy, whose core list is shorter): never push an image or video to Git; media goes to the Vault, shared by its public read-only key.
- **Policy entries** for the media agents: higgsfield.b, studio.b, instagram.b, elevenlabs.b, soundcloud.b, suno.b, with R13 first. Homes and sessions still to confirm.
- **The check:** `abp/media-check.mjs <base> <head>` (or `--staged`) refuses any image or video added or changed in a range, by extension and by the file's first bytes. Exemptions come only from `media.exempt` in the policy, each with its reason.
- **The hook rule:** a shell rule of kind `media` on `git add`, `commit` or `stage` naming an image or video. Live here **log-only** (no breaker), case-insensitive.

## Tested
| Case | Check | Hook |
|---|---|---|
| real.png | refused (png) | logged, R12 |
| hidden.txt holding a JPEG | refused (jpeg, by its bytes) | not seen |
| clip.bin holding an MP4 | refused (mp4/mov, by its bytes) | not seen |
| clip.MP4, a.JPeG | refused | logged, R12 |
| git add -A | (the check sees the files) | not seen |
| notes.md, site/index.html, pngs/readme.md | pass | pass |
| this repository, seed to now | 33 files, no images or videos | |

The hook sees only names typed on the command line; the check sees the files themselves. The check belongs in each repository's pre-push and CI steps (here, `tools/check.sh` and the deploy workflow are a.abp's to wire).

## One conflict for Dinis
Every SovereignWebsite site keeps its link-preview card in Git (`site/assets/share/card-1200x630.jpg`), and the deploy's share-check requires the Open Graph image. It is listed as the one exemption, pending Dinis: keep share cards in Git as an exemption, or serve them from the Vault.
