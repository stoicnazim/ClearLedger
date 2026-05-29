export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    res.status(200).json({ method: req.method, body, bodyLength: body.length });
  });
}
