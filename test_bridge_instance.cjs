const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const distDir = 'C:/Users/rajku/Downloads/git/PocketPort_game/dist';

const server = http.createServer((req, res) => {
  if (req.url === '/check') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      console.log('WINDOW.BRIDGE CHECK RESULT:', body);
      res.writeHead(200);
      res.end();
    });
    return;
  }

  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end();
    return;
  }
  let content = fs.readFileSync(filePath);
  if (req.url === '/' || req.url === '/index.html') {
    let html = content.toString();
    const checker = `<script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          const res = {
            hasWindowBridge: !!window.bridge,
            isWindowBridgeInit: window.bridge ? window.bridge.isInitialized : false,
            platform: window.bridge ? window.bridge.platform?.id : null
          };
          fetch('/check', { method: 'POST', body: JSON.stringify(res) });
        }, 1000);
      });
    </script>`;
    html = html.replace('</body>', checker + '</body>');
    content = Buffer.from(html);
  }
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  res.end(content);
});

server.listen(5182, () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  execFile(chromePath, [
    '--headless=new',
    '--virtual-time-budget=5000',
    'http://localhost:5182/'
  ], (err) => {
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 2000);
  });
});
