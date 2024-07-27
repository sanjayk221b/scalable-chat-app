"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ISocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (msg: string) => any;
  messages: string[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`state is undefined`);

  return state;
};

export const SocketProvider: React.FC<ISocketProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Send Message", msg);

      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  const onMessageReceived = useCallback((msg: any) => {
    console.log("From server msg received", msg);
    try {
      const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg;
      const { message } =
        typeof parsedMsg.message === "string"
          ? JSON.parse(parsedMsg.message)
          : parsedMsg.message;
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("message", onMessageReceived);
    setSocket(_socket);

    return () => {
      _socket.disconnect();
      _socket.off("message", onMessageReceived);
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
