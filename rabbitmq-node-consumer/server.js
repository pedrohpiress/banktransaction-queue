const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const amqp = require('amqplib');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const RABBITMQ_CONFIG = {
  url: 'amqp://admin:123@localhost:5672',
  exchange: 'banco.exchange',
  queue: 'transacao.queue'
};

let connection = null;
let channel = null;
let transacoes = [];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_CONFIG.url);
    channel = await connection.createChannel();
    await channel.assertQueue(RABBITMQ_CONFIG.queue, { durable: true });
    console.log('✅ RabbitMQ conectado');
    
    await channel.consume(RABBITMQ_CONFIG.queue, (message) => {
      if (message !== null) {
        try {
          let content = message.content.toString();
          
          // Se o conteúdo começar e terminar com aspas, é uma string JSON escapada
          if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1).replace(/\\"/g, '"');
          }
          
          const data = JSON.parse(content);
          
          const transacao = {
            nomeCliente: data.nomeCliente || 'N/A',
            tipo: data.tipo || 'N/A',
            valor: Number(data.valor) || 0,
            data: data.data || new Date().toLocaleDateString('pt-BR'),
            timestampRecebimento: new Date().toISOString()
          };
          
          transacoes.unshift(transacao);
          
          if (transacoes.length > 100) {
            transacoes = transacoes.slice(0, 100);
          }
          
          io.emit('nova-transacao', transacao);
          io.emit('lista-transacoes', transacoes);
          
          console.log(`Transação: ${transacao.nomeCliente} - ${transacao.tipo} - ${formatCurrency(transacao.valor)}`);
          
        } catch (error) {
          console.error('Erro:', error.message);
        }
        
        channel.ack(message);
      }
    });
    console.log('✅ RabbitMQ conectado');
    
  } catch (error) {
    console.error('Erro RabbitMQ:', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html não encontrado');
  }
});

app.get('/api/transacoes', (req, res) => {
  res.json(transacoes);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: connection ? 'conectado' : 'desconectado',
    totalTransacoes: transacoes.length,
    ultimaTransacao: transacoes.length > 0 ? transacoes[0] : null
  });
});

app.post('/api/limpar-transacoes', (req, res) => {
  transacoes.length = 0;
  io.emit('transacoes-limpas');
  io.emit('lista-transacoes', transacoes);
  res.json({ success: true, message: 'Transações limpas' });
});

io.on('connection', (socket) => {
  socket.emit('lista-transacoes', transacoes);
  socket.on('disconnect', () => {});
});

process.on('SIGINT', async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, (err) => {
  if (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
  
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  connectRabbitMQ();
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} em uso. Tente: PORT=3001 node server.js`);
  } else {
    console.error('Erro no servidor:', err);
  }
  process.exit(1);
});