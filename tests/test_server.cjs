const http = require('http');

http.get('http://localhost:5173/', res => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Title:', data.match(/<title>.*?<\/title>/)?.[0]);
    console.log('Root div present:', data.includes('<div id="root">'));
  });
}).on('error', err => {
  console.error('Request error:', err.message);
});
