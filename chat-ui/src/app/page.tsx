"use client";

import { useState } from "react";

type ChatMessage = { id: number; author: string; message: string };
type ChatMessageViewModel = ChatMessage & { isAuthor: boolean };

class SocketClient {
  private static instance: WebSocket;

  /**
   * make the get instance private, to then just make some static methods to expose the client functions.
   * @returns
   */
  private static getInstance(): WebSocket {
    if (!SocketClient.instance) {
      /**
       * client required to send some key to the server.
       * This is so that you could view the thing from different browser tabs, and they're treated differently. Otherwise, I'm pretty sure the server can't tell, just from client ip / address / whatever.
       */
      const clientKey = `${Math.floor(Math.random() * 20000)}`;
      SocketClient.instance = new WebSocket(
        `ws://localhost:3000/chat?client_key=${clientKey}`
      );
    }
    return SocketClient.instance;
  }

  static send(message: { author: string; message: string }) {
    SocketClient.getInstance().send(JSON.stringify(message));
  }

  static handleOnMessage(f: (data: ChatMessageViewModel[]) => void) {
    SocketClient.getInstance().onmessage = (event) => {
      f(JSON.parse(event.data) as ChatMessageViewModel[]);
    };
  }
}

export default function Home() {
  const [chat, setChat] = useState<ChatMessageViewModel[]>([]);
  const [name, setName] = useState("");

  SocketClient.handleOnMessage((data) =>
    setChat(
      data.map((chat) => {
        return { ...chat, isAuthor: chat.author === name };
      })
    )
  );

  return (
    <>
      <NameSelect onSelect={(name) => setName(name)} storedName={name} />
      {name && (
        <>
          <DisplayChats chats={chat} />
          <ChatInput
            onSend={(text) =>
              SocketClient.send({
                author: name,
                message: text,
              })
            }
          />
        </>
      )}
    </>
  );
}

const NameSelect = ({
  onSelect,
  storedName,
}: {
  onSelect: (name: string) => void;
  storedName: string;
}) => {
  const [name, setName] = useState(storedName);
  const [nameIsSelected, setNameIsSelected] = useState(!!name);
  const handleSelect = () => {
    onSelect(name);
    setNameIsSelected(true);
  };
  return (
    <>
      {!!nameIsSelected && <em style={{color: 'white', background: 'black', padding: '1rem'}}>typing as {name}</em>}
      {!nameIsSelected && (
        <>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSelect();
            }}
          >
            <label>
              Enter your name:
              <input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                type="text"
              />
            </label>
            <button type="button" onClick={handleSelect}>
              Set
            </button>
          </form>
        </>
      )}
    </>
  );
};

const DisplayChats = ({
  chats,
}: {
  chats: { id: number; author: string; message: string; isAuthor: boolean }[];
}) => {
  return (
    <>
      <section>
        {chats.map((chat, i) => {
          return (
            <p
              style={{ fontWeight: chat.isAuthor ? "bold" : "normal" }}
              key={`chat-${i}`}
            >
              {chat.author}: {chat.message}
            </p>
          );
        })}
      </section>
    </>
  );
};

const ChatInput = ({ onSend }: { onSend: (text: string) => void }) => {
  const [text, setText] = useState("");
  const onSubmit = () => {
    setText("");
    onSend(text);
  };
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          type="text"
        />
        <button type="button" onClick={onSubmit}>
          post
        </button>
      </form>
    </>
  );
};
