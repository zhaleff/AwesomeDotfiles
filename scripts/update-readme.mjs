import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const README_PATH = process.env.README_PATH || 'README.md'

const START_MARKER = '<!-- RICES:START -->'
const END_MARKER = '<!-- RICES:END -->'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function fetchRices() {
  const { data, error } = await supabase
    .from('rices')
    .select('title, author, github_url, wm, distro, description, created_at')
    .eq('status', 'approved')
    .order('wm', { ascending: true })
    .order('distro', { ascending: true })

  if (error) throw error
  return data
}

function groupByWmThenDistro(rices) {
  const grouped = {}
  for (const rice of rices) {
    const wm = rice.wm || 'Other'
    const distro = rice.distro || 'Other'
    grouped[wm] ??= {}
    grouped[wm][distro] ??= []
    grouped[wm][distro].push(rice)
  }
  return grouped
}

function repoNameFromUrl(url) {
  try {
    const u = new URL(url)
    const parts = u.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')
    return parts.slice(0, 2).join('/')
  } catch {
    return url
  }
}

function renderRice(rice) {
  const repoLabel = rice.github_url ? repoNameFromUrl(rice.github_url) : rice.title
  const link = rice.github_url
    ? `**[${repoLabel}](${rice.github_url})**`
    : `**${rice.title}**`

  const author = rice.author ? ` — \`${rice.author}\`` : ''
  const desc = rice.description ? `\n  ${rice.description}` : ''

  return `- ${link}${author}  ${desc}`
}

function renderMarkdown(grouped) {
  const wmNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b))
  const lines = []

  for (const wm of wmNames) {
    lines.push(`### ${wm}`)
    lines.push('')

    const distroNames = Object.keys(grouped[wm]).sort((a, b) => a.localeCompare(b))
    for (const distro of distroNames) {
      lines.push(`<details>`)
      lines.push(`<summary><strong>${distro}</strong> (${grouped[wm][distro].length})</summary>`)
      lines.push('')
      for (const rice of grouped[wm][distro]) {
        lines.push(renderRice(rice))
      }
      lines.push('')
      lines.push(`</details>`)
      lines.push('')
    }
  }

  return lines.join('\n').trim()
}

function updateReadme(markdown) {
  const readme = readFileSync(README_PATH, 'utf-8')

  if (!readme.includes(START_MARKER) || !readme.includes(END_MARKER)) {
    console.error(`README is missing ${START_MARKER} / ${END_MARKER} markers.`)
    process.exit(1)
  }

  const before = readme.split(START_MARKER)[0]
  const after = readme.split(END_MARKER)[1]

  const updated = `${before}${START_MARKER}\n\n${markdown}\n\n${END_MARKER}${after}`

  if (updated === readme) {
    console.log('No changes.')
    return false
  }

  writeFileSync(README_PATH, updated, 'utf-8')
  console.log('README updated.')
  return true
}

async function main() {
  const rices = await fetchRices()
  console.log(`Fetched ${rices.length} approved rices.`)

  const grouped = groupByWmThenDistro(rices)
  const markdown = renderMarkdown(grouped)

  updateReadme(markdown)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
