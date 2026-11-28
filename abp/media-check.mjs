#!/usr/bin/env node
// Refuse images and videos in a range of commits: media goes to the Vault, never to Git (Dinis Cruz, 28 Nov 2026,
// relayed: "never to push any images or videos to Git, only Vault, and then you share the public ... read-only key").
//   node abp/media-check.mjs <base> <head>     every file added or changed in base..head
//   node abp/media-check.mjs --staged          what is staged now (for a pre-commit or pre-push step)
// Caught by extension AND by the file's first bytes, so a renamed .jpg is still caught. Exit 1 if any is found.
// Exemptions: policy media.exempt (globs), each with its reason; read from abp/policies.json if present.
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'
const git = (...a) => execFileSync('git', a, { encoding: 'buffer', maxBuffer: 1 << 28 })
const EXT = /\.(png|jpe?g|gif|webp|avif|heic|heif|bmp|tiff?|ico|psd|mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp)$/i
const MAGIC = [[[0x89, 0x50, 0x4e, 0x47], 'png'], [[0xff, 0xd8, 0xff], 'jpeg'], [[0x47, 0x49, 0x46, 0x38], 'gif'], [[0x42, 0x4d], 'bmp'],
  [[0x49, 0x49, 0x2a, 0x00], 'tiff'], [[0x4d, 0x4d, 0x00, 0x2a], 'tiff'], [[0x1a, 0x45, 0xdf, 0xa3], 'webm/mkv'], [[0x38, 0x42, 0x50, 0x53], 'psd']]
const sniff = b => { for (const [m, t] of MAGIC) if (m.every((x, i) => b[i] === x)) return t
  const s = b.subarray(4, 12).toString('latin1'), r = b.subarray(0, 4).toString('latin1'), w = b.subarray(8, 12).toString('latin1')
  if (s.startsWith('ftyp')) return /^ftyp(avif|avis|heic|heix|mif1)/.test(s) ? 'avif/heic' : 'mp4/mov'
  if (r === 'RIFF' && (w === 'WEBP' || w === 'AVI ')) return w.trim().toLowerCase(); return null }
let exempt = []; try { exempt = JSON.parse(fs.readFileSync('abp/policies.json', 'utf8')).media?.exempt || [] } catch {}
const glob = g => new RegExp('^' + g.split(/(\*\*\/?|\*)/).map(t => t[1] === '*' ? '.*' : t === '*' ? '[^/]*' : t.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('') + '$')
const args = process.argv.slice(2), staged = args[0] === '--staged'
const names = (staged ? git('diff', '--cached', '--name-only', '--diff-filter=AMR', '-z') : git('diff', '--name-only', '--diff-filter=AMR', '-z', `${args[0]}..${args[1] || 'HEAD'}`)).toString().split('\0').filter(Boolean)
const found = []
for (const f of names) {
  if (exempt.some(e => glob(e.glob).test(f))) continue
  let head = Buffer.alloc(0); try { head = (staged ? git('show', `:${f}`) : git('show', `${args[1] || 'HEAD'}:${f}`)).subarray(0, 16) } catch {}
  const t = sniff(head); if (EXT.test(f) || t) found.push(`${f}${t ? ` (${t})` : ''}`)
}
if (found.length) { console.error(`media-check: ${found.length} image or video file(s); media goes to the Vault, never to Git:\n  ${found.join('\n  ')}`); process.exit(1) }
console.log(`media-check: ${names.length} file(s), no images or videos${exempt.length ? ` (${exempt.length} exemption(s))` : ''}`)
