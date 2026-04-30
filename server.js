const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  fs.readFile('login.html', (err, data) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(data);
    res.end();
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});