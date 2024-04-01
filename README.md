Quite a basic exploration of implementing a 'chat' app with web sockets. I have not really used these before, so wanted to get a slight feel of it.

To run:
- in top directory, run `npm run start` -> express server running on :3000
- in `/chat-ui` directory, run `npm run dev` -> nextjs running on :3001

If you were doing this for real, you'd make a bunch of things more robust, but this is just an afternoon exploration.

`expressjs` opens up a node server. `express-ws` adds some web socket functionality. The server is storing an array of the chat messages, just as a basic representation of server-side persistence. A `web socket` endpoint `/chat` is exposed on `ws://localhost:3000/chat`. Clients can connect to this and then send and receive messages. The server keeps track of all connections currently open to it, and broadcasts when new messages are received. `/3000/meta` is a regular http endpoint and returns some data about the chat state, for some debugging help.

The client is in nextjs, just to keep things easy. First the user is asked to enter a name, which is a kind of pretend "log in" type thing. A static class containing a singleton helps to prevent unnecessary extra instances of the web socket from initialising. It also abstracts away some detail, hopefully. Some forms allow the user to enter a message, which then gets sent through the web socket, and gets broadcast back to all with a web socket open.