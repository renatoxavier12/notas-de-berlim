export default function handler(req, res) {
  const { code } = req.query

  if (!code) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: `https://notasdeberlim.com/api/auth`,
      scope: 'repo',
    })
    return res.redirect(`https://github.com/login/oauth/authorize?${params}`)
  }

  // Troca o code pelo token
  fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
    .then(r => r.json())
    .then(data => {
      const token = data.access_token
      res.setHeader('Content-Type', 'text/html')
      res.send(`
        <script>
          const receiveMessage = (message) => {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
              message.origin
            )
            window.removeEventListener('message', receiveMessage, false)
          }
          window.addEventListener('message', receiveMessage, false)
          window.opener.postMessage('authorizing:github', '*')
        </script>
      `)
    })
    .catch(() => res.status(500).send('Erro de autenticação'))
}
