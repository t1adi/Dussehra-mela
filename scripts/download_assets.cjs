const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'public', 'assets', 'optimized');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function download(urlPath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(urlPath);
    const dest = path.join(dir, filename);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      console.log('Already exists:', filename);
      return resolve();
    }
    const fullUrl = 'https://melachaloge.online' + urlPath;
    const file = fs.createWriteStream(dest);
    https.get(fullUrl, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`Failed to download ${fullUrl}: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log('Downloaded:', filename);
          resolve();
        });
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  await download('/assets/optimized/panorama-c20ba02aa128.webp');
  await download('/assets/optimized/stallAtlas-fa1b53076153.webp');
  await download('/assets/optimized/voices-70beec65d9ca.json');

  const voicesJson = JSON.parse(fs.readFileSync(path.join(dir, 'voices-70beec65d9ca.json'), 'utf8'));
  const clips = Object.values(voicesJson.clips).map(c => c.audio);
  console.log(`Downloading ${clips.length} voice clips...`);
  for (const clip of clips) {
    await download(clip);
  }
  console.log('All downloads complete!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
