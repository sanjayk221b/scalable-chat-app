"use client";
import { useState } from "react";
import { useSocket } from "../context/SocketProvider";
import classses from "./page.module.css";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");
  return (
    <div>
      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          className={classses["chat-input"]}
          placeholder="Message"
          type="text"
        />
        <button
          onClick={(e) => sendMessage(message)}
          className={classses["button"]}
        >
          Send
        </button>
      </div>
      <div>
        <h1>All messages will appear here</h1>
        {messages.map((e) => (
          <li>{e}</li>
        ))}
      </div>
    </div>
  );
}
