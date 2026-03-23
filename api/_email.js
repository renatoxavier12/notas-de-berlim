/* global process */

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripMarkdown(value = '') {
  return value
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractEdition(markdown) {
  const titleMatch = markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)
  const capaMatch = markdown.match(/^capa:\s*(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Nova edição'
  const capa = capaMatch ? capaMatch[1].trim() : null
  const body = markdown.replace(/^---[\s\S]*?---\n?/, '').trim()
  const paragraphs = body
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && paragraph !== '---')

  return { title, capa, paragraphs }
}

function renderParagraph(paragraph) {
  if (paragraph.startsWith('#')) {
    return `<h2 style="font-size:20px;margin:28px 0 12px;font-family:Georgia,serif;font-weight:700;">${escapeHtml(
      paragraph.replace(/^#+\s*/, '')
    )}</h2>`
  }

  return `<p style="margin:0 0 18px;line-height:1.75;font-size:18px;">${escapeHtml(paragraph)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')}</p>`
}

export function getEmailConfig() {
  return {
    fromName: process.env.EMAIL_FROM_NAME || 'Renato Xavier',
    fromEmail: process.env.EMAIL_FROM_EMAIL || 'renatoxavier12@gmail.com',
    replyToEmail: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM_EMAIL || 'renatoxavier12@gmail.com',
    testToEmail: process.env.EMAIL_TEST_TO || 'renatoxavier12@gmail.com',
    testToName: process.env.EMAIL_TEST_TO_NAME || 'Renato Xavier',
  }
}

export function buildEmailContent(markdown, slug) {
  const { title, capa, paragraphs } = extractEdition(markdown)
  const introParagraphs = paragraphs.slice(0, 2)
  const previewText = stripMarkdown(introParagraphs.join(' ')).slice(0, 140) || `Nova edição: ${title}`
  const htmlBody = introParagraphs.map(renderParagraph).join('\n')
  const textBody = introParagraphs.map((paragraph) => stripMarkdown(paragraph)).join('\n\n')
  const editionUrl = `https://notasdeberlim.com/edicoes/${slug}`
  const capaHtml = capa
    ? `<div style="margin:0 0 28px;"><img src="https://notasdeberlim.com${capa}" alt="${escapeHtml(
        title
      )}" style="width:100%;max-width:600px;height:auto;display:block;"></div>`
    : ''

  return {
    title,
    subject: `${title} | Notas de Berlim`,
    previewText,
    html: `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fcfbf7;color:#1a1a1a;font-family:Georgia,serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(previewText)}
  </div>

  <div style="max-width:640px;margin:0 auto;padding:28px 20px;">
    <header style="margin:0 0 28px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:#6b6b6b;font-family:Arial,sans-serif;">
        Notas de Berlim
      </p>
      <h1 style="margin:0;font-size:34px;line-height:1.15;font-weight:700;">${escapeHtml(title)}</h1>
    </header>

    ${capaHtml}

    <div style="color:#1f1f1f;">
      ${htmlBody}
    </div>

    <div style="margin-top:40px;padding-top:32px;border-top:1px solid #dedad2;">
      <a href="${editionUrl}" style="background-color:#F0D722;color:#000000;padding:14px 24px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">
        Ler no site &rarr;
      </a>
    </div>

    <footer style="margin-top:36px;padding-top:18px;color:#5f5f5f;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
      <p style="margin:0 0 8px;">Você recebeu este e-mail porque se inscreveu na newsletter Entrelace.</p>
      <p style="margin:0;">Renato Xavier, Berlim.</p>
    </footer>
  </div>
</body>
</html>`,
    text: `${title}\n\n${textBody}\n\nContinue lendo: ${editionUrl}\n\nRenato Xavier, Berlim.`,
  }
}
