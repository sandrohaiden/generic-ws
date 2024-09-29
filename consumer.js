const WebSocket = require("ws");

const socket = new WebSocket("ws://machine.debugon.xyz:8080");

// Quando a conexão WebSocket é aberta
socket.on("open", () => {
  console.log("Conectado como consumidor");
  socket.send(JSON.stringify({ type: "consumer" })); // Identifica como consumidor
});

// Recebe os dados enviados via WebSocket
socket.on("message", (message) => {
  const data = JSON.parse(message);
  console.log("Dados recebidos:", data.payload);
});
