const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;
const API_KEY = "123";

app.use(cors());
app.use(bodyParser.json());

let clients = {};
let id = 0;

// Handler for the /listen endpoint
function listenHandler(req, res) {
  const room = req.body.room || "general";
  const apiKey = req.body.key;
  if (!isValidKey(apiKey) || !apiKey) {
    return res.status(401).json({ error: "Invalid or missing auth key" });
  }

  if (!clients[room]) {
    clients[room] = []; //init room if it doesn't exist
  }

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  id += 1;
  let clientId = id;
  clients[room].push({ id: clientId, response: res });
  console.log(`Client connected. Room: ${room}. ID: ${clientId}`);
  res.write(`data: Client connected. Room: ${room}. ID: ${clientId}\n\n`);

  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients[room] = clients[room].filter((client) => client.id !== clientId);
    if (clients[room].length === 0) {
      //delete room if empty
      delete clients[room];
    }
  });
}

// Send Messsage Functions
function sendMessagesToAll(newMessage, room) {
  if (clients[room]) {
    clients[room].forEach((client) => {
      client.response.write(`message: ${JSON.stringify(newMessage)}\n\n`);
    });
  }
}

function isValidKey(key) {
  return key === API_KEY;
}

function messageHandler(req, res) {
  const { message, key, room } = req.body;
  if (!message || !key || !room) {
    return res.status(400).json({ error: "Missing message, key, or room" });
  }

  if (typeof message !== "string" || message.length > 250) {
    return res.status(400).json({ error: "Invalid message content" });
  }

  if (!isValidKey(key)) {
    return res.status(401).json({ error: "Invalid auth key" });
  }

  if (room !== "general" && !clients[room]) {
    return res.status(400).json({ error: "Room does not exist" });
  }
  const chatRoom = room || "general";
  console.log(`Sending message to room: ${chatRoom}: ${message}`);
  return sendMessagesToAll(message, chatRoom);
}

// Endpoints
app.post("/send", messageHandler);

app.get("/listen", listenHandler);

// Start the server
app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
