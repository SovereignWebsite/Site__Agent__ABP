#!/usr/bin/env node
// Refuse images and videos in a range of commits: media goes to the Vault, never to Git (Dinis Cruz, 28 Nov 2026,
// relayed: "never to push any images or videos to Git, only Vault, and then you share the public ... read-only key").
//   node abp/media-check.mjs <base> <head>     every file added or changed in base..head
//   node abp/media-check.mjs --staged          what is staged now (for a pre-commit or pre-push step)
// Caught by extension AND by the file's first bytes, so a renamed .jpg is still caught. Exit 1 if any is found.
// Exemptions: policy media.exempt (globs), each with its reason; read from abp/policies.json if present.
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'
const git = (...a) => execFileSync('git', a, { encoding: 'buffer', maxBuffer: 1 << 28 })
const EXT = /\.(png|jpe?g|gif|webp|avif|heic|heif|bmp|tiff?|ico|psd|mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp|mp3|wav|m4a|aac|flac|ogg|opus|aiff?)$/i
const MAGIC = [[[0x89, 0x50, 0x4e, 0x47], 'png'], [[0xff, 0xd8, 0xff], 'jpeg'], [[0x47, 0x49, 0x46, 0x38], 'gif'], [[0x42, 0x4d], 'bmp'],
  [[0x49, 0x49, 0x2a, 0x00], 'tiff'], [[0x4d, 0x4d, 0x00, 0x2a], 'tiff'], [[0x1a, 0x45, 0xdf, 0xa3], 'webm/mkv'], [[0x38, 0x42, 0x50, 0x53], 'psd'],
  [[0x49, 0x44, 0x33], 'mp3'], [[0xff, 0xfb], 'mp3'], [[0x66, 0x4c, 0x61, 0x43], 'flac'], [[0x4f, 0x67, 0x67, 0x53], 'ogg']]
const sniff = b => { for (const [m, t] of MAGIC) if (m.every((x, i) => b[i] === x)) return t
  const s = b.subarray(4, 12).toString('latin1'), r = b.subarray(0, 4).toString('latin1'), w = b.subarray(8, 12).toString('latin1')
  if (s.startsWith('ftyp')) return /^ftyp(avif|avis|heic|heix|mif1)/.test(s) ? 'avif/heic' : 'mp4/mov'
  if (r === 'RIFF' && (w === 'WEBP' || w === 'AVI ' || w === 'WAVE')) return w.trim().toLowerCase(); return null }
let exempt = [], cap = Infinity; try { const m = JSON.parse(fs.readFileSync('abp/policies.json', 'utf8')).media || {}; exempt = m.exempt || []; cap = m.exempt_total_bytes ?? Infinity } catch {}
const glob = g => new RegExp('^' + g.split(/(\*\*\/?|\*)/).map(t => t[1] === '*' ? '.*' : t === '*' ? '[^/]*' : t.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('') + '$')
const args = process.argv.slice(2), staged = args[0] === '--staged'
const names = (staged ? git('diff', '--cached', '--name-only', '--diff-filter=AMR', '-z') : git('diff', '--name-only', '--diff-filter=AMR', '-z', `${args[0]}..${args[1] || 'HEAD'}`)).toString().split('\0').filter(Boolean)
const found = []
// An exemption is a small picture only: { glob, max_bytes, types }; video and audio are never exempt.
const PICTURE = /^(png|jpeg|gif|webp|ico|bmp)$/, total = { n: 0 }
for (const f of names) {
  let blob = Buffer.alloc(0); try { blob = staged ? git('show', `:${f}`) : git('show', `${args[1] || 'HEAD'}:${f}`) } catch {}
  const t = sniff(blob.subarray(0, 16)) || (EXT.exec(f)?.[1] || '').toLowerCase().replace('jpg', 'jpeg'); if (!t) continue
  const e = exempt.find(x => glob(x.glob).test(f))
  if (e && PICTURE.test(t) && blob.length <= (e.max_bytes ?? 0) && (!e.types || e.types.includes(t))) { total.n += blob.length; continue }
  found.push(`${f} (${t}, ${blob.length} bytes)${e ? ': matches an exemption but is not a small picture within its limit' : ''}`)
}
if (total.n > cap) found.push(`exempt pictures total ${total.n} bytes, above the ${cap}-byte cap`)
if (found.length) { console.error(`media-check: ${found.length} image, video or audio file(s); media goes to a vault, never to Git:\n  ${found.join('\n  ')}`); process.exit(1) }
console.log(`media-check: ${names.length} file(s), no images, video or audio outside the exceptions${exempt.length ? ` (${exempt.length} exemption(s))` : ''}`)
