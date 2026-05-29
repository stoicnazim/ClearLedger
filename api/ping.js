export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const chunks = [];
  req.on('data', chunk => { chunks.push(chunk); });
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      headers[k] = v;
    }
    res.status(200).json({ method: req.method, body, bodyLength: body.length, headers, chunkCount: chunks.length });
  });
}
