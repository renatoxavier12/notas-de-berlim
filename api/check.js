export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const brevoRes = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      { headers: { 'api-key': process.env.BREVO_API_KEY } }
    );

    if (brevoRes.ok) {
      const data = await brevoRes.json();
      const listId = Number(process.env.BREVO_LIST_ID);
      const isSubscribed = data.listIds && data.listIds.includes(listId);
      return res.status(200).json({ isSubscribed, listIds: data.listIds });
    } else {
      return res.status(brevoRes.status).json({ error: 'Not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
