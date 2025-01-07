const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const port = 3008;

// Middleware para manejar JSON
app.use(bodyParser.json());

// Crear un servidor HTTP y asociar WebSocket
const server = http.createServer(app);
const io = new Server(server);

let printerClients = []; // Almacena clientes conectados

// Endpoint para imprimir
app.post('/print', (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).send({ error: 'El contenido a imprimir es obligatorio.' });
  }

  if (printerClients.length === 0) {
    return res.status(500).send({ error: 'No hay impresoras locales conectadas.' });
  }

  // Enviar el contenido a los clientes conectados
  printerClients.forEach((socket) => {
    socket.emit('print', { content });
  });

  res.send({ success: true, message: 'Solicitud de impresión enviada a las impresoras locales.' });
});

// Manejar conexión de clientes locales
io.on('connection', (socket) => {
  console.log('Cliente local conectado');
  printerClients.push(socket);

  socket.on('disconnect', () => {
    console.log('Cliente local desconectado');
    printerClients = printerClients.filter((client) => client !== socket);
  });
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en ${port}`);
});
