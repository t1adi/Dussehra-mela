const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const pageTarget = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        const pages = JSON.parse(d);
        resolve(pages.find(p => p.url.includes('localhost:5173')));
      });
    }).on('error', reject);
  });

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await sendCDP(ws, 'Runtime.enable');

  // Enter Mela
  await new Promise(r => setTimeout(r, 1000));
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.gold-button')?.click()`
  });
  await new Promise(r => setTimeout(r, 1500));

  // Trigger Finale
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `window.__melaEngine?.startFinale()`
  });

  // Wait 6 seconds for countdown (3s) + arrow hit (1.5s) + burning & fireworks (1.5s)
  console.log('Waiting 6s for Ravana Dahan burn & fireworks...');
  await new Promise(r => setTimeout(r, 6000));

  const shotBurn = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('ravana_burning_fireworks.png', Buffer.from(shotBurn.data, 'base64'));
  console.log('Saved ravana_burning_fireworks.png');

  // Wait another 3s for finale celebration card
  await new Promise(r => setTimeout(r, 3000));
  const shotCard = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('ravana_finale_card.png', Buffer.from(shotCard.data, 'base64'));
  console.log('Saved ravana_finale_card.png');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run();
