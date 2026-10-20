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

  // Click ENTER MELA
  await new Promise(r => setTimeout(r, 1000));
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.gold-button')?.click()`
  });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Test Balloon Shooting
  console.log('Testing Balloon Shooting game...');
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const eng = window.__melaEngine;
      if (!eng) return { error: 'Engine not found on window' };
      const interactable = eng.world?.interactables?.find(i => i.id === 'balloon');
      if (interactable) {
        eng.beginGame('balloon', interactable);
        return { success: true, shots: eng.game?.shots };
      }
      return { error: 'Interactable balloon not found' };
    })()`,
    returnByValue: true
  });
  console.log('BeginGame result:', res.result.value);
  // Wait 1.5s
  await new Promise(r => setTimeout(r, 1500));
  const shotBalloon = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('balloon_game.png', Buffer.from(shotBalloon.data, 'base64'));
  console.log('Saved balloon_game.png');

  // Let's check activity HUD or crosshair
  const balloonState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const act = document.querySelector('.activity-hud');
      const crosshair = document.querySelector('.crosshair');
      return { activityHud: act?.textContent, crosshairFound: !!crosshair };
    })()`,
    returnByValue: true
  });
  console.log('Balloon Game State:', balloonState.result.value);

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
