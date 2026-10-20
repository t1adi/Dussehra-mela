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
    '--window-size=390,844',
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

  // Set device emulation for mobile touch
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sendCDP(ws, 'Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5
  });

  // Wait 1s and capture mobile welcome
  await new Promise(r => setTimeout(r, 1000));
  const shotMobWelcome = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('mobile_welcome.png', Buffer.from(shotMobWelcome.data, 'base64'));
  console.log('Saved mobile_welcome.png');

  // Tap ENTER MELA
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.gold-button')?.click()`
  });
  // Wait 3.5 seconds for entering transition to complete into walk mode
  await new Promise(r => setTimeout(r, 3500));

  // Capture mobile in-game
  const shotMobInGame = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('mobile_ingame.png', Buffer.from(shotMobInGame.data, 'base64'));
  console.log('Saved mobile_ingame.png');

  // Check mobile controls existence
  const mobControls = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const joystick = document.querySelector('.joystick');
      const runBtn = document.querySelector('.run-button');
      const touchHint = document.querySelector('.touch-look-hint');
      return {
        joystickFound: !!joystick,
        runBtnFound: !!runBtn,
        touchHintText: touchHint ? touchHint.textContent : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile Controls:', mobControls.result.value);

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
