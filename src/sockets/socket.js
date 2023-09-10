const { get_socket } = require("../config/socketio");

let io = get_socket();
setTimeout(() => {
    console.log(io);
}, 5000);
// Create a Socket.io namespace based on the dynamic parameter
liveshare = io.of('/file/:param/live');

liveshare.on('connection', (socket) => {
  const dynamicParam = socket.handshake.query.param; // Get the dynamic parameter from the client

  console.log(`A user connected to /file/${dynamicParam}/live namespace`);

  socket.on('customEvent', (data) => {
    console.log('Received custom event:', data);
    // Handle the event within this dynamic namespace
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected from /file/${dynamicParam}/live namespace`);
  });
});
