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

  await new Promise(r => setTimeout(r, 2500));

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

  // Wait for load & click Enter Mela
  await new Promise(r => setTimeout(r, 1500));
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.gold-button')?.click()`
  });
  await new Promise(r => setTimeout(r, 1500));

  // Now press 'KeyW' to walk forward for 3 seconds
  console.log('Walking forward...');
  await sendCDP(ws, 'Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyW', key: 'w' });
  await new Promise(r => setTimeout(r, 3000));
  await sendCDP(ws, 'Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyW', key: 'w' });

  await new Promise(r => setTimeout(r, 500));

  // Check state and location badge
  const info = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const loc = document.querySelector('.location-hud')?.textContent;
      const interactPrompt = document.querySelector('.interact-prompt')?.textContent;
      const conversation = document.querySelector('.conversation');
      return {
        location: loc,
        interactPrompt: interactPrompt,
        conversationOpen: !!conversation
      };
    })()`,
    returnByValue: true
  });
  console.log('Position / Interaction Info:', info.result.value);

  // Take screenshot of walk position
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('walk_position.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved walk_position.png');

  // If interact prompt is available, press 'E' or click it
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const prompt = document.querySelector('.interact-prompt');
      if (prompt) prompt.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check dialog/conversation
  const convo = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const c = document.querySelector('.conversation');
      const title = c?.querySelector('.convo-title')?.textContent;
      const speech = c?.querySelector('.convo-speech')?.textContent;
      const choices = Array.from(c?.querySelectorAll('.convo-choice') || []).map(b => b.textContent);
      return { open: !!c, title, speech, choices };
    })()`,
    returnByValue: true
  });
  console.log('Conversation Dialog:', convo.result.value);

  if (convo.result.value.open) {
    const shotConvo = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('convo_screenshot.png', Buffer.from(shotConvo.data, 'base64'));
    console.log('Saved convo_screenshot.png');
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
