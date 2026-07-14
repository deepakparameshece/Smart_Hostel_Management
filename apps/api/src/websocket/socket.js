const { Server } = require('socket.io');

let ioInstance = null;

const setupWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join:room', (room) => {
      socket.join(room);
      console.log(`📢 ${socket.id} joined room: ${room}`);
    });

    socket.on('leave:room', (room) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => ioInstance;

const emitNotification = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification', notification);
  }
};

const emitDashboardUpdate = (role, data) => {
  if (ioInstance) {
    ioInstance.to(`dashboard:${role}`).emit('dashboard:update', data);
  }
};

module.exports = { setupWebSocket, getIO, emitNotification, emitDashboardUpdate };
