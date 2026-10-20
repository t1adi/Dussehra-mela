const http = require('http');

const urls = [
  '/assets/optimized/panorama-c20ba02aa128.webp',
  '/assets/optimized/stallAtlas-fa1b53076153.webp',
  '/assets/optimized/voices-70beec65d9ca.json',
  '/assets/optimized/voice-b050b028b692.mp3',
  '/favicon.svg',
  '/favicon.ico',
];

async function check() {
  for (const u of urls) {
    await new Promise(resolve => {
      http.get('http://localhost:5173' + u, res => {
        console.log(u, res.statusCode, res.headers['content-type'], res.headers['content-length']);
        resolve();
      }).on('error', err => {
        console.error(u, err.message);
        resolve();
      });
    });
  }
}

check();
