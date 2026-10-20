const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800',
    'http://localhost:5173/'
  ]);

  console.log('Chrome launched, waiting for debugger...');
  await new Promise(r => setTimeout(r, 2000));

  // Fetch /json/list from debugger
  http.get('http://127.0.0.1:9222/json/list', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', async () => {
      try {
        const pages = JSON.parse(data);
        console.log('Debugger pages:', pages.map(p => ({ title: p.title, url: p.url })));
      } catch (e) {
        console.error(e);
      }
      chrome.kill();
      process.exit(0);
    });
  }).on('error', err => {
    console.error('Debugger connection error:', err);
    chrome.kill();
    process.exit(1);
  });
}

run();
