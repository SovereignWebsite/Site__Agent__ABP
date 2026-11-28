# The media rule: proposal for policy/abp.json, the exceptions, and the register

b.abp, 28 Nov 2026. From Dinis Cruz's decision, record `2026-11-28__media-in-vault` (decisions.b, in force until 5 Dec 2026), verified by b.abp against the event (289b0858-a527-4fb5-ba69-e928d3a5a675, 01:35:12 UTC): "small pictures in Git as sort of, you know, exceptions in GitHub, but everything else should start to move into Vault ... we need to make sure we have a good grip of every single public link that we have."

## 1. The rule, for SovereignWebsite__IaC policy/abp.json (Dinis's merge)
b.abp does not write IaC. This is the block for its keeper to add, as it stands:

```json
"media_rule": {
  "rule": "Images, video and audio go to a vault, never to Git, shared by a public read link listed on the vault keeper's site. Small pictures stay in Git only as listed exceptions within their size limit.",
  "source": "record 2026-11-28__media-in-vault (Dinis Cruz, 28 Nov 2026)",
  "applies_to": "every agent",
  "check": "every commit in the pushed range: images, video and audio by extension and first bytes; a small picture (png, jpeg, gif, webp, ico) passes only inside an exception and within its max_bytes",
  "exempt_total_bytes": 512000,
  "exempt": [
    { "glob": "site/assets/share/**", "max_bytes": 153600, "why": "link-preview cards for the Open Graph and Twitter tags" },
    { "glob": "site/favicon.*",       "max_bytes": 51200,  "why": "the favicon" },
    { "glob": "site/assets/icons/**", "max_bytes": 51200,  "why": "app and touch icons" },
    { "glob": "site/assets/brand/**", "max_bytes": 102400, "why": "small logos" }
  ],
  "existing_media": "moves to a vault when its keeper next touches the site; nothing is deleted from history"
}
```

A reference check is in Site__Agent__ABP: `abp/media-check.mjs <base> <head>` (or `--staged`). For CI it runs beside the paths and signature checks, on the pushed range, from the trusted copy, as the other checks do.

## 2. The size limit and exceptions, for security.b
- **Only small pictures:** png, jpeg, gif, webp, ico. Video and audio have no exception, at any size.
- **Per file:** 150 KB for link-preview cards (today's card is 5.9 KB), 100 KB for logos, 50 KB for favicons and icons.
- **Per repository:** 500 KB of exempt pictures in all.
- **Only in the listed paths.** A picture anywhere else, or one above its limit, is refused.
- **By content, not by name:** a video renamed `.jpg` inside an exempt path is refused (tested).
- **Open for security.b:** SVG. It is an image but also code (it can carry script); proposed as not exempt until security.b says.

**Tested** in a throwaway repository: a 6-byte card in site/assets/share passes; a 200 KB JPEG there is refused; an MP4 named sneaky.jpg there is refused; photo.png elsewhere, song.mp3 and a WAV named voice.bin are refused. Site__Agent__ABP's whole history (59 files) passes.

## 3. The register, for b.vault.keeper
Its site lists every vault and every public read link, so we keep a grip on what is public. b.abp's suggestion of what each entry carries: the vault, its owner agent, what it holds, the public read link, the date it was made public, and who approved it; never a vault key or any write key. Agents' policies then say: a media file is published only once its read link is on the register.
