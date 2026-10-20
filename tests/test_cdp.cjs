const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

  console.log('Chrome launched...');
  await new Promise(r => setTimeout(r, 2500));

  // Get debug target
  const pageTarget = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        const pages = JSON.parse(d);
        const target = pages.find(p => p.url.includes('localhost:5173'));
        resolve(target);
      });
    }).on('error', reject);
  });

  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    console.error('Target not found!');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connecting to target:', pageTarget.title);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  // Enable Console and Runtime
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Console.enable');

  const logs = [];
  const errors = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Console.messageAdded') {
      logs.push(msg.params.message);
      console.log('[Browser Console]', msg.params.message.level, msg.params.message.text);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails);
      console.error('[Browser Exception]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
    }
  });

  // Wait 3 seconds for Three.js and Welcome UI
  console.log('Waiting 3s for scene initialization...');
  await new Promise(r => setTimeout(r, 3000));

  // Check DOM state
  const evalResult = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const welcome = document.querySelector('.welcome');
      const goldButton = document.querySelector('.gold-button');
      const canvas = document.querySelector('canvas');
      return {
        welcomeFound: !!welcome,
        goldButtonText: goldButton ? goldButton.textContent : null,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
        bodyClasses: document.body.className
      };
    })()`,
    returnByValue: true
  });
  console.log('DOM State:', evalResult.result.value);

  // Take screenshot 1: Welcome Screen
  const shot1 = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('welcome_screen.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved welcome_screen.png');

  // Click ENTER MELA button
  console.log('Clicking "ENTER MELA →"...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.gold-button');
      if (btn) btn.click();
    })()`
  });

  // Wait 2.5 seconds for entrance gate walk / HUD
  await new Promise(r => setTimeout(r, 2500));

  // Check in-game state
  const inGameResult = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const hudTop = document.querySelector('.hud-top');
      const locationHud = document.querySelector('.location-hud');
      const minimap = document.querySelector('.minimap');
      const walkTip = document.querySelector('.walk-tip');
      return {
        hudTopFound: !!hudTop,
        locationHudText: locationHud ? locationHud.textContent : null,
        minimapFound: !!minimap,
        walkTipText: walkTip ? walkTip.textContent : null
      };
    })()`,
    returnByValue: true
  });
  console.log('In-Game State:', inGameResult.result.value);

  // Take screenshot 2: In-Game Walking Screen
  const shot2 = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('ingame_fairground.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved ingame_fairground.png');

  ws.close();
  chrome.kill();

  console.log('Total Console Messages:', logs.length);
  console.log('Total Exceptions:', errors.length);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
