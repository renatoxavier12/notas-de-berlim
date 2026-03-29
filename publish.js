#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, renameSync, readdirSync, readFileSync, writeFileSync, unlinkSync, copyFileSync, mkdirSync, rmSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import { buildEmailContent, getEmailConfig } from './src/lib/_email.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DRAFTS    = join(__dirname, 'drafts')
const IMAGES    = join(__dirname, 'drafts/images')
const PUBLIC    = join(__dirname, 'public')
const PUBLISHED = join(__dirname, 'src/edicoes')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

// ── Helpers ─────────────────────────────────────────────

function isImage(filename) {
  return IMAGE_EXTS.has(extname(filename).toLowerCase())
}

// Copy all images from drafts/images/ to public/
// Returns { capaPublicPath } if a cover image was found
function publishImages(slug) {
  mkdirSync(IMAGES, { recursive: true })

  const files = readdirSync(IMAGES).filter(isImage)
  if (files.length === 0) return {}

  let capaPublicPath = null

  for (const file of files) {
    const ext      = extname(file).toLowerCase()
    const isCover  = basename(file, ext).toLowerCase() === 'capa'
    const destName = isCover ? `capa-${slug}${ext}` : file
    const dest     = join(PUBLIC, destName)

    copyFileSync(join(IMAGES, file), dest)
    console.log(`✓ Image: drafts/images/${file} → public/${destName}`)

    if (isCover) capaPublicPath = `/${destName}`
  }

  // Clean up drafts/images/
  for (const file of files) unlinkSync(join(IMAGES, file))

  return { capaPublicPath }
}

// Update image refs in markdown from old prefix to new prefix
function updateImageRefs(markdown, oldPrefix, newPrefix) {
  // Matches ![alt](path) and ![alt](path "title")
  return markdown.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      if (src.startsWith(oldPrefix)) {
        const filename = basename(src)
        return `![${alt}](${newPrefix}${filename})`
      }
      return match
    }
  )
}

// ── List drafts if no argument ───────────────────────────
const filename = process.argv[2]

if (!filename) {
  const drafts = readdirSync(DRAFTS).filter(f => f.endsWith('.md') || f.endsWith('.docx'))
  if (drafts.length === 0) {
    console.log('\nNo drafts found in drafts/\n')
  } else {
    console.log('\nAvailable drafts:\n')
    drafts.forEach(f => console.log(`  • ${f}`))
    console.log('\nUsage: npm run publish -- <filename>\n')
  }
  process.exit(0)
}

// ── Resolve paths ────────────────────────────────────────
const isDocx  = filename.endsWith('.docx')
const mdFile  = isDocx ? filename.replace('.docx', '.md') : (filename.endsWith('.md') ? filename : `${filename}.md`)
const slug    = basename(mdFile, '.md')
const mdDraft = join(DRAFTS, mdFile)
const mdFinal = join(PUBLISHED, mdFile)

// ── Convert .docx → .md ──────────────────────────────────
if (isDocx) {
  const docxPath  = join(DRAFTS, filename)
  const mediaTemp = join(DRAFTS, 'images', 'media')

  if (!existsSync(docxPath)) {
    console.error(`\nError: "${filename}" not found in drafts/\n`)
    process.exit(1)
  }

  console.log(`\n⟳ Converting ${filename} → ${mdFile}`)
  mkdirSync(IMAGES, { recursive: true })

  // Pandoc extracts embedded images to drafts/images/media/
  let rawMarkdown = execSync(
    `pandoc "${docxPath}" -t markdown --wrap=none --extract-media="${IMAGES}"`,
    { encoding: 'utf-8' }
  )

  // Flatten drafts/images/media/ → drafts/images/
  if (existsSync(mediaTemp)) {
    for (const f of readdirSync(mediaTemp).filter(isImage)) {
      renameSync(join(mediaTemp, f), join(IMAGES, f))
    }
    rmSync(mediaTemp, { recursive: true })
  }

  // Update image refs: drafts/images/... → /filename
  rawMarkdown = updateImageRefs(rawMarkdown, IMAGES, '/')
  rawMarkdown = updateImageRefs(rawMarkdown, 'drafts/images/', '/')

  // Extract title from first H1, remove it from body
  const titleMatch = rawMarkdown.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : slug
  const body  = rawMarkdown.replace(/^#\s+.+\n?/m, '').trim()

  // Teaser from first plain paragraph
  const teaser = (body.split(/\n\n/)[0] || '')
    .replace(/[*_`#[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

  // Date in Portuguese
  const data = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  // Next ID
  const nextId = readdirSync(PUBLISHED).filter(f => f.endsWith('.md')).length + 1

  // Build .md with frontmatter (capa filled in after image step)
  const frontmatter = `---
id: ${nextId}
title: ${title}
data: ${data}
bairro:
teaser: ${teaser}
capa:
---`

  writeFileSync(mdDraft, `${frontmatter}\n\n${body}\n`, 'utf-8')
  unlinkSync(docxPath)

  console.log(`✓ Converted: ${filename} → drafts/${mdFile}`)
  console.log(`  Title : ${title}`)
  console.log(`  ID    : ${nextId}`)
  console.log(`  Date  : ${data}`)
}

// ── Validate .md draft ───────────────────────────────────
if (!existsSync(mdDraft)) {
  console.error(`\nError: "${mdFile}" not found in drafts/\n`)
  process.exit(1)
}
if (existsSync(mdFinal)) {
  console.error(`\nError: "${mdFile}" already exists in src/edicoes/\n`)
  process.exit(1)
}

// ── Publish images ───────────────────────────────────────
const { capaPublicPath } = publishImages(slug)

// If a cover was found and frontmatter capa is empty, fill it in
if (capaPublicPath) {
  let md = readFileSync(mdDraft, 'utf-8')
  if (/^capa:\s*$/m.test(md)) {
    md = md.replace(/^capa:\s*$/m, `capa: ${capaPublicPath}`)
    writeFileSync(mdDraft, md, 'utf-8')
    console.log(`✓ Cover set: capa: ${capaPublicPath}`)
  }
}

// ── Move draft → published ───────────────────────────────
renameSync(mdDraft, mdFinal)
console.log(`✓ Moved: drafts/${mdFile} → src/edicoes/${mdFile}`)

// ── Build and send newsletter ────────────────────────────
const markdown = readFileSync(mdFinal, 'utf-8')
const email    = buildEmailContent(markdown, slug)
const config   = getEmailConfig()
const listId   = Number(process.env.BREVO_LIST_ID || 2)

console.log(`✓ Email ready: "${email.subject}"`)

if (!process.env.BREVO_API_KEY) {
  console.error('\nError: BREVO_API_KEY not set in .env.local\n')
  process.exit(1)
}

const campaignRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
  method: 'POST',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: `Notas de Berlim — ${email.title}`,
    subject: email.subject,
    sender: { name: config.fromName, email: config.fromEmail },
    type: 'classic',
    htmlContent: email.html,
    textContent: email.text,
    replyTo: config.replyToEmail,
    recipients: { listIds: [listId] },
  }),
})

const campaign = await campaignRes.json()

if (!campaign.id) {
  console.error('\nError: Failed to create Brevo campaign:', JSON.stringify(campaign, null, 2), '\n')
  process.exit(1)
}

console.log(`✓ Campaign created (#${campaign.id})`)

const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaign.id}/sendNow`, {
  method: 'POST',
  headers: { 'api-key': process.env.BREVO_API_KEY },
})

if (!sendRes.ok) {
  const err = await sendRes.json().catch(() => ({}))
  console.error('\nError: Failed to send campaign:', JSON.stringify(err, null, 2), '\n')
  process.exit(1)
}

console.log(`✓ Newsletter sent`)
console.log(`\nPublished successfully: ${slug}\n`)
