const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http"); // Você pode usar https aqui também se quiser suporte SSL

// Cria o servidor WebSocket
const wss = new WebSocket.Server({ port: 8080 });

// Armazena os consumidores conectados
let consumers = [];

// WebSocket Server: Gerencia conexões
wss.on("connection", (ws, req) => {
  console.log("Novo cliente WebSocket conectado");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "consumer") {
      console.log("Novo consumidor registrado");
      consumers.push(ws); // Adiciona consumidores à lista
    }
  });

  // Remove o consumidor se ele se desconectar
  ws.on("close", () => {
    consumers = consumers.filter((consumer) => consumer !== ws);
    console.log("Cliente WebSocket desconectado");
  });
});

// Função para enviar dados para todos os consumidores
const sendToConsumers = (data) => {
  consumers.forEach((consumer) => {
    consumer.send(JSON.stringify({ type: "data", payload: data }));
  });
};

// Configura o servidor HTTPS (usando Express)
const app = express();
app.use(bodyParser.json()); // Para tratar JSON recebido no corpo da requisição

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite requisições de qualquer origem
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE"); // Permite os métodos
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Permite cabeçalhos personalizados
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Responde rápido a requisições OPTIONS (preflight)
  }
  next();
});

// Endpoint que recebe dados via POST e os envia aos consumidores WebSocket
app.post("/send-data", (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).send("Dados ausentes");
  }

  console.log("Dados recebidos via HTTPS:", data);

  // Envia os dados recebidos para os consumidores WebSocket
  sendToConsumers(data);

  // Resposta ao cliente HTTP que enviou os dados
  res.status(200).send("Dados enviados aos consumidores WebSocket");
});

// Cria o servidor HTTP
const server = http.createServer(app);

// Inicia o servidor HTTP
server.listen(3000, () => {
  console.log("Servidor HTTP rodando na porta 3000");
});
