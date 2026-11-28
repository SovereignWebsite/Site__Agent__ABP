#!/usr/bin/env node
// Refuse images, video, audio and archives in a range of commits: media goes to a vault, never to Git.
// Dinis Cruz, record 2026-11-28__media-in-vault: "small pictures in Git as sort of, you know, exceptions ...
// but everything else should start to move into Vault". Reviewed by security.b, 28 Nov 2026.
//   node abp/media-check.mjs <base> <head>     every file added or changed in base..head
//   node abp/media-check.mjs --staged          what is staged now (a pre-commit or pre-push step)
// Judged by content (first bytes) as well as by name, so a renamed file is still caught. Exit 1 if any is refused.
// Exceptions come only from policy media.exempt: { glob, max_bytes, types?, why }. Only small pictures (png, jpeg,
// gif, webp, ico) can be exempt; SVG only where an exception lists "svg" and the file passes the SVG content check.
// Video, audio and archives are never exempt. The total of exempt pictures is summed over the whole HEAD tree.
// A guardrail where it runs after the push; it prevents only as a pre-push step or a required check.
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'
const git = (...a) => execFileSync('git', a, { encoding: 'buffer', maxBuffer: 1 << 28 })
const EXT = /\.(png|jpe?g|gif|webp|avif|heic|heif|bmp|tiff?|ico|psd|svgz?|mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp|mp3|wav|m4a|aac|flac|ogg|opus|aiff?|zip|7z|rar|tar|gz|tgz|bz2|xz|zst)$/i
const MAGIC = [[[0x89, 0x50, 0x4e, 0x47], 'png'], [[0xff, 0xd8, 0xff], 'jpeg'], [[0x47, 0x49, 0x46, 0x38], 'gif'], [[0x42, 0x4d], 'bmp'],
  [[0x49, 0x49, 0x2a, 0x00], 'tiff'], [[0x4d, 0x4d, 0x00, 0x2a], 'tiff'], [[0x00, 0x00, 0x01, 0x00], 'ico'], [[0x38, 0x42, 0x50, 0x53], 'psd'],
  [[0x1a, 0x45, 0xdf, 0xa3], 'webm/mkv'], [[0x49, 0x44, 0x33], 'mp3'], [[0xff, 0xfb], 'mp3'], [[0x66, 0x4c, 0x61, 0x43], 'flac'], [[0x4f, 0x67, 0x67, 0x53], 'ogg'],
  [[0x50, 0x4b, 0x03, 0x04], 'zip'], [[0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], '7z'], [[0x52, 0x61, 0x72, 0x21], 'rar'], [[0x1f, 0x8b], 'gzip'],
  [[0x42, 0x5a, 0x68], 'bzip2'], [[0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00], 'xz'], [[0x28, 0xb5, 0x2f, 0xfd], 'zstd']]
const sniff = b => {
  for (const [m, t] of MAGIC) if (m.every((x, i) => b[i] === x)) return t
  const s = b.subarray(4, 12).toString('latin1'), r = b.subarray(0, 4).toString('latin1'), w = b.subarray(8, 12).toString('latin1')
  if (s.startsWith('ftyp')) return /^ftyp(avif|avis|heic|heix|mif1)/.test(s) ? 'avif/heic' : 'mp4/mov'
  if (r === 'RIFF' && /^(WEBP|AVI |WAVE)$/.test(w)) return w.trim().toLowerCase()
  if (b.subarray(257, 262).toString('latin1') === 'ustar') return 'tar'
  if (/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(b.subarray(0, 512).toString('utf8'))) return 'svg'
  return null }
const typeOf = (f, b) => sniff(b) || ({ jpg: 'jpeg', svgz: 'svg', tgz: 'gzip', gz: 'gzip' }[(EXT.exec(f)?.[1] || '').toLowerCase()] ?? ((EXT.exec(f)?.[1] || '').toLowerCase() || null))
// security.b's SVG content check: no script, no on* handlers, no javascript: or data: URLs, no foreignObject,
// iframe or embed, no external href, at most 50 KB.
const svgSafe = b => { const t = b.toString('utf8'); return b.length <= 51200 && !/<script|\son[a-z]+\s*=|javascript:|data:|<foreignObject|<iframe|<embed|(xlink:)?href\s*=\s*["']\s*(https?:)?\/\//i.test(t) }
const PICTURE = /^(png|jpeg|gif|webp|ico)$/
let exempt = [], cap = Infinity; try { const m = JSON.parse(fs.readFileSync('abp/policies.json', 'utf8')).media || {}; exempt = m.exempt || []; cap = m.exempt_total_bytes ?? Infinity } catch {}
const glob = g => new RegExp('^' + g.split(/(\*\*\/?|\*)/).map(t => t[1] === '*' ? '.*' : t === '*' ? '[^/]*' : t.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('') + '$')
const allowed = (f, t, blob) => { const e = exempt.find(x => glob(x.glob).test(f)); if (!e) return [false, null]
  const typeOk = t === 'svg' ? (e.types || []).includes('svg') && svgSafe(blob) : PICTURE.test(t) && (!e.types || e.types.includes(t))
  return [typeOk && blob.length <= (e.max_bytes ?? 0), e] }
const args = process.argv.slice(2), staged = args[0] === '--staged', head = staged ? null : (args[1] || 'HEAD')
const read = f => { try { return staged ? git('show', `:${f}`) : git('show', `${head}:${f}`) } catch { return Buffer.alloc(0) } }
const names = (staged ? git('diff', '--cached', '--name-only', '--diff-filter=AMR', '-z') : git('diff', '--name-only', '--diff-filter=AMR', '-z', `${args[0]}..${head}`)).toString().split('\0').filter(Boolean)
const found = []
for (const f of names) {
  const blob = read(f), t = typeOf(f, blob.subarray(0, 512)); if (!t) continue
  const [ok, e] = allowed(f, t, blob); if (ok) continue
  found.push(`${f} (${t}, ${blob.length} bytes)${e ? ': in an exception path, but not a small picture within its limit' : ''}`)
}
// The cap is over every exempt picture in the resulting tree, not just this push, so pushes cannot add up past it.
let total = 0
const tree = (staged ? git('ls-files', '-z') : git('ls-tree', '-r', '-z', '--name-only', head)).toString().split('\0').filter(Boolean)
for (const f of tree) { if (!exempt.some(x => glob(x.glob).test(f))) continue
  const blob = read(f), t = typeOf(f, blob.subarray(0, 512)); if (t && allowed(f, t, blob)[0]) total += blob.length }
if (total > cap) found.push(`exempt pictures in the tree total ${total} bytes, above the ${cap}-byte cap`)
if (found.length) { console.error(`media-check: ${found.length} refused; images, video, audio and archives go to a vault, never to Git:\n  ${found.join('\n  ')}`); process.exit(1) }
console.log(`media-check: ${names.length} file(s) checked, none refused; exempt pictures in the tree: ${total} bytes${cap < Infinity ? ` of ${cap}` : ''}`)
