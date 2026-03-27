
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

async function kv(command, ...args) {
  const response = await fetch(`${KV_REST_API_URL}/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export default async function handler(req, res) {
  const { action, slug, id } = req.query;

  // GET: Listar comentários (público ou admin)
  if (req.method === 'GET') {
    try {
      if (action === 'admin_list') {
        // Proteção: requer secret do admin
        const secret = req.headers['x-admin-secret'] || req.query.secret;
        if (secret !== process.env.GITHUB_WEBHOOK_SECRET) {
          return res.status(401).json({ error: 'Não autorizado' });
        }
        const keys = await kv('keys', 'comment:*');
        const comments = [];
        for (const key of keys) {
          const c = await kv('get', key);
          comments.push(JSON.parse(c));
        }
        return res.status(200).json(comments.sort((a, b) => b.timestamp - a.timestamp));
      }

      // Listagem pública (apenas aprovados por slug)
      const keys = await kv('keys', `comment:${slug}:*`);
      const comments = [];
      for (const key of keys) {
        const c = await kv('get', key);
        const parsed = JSON.parse(c);
        if (parsed.approved) {
          comments.push(parsed);
        }
      }
      return res.status(200).json(comments.sort((a, b) => a.timestamp - b.timestamp));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST: Enviar novo comentário ou moderar
  if (req.method === 'POST') {
    try {
      if (action === 'approve' || action === 'delete') {
        // Moderação via Admin — requer secret
        if (req.headers['x-admin-secret'] !== process.env.GITHUB_WEBHOOK_SECRET) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const key = `comment:${slug}:${id}`;
        if (action === 'delete') {
          await kv('del', key);
          return res.status(200).json({ success: true });
        }
        const c = await kv('get', key);
        if (!c) return res.status(404).json({ error: 'Não encontrado' });
        const parsed = JSON.parse(c);
        parsed.approved = true;
        await kv('set', key, JSON.stringify(parsed));
        return res.status(200).json({ success: true });
      }

      // Novo comentário
      const { name, text, email, honeypot } = req.body;

      // Honeypot check (spam protection)
      if (honeypot) {
        return res.status(200).json({ success: true, note: 'Spam filtered' });
      }

      if (!text || text.length < 3) {
        return res.status(400).json({ error: 'Comentário muito curto.' });
      }

      const commentId = Date.now().toString();
      const newComment = {
        id: commentId,
        slug,
        name: name || 'Anônimo',
        text,
        timestamp: Date.now(),
        approved: false, // Requer moderação
      };

      await kv('set', `comment:${slug}:${commentId}`, JSON.stringify(newComment));

      // Notifica o autor por email via Brevo (opcional mas recomendado)
      if (process.env.BREVO_API_KEY) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Notas de Berlim', email: 'renatoxavier12@gmail.com' },
            to: [{ email: 'renatoxavier12@gmail.com' }],
            subject: 'Novo comentário pendente no Notas de Berlim',
            htmlContent: `
              <div style="font-family:monospace;">
                <p><strong>De:</strong> ${name || 'Anônimo'}</p>
                <p><strong>Post:</strong> ${slug}</p>
                <p><strong>Comentário:</strong> ${text}</p>
                <hr>
                <a href="https://notasdeberlim.com/painel-x7k2" style="background:#000;color:#fff;padding:10px;text-decoration:none;">Aprovar no Admin</a>
              </div>
            `,
          }),
        }).catch(() => {});
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
