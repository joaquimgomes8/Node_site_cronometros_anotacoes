const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Define qual arquivo carregar com base na URL
  let filePath = req.url === '/' ? 'login.html' : req.url.substring(1);
  
  // Proteção básica para evitar que o usuário saia da pasta do projeto
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Se o arquivo não existir (ex: favicon ou erro de digitação)
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Arquivo nao encontrado');
      return;
    }

    // Define o Content-Type correto baseado na extensão
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.png') contentType = 'image/png';

    res.writeHead(200, { 'Content-Type': contentType });
    res.write(data);
    res.end();
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});