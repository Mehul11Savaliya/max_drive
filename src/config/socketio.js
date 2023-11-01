const { Server } = require("socket.io");

const notifemmiter = require("../subscriber/Notification");
const roommiiter = require("../subscriber/RoomEvents");

let io = null;

function start_socket(httpserver) {
    io = new Server(httpserver, {});
    let room_user = new Map();
    let livefile = io.of('/file/share/live').on('connection', (socket) => {
        console.log(`A user connected to /file/share/live live namespace`);

        socket.on('join-room', (data) => {
            if (!room_user.has(data.id)) {
                room_user.set(data.id, new Set());
                room_user.get(data.id).add(data.user);
            }
            room_user.get(data.id).add(data.user);
            console.log(room_user);
            socket.join(data.id);
            livefile.in(data.id).emit("user-joined", Array.from(room_user.get(data.id)));
            // livefil..in(data.id).emit("user-joined",data.user);
            // socket.in(data.id).emit("user-joined",data.user);
        });

        // socket.on("file-chunk",(data)=>{
        //   livefile.in(data.id).emit("down-chunk",data);
        //     console.log(data);
        // })

        socket.on("receiver-join", (data) => {
            socket.join(data.id);
            socket.in(data.id).emit("init", data.id);
        })

        socket.on("file-upload", (data) => {
            socket.in(data.id).emit("file-download", data);
        });

        socket.on("send-message", (data) => {
            socket.broadcast.in(data.id).emit("recieve-message", data);
        })

        socket.on('disconnect', () => {
            console.log(`User disconnected from /file/share/live namespace`);
        });
    });

    let notification = io.of("/user/notification");
    notification.on("connection",(socket)=>{
        socket.on("join-room",(data)=>{
            console.log(`user joinded.. : ${JSON.stringify(data)}`);
            socket.join(data.id);  //differnt room based on email...
            notification.in(data.id).emit("user-joined", {id:data.id});
        });
        
        socket.on("user-joined",(data)=>{
            console.log(`user joinded.. : ${data}`);
        });
    })

    notifemmiter.on("push-notification",(data)=>{
        notification.in(data.to).emit("notification",data);
    });
    
    let rooms = io.of("/rooms");
    rooms.on("connection",(socket)=>{
        console.log("user connected to rooms namespace : ");
    })
    roommiiter.on("create_room",(data)=>{
        console.log(data);
        rooms.emit("create_room",data);
    })
    roommiiter.on("delete_room",(data)=>{
        console.log(data);
        rooms.emit("delete_room",data);
    })

    let roomviewmap = new Map();
    let roomview = io.of("/rooms/view");
     roomview.on("connection",(socket)=>{
        console.log("user joined to room view namespace");
        socket.on("join-room",(data)=>{
            
            if (!roomviewmap.has(data.roomid)) {
                roomviewmap.set(data.roomid,new Set());
                roomviewmap.get(data.roomid).add(data.user);
            }
            roomviewmap.get(data.roomid).add(data.user);
            console.log(roomviewmap.get(data.roomid));
            socket.join(data.roomid);
            roomview.in(data.roomid).emit("update-user",Array.from(roomviewmap.get(data.roomid)))
         })
     });
     roomview.on("leave-room",(data)=>{
       roomviewmap.get(data.roomid).delete(data.user);
       roomview.in(data.roomid).emit("update-user",Array.from(roomviewmap.get(data.roomid)))
        
        console.log("leave "+roomviewmap.get(data.roomid))
     })
    setInterval(() => {
        notification.emit("ping",{msg:"🐦"});
    }, 30000);

    console.log("socket io started..");
}
function get_socket() {
    console.log(io);
    return io;
}

module.exports = { io, start_socket, get_socket }