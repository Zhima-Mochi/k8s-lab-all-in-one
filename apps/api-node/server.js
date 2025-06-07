const express = require('express');
const os = require('os');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from api-node!');
});

app.get('/api/info', (req, res) => {
  res.json({
    version: '1.0.0',
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
    message: 'API Node is running smoothly!'
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`api-node listening at http://localhost:${port}`);
});
