export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [Number(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
      }),
    });

    if (brevoRes.ok || brevoRes.status === 204) {
      // Notifica o autor por email
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Notas de Berlim', email: 'renatoxavier12@gmail.com' },
          to: [{ email: 'renatoxavier12@gmail.com' }],
          subject: 'Novo inscrito no Notas de Berlim',
          htmlContent: `<p style="font-family:monospace;">Novo inscrito: <strong>${email}</strong></p>`,
        }),
      }).catch(() => {}) // silencioso se falhar

      return res.status(200).json({ success: true });
    } else {
      const data = await brevoRes.json();
      return res.status(brevoRes.status).json(data);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
