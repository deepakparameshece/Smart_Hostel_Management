"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, online: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!token || !socketUrl) return;

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => setOnline(true));
    newSocket.on('disconnect', () => setOnline(false));
    newSocket.on('notification', (data: any) => {
      console.log('🔔 Socket Notification received:', data);
      if (data && data.message) {
        window.alert(data.message);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, online }}>
      {children}
    </SocketContext.Provider>
  );
};
