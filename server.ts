import express from 'express';
import expressWs from 'express-ws';

const ws = expressWs(express());
const app = ws.app;
const port = 3000

/**
 * clientKey - identify different clients. I'll assign this on first connection.
 */
type ChatMessage = {clientKey: string, id: number, author: string, message: string};
/**
 * going to keep some state of the messages that exist.
 */
const chat: ChatMessage[] = [];
const connectionIds = new Set<string>();

/**
 * connections mapped by string (client Id)
 */
const connections: {[key in string]: {ws: WebSocket}} = {};


app.get('/chat', (req, res, next) => {
  next();
});

app.ws('/chat', function(ws, req) {
  const clientId = req.query.client_key as string;
  if (!clientId) {
    // maybe throw error or something.
    // client should send it through.
    return;
  }
  // @ts-ignore
  connections[clientId] = {ws};

  ws.on('message', function(msg: string) {
    const chatMessage: ChatMessage = JSON.parse(msg);
    chatMessage.id = chat.length;
    chat.push(chatMessage);

    // broadcast new chats to all
    Object.values(connections).forEach(({ws}) => {
      ws.send(JSON.stringify(chat));
    })
  });
  ws.on('close', () => {
    delete connections[clientId];
  })
  ws.send(JSON.stringify(chat));
});

app.get('/meta', (req, res) => {
  res.send(JSON.stringify({
    connectionIds: Object.keys(connections),
    chat
  }));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})