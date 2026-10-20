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

  // 1. Enter Mela
  await new Promise(r => setTimeout(r, 1000));
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.gold-button')?.click()`
  });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Test Food Stall Dialogue (Sharma Ji Ki Chaat)
  console.log('Testing Food Stall...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const eng = window.__melaEngine;
      const stall = eng?.world?.interactables?.find(i => i.id === 'food-0');
      if (stall) eng.events?.onTalk?.(stall);
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));
  const shotFood = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('feature_food_stall.png', Buffer.from(shotFood.data, 'base64'));
  console.log('Saved feature_food_stall.png');

  // Close modal
  await sendCDP(ws, 'Runtime.evaluate', { expression: `document.querySelector('.panel-close')?.click()` });
  await new Promise(r => setTimeout(r, 500));

  // 3. Test Ferris Wheel Ride
  console.log('Testing Ferris Wheel Ride...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const eng = window.__melaEngine;
      eng?.boardRide('wheel');
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));
  const shotRide = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('feature_ferris_ride.png', Buffer.from(shotRide.data, 'base64'));
  console.log('Saved feature_ferris_ride.png');

  // Exit ride
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.activity-hud button, .ride-exit')?.click()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. Test Maut Ka Kuan
  console.log('Testing Maut Ka Kuan...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const eng = window.__melaEngine;
      eng?.startWell(false);
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  const shotWell = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('feature_maut_ka_kuan.png', Buffer.from(shotWell.data, 'base64'));
  console.log('Saved feature_maut_ka_kuan.png');

  // Exit well
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.activity-hud button')?.click()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 5. Test Ram Leela
  console.log('Testing Ram Leela...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const eng = window.__melaEngine;
      eng?.enterStage();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  const shotStage = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('feature_ram_leela.png', Buffer.from(shotStage.data, 'base64'));
  console.log('Saved feature_ram_leela.png');

  // Exit stage
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.activity-hud button')?.click()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 6. Test Ravana Dahan Finale
  console.log('Testing Ravana Dahan Finale...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const eng = window.__melaEngine;
      eng?.startFinale();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));
  const shotFinale = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('feature_ravana_dahan.png', Buffer.from(shotFinale.data, 'base64'));
  console.log('Saved feature_ravana_dahan.png');

  // 7. Test Mela Bag Modal
  console.log('Testing Mela Bag Modal...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // Find button containing 'Bag'
      const btns = Array.from(document.querySelectorAll('button'));
      const bagBtn = btns.find(b => b.textContent.includes('Bag'));
      if (bagBtn) bagBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotBag = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('feature_mela_bag.png', Buffer.from(shotBag.data, 'base64'));
  console.log('Saved feature_mela_bag.png');

  // 8. Test Invite / Share Card Modal
  console.log('Testing Share Modal...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const shareBtn = btns.find(b => b.textContent.includes('Photo') || b.textContent.includes('Doston ko bulao'));
      if (shareBtn) shareBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  const shotShare = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('feature_share_card.png', Buffer.from(shotShare.data, 'base64'));
  console.log('Saved feature_share_card.png');

  ws.close();
  chrome.kill();
  console.log('All feature tests completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
