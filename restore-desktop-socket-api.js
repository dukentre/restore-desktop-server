sharedsession = require("express-socket.io-session");

const mysql = require("mysql");
let db ={
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'restdesk'
  }

function controlFucnctions(io,socket,roomName,roomUsers){
    socket.join(roomName+"-admins",()=>{
        console.log("Мы присоединились к комнате администраторов");
        console.log(roomUsers[roomName]);
        if(typeof(roomUsers[roomName]) !== 'undefined'){//если комната зарегистрирована
            io.sockets.to(roomName+"-admins").emit('users-count',roomUsers[roomName]);
        }else{
            io.sockets.to(roomName+"-admins").emit('users-count',0);
        }
    });
    socket.on("restore-desktops-room", (data) => {
        console.log("restore-desktops-room: ",roomName);
        io.sockets.to(roomName).emit('restore-desktop');
        
    });
    
    socket.on("logout", () => {
        socket.leave(roomName+"-admins");
        if (socket.handshake.session.connected_room) {
            delete socket.handshake.session.connected_room;
            socket.handshake.session.save();
        }
        socket.emit("logout");
    });   
}


module.exports = (io,session) =>{
    let roomUsers = [];

    io.use(sharedsession(session));//сессии

    io.on('connection', (socket) => { 
        console.log("Connection!");

        

        socket.on("create-room", (data) => {
            console.log("try create room: ");
            let connection = mysql.createConnection(db);
            connection.connect();

            //console.log(data);
            if (data && "roomName" in data && 'roomPass' in data) {
                let sql = "INSERT INTO `rooms`(`room`, `pass`) VALUES (?,MD5(?))";
                let param = [data['roomName'],  data['roomPass']];
                connection.query(sql, param, (err, res, fields) => {
                    if (err) {
                        console.log(err);
                        
                    }else{
                    controlFucnctions(io,socket,data.roomName,roomUsers);
                    console.log("Комната создана!");
                    socket.handshake.session.connected_room = data.roomName;
                    socket.handshake.session.save();
                    socket.emit("create-success",{roomName:data.roomName});
                    }
                });
            }else{
                console.log("Создать комнату не получилось!", data);
            }

            connection.end();
        });

        socket.on("auth-room", (data) => {
            console.log("try auth room: ");
            let connection = mysql.createConnection(db);
            connection.connect();

            //console.log(data);
            if (data && "roomName" in data && 'roomPass' in data) {
                let sql = "SELECT * FROM `rooms` WHERE `room` = ? AND `pass` = MD5(?)";
                let param = [data['roomName'],  data['roomPass']];
                connection.query(sql, param, (err, res, fields) => {
                    if (err) {
                        console.log(err);
                        
                    } 
                    if(res.length > 0){
                        controlFucnctions(io,socket,data.roomName,roomUsers);
                        console.log("Авторизация успешна!",data.roomName);
                        socket.handshake.session.connected_room = data.roomName;
                        socket.handshake.session.save();
                        socket.emit("auth-success",{roomName:data.roomName});
                        
                    }else{
                        console.log("Авторизация не удалась!")
                        socket.emit("auth-deny");
                    }
                });
            }else{
                let roomName = socket.handshake.session.connected_room;
                //console.log(socket.handshake.session.connect);
                console.log(roomName);
                if(roomName){
                    socket.emit("auth-success",{roomName:roomName});
                    controlFucnctions(io,socket,roomName,roomUsers);
                }else{
                    console.log("Авторизоваться не получилось!", data);
                    socket.emit("auth-deny");
                }
            }

            connection.end();
        });

        socket.on("delete-room", (data) => {
            console.log("try delete room: ");
            let connection = mysql.createConnection(db);
            connection.connect();

            //console.log(data);
            if (data && "roomName" in data && 'roomPass' in data) {
                let sql = "DELETE FROM `rooms` WHERE `room` = ? AND `pass` = MD5(?)";
                let param = [data['roomName'],  data['roomPass']];
                connection.query(sql, param, (err, res, fields) => {
                    if (err) {
                        console.log(err);
                        
                    } 
                });
            }else{
                console.log("Удалить комнату не получилось!", data);
            }

            connection.end();
        });

        socket.on("connect-to-room", (data) => {
            console.log("try connect to room: ");
            let connection = mysql.createConnection(db);
            connection.connect();

            //console.log(data);
            if (data && "roomName" in data) {
                let sql = "SELECT * FROM `rooms` WHERE `room` = ?";
                let param = [data['roomName']];
                connection.query(sql, param, (err, res, fields) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(res.length);
                    if(res.length > 0){
                        console.log("EEE BOY, CONNECT THIS SOCKET TO ROOM")
                        socket.join(data['roomName'],()=>{
                            console.log("Мы присоединились к комнате")
                            if(data.roomName in roomUsers){
                                roomUsers[data.roomName]++;
                            }else{
                                roomUsers[data.roomName] = 1;
                            }
                            io.sockets.to(data.roomName+"-admins").emit('users-count',roomUsers[data.roomName]);
                            console.log(roomUsers);
                            socket.on('disconnect', function() {
                                console.log(data.roomName);
                                roomUsers[data.roomName]--;
                                io.sockets.to(data.roomName+"-admins").emit('users-count',roomUsers[data.roomName]);
                            });
                            socket.emit("connected",{roomName:data.roomName});
                        });
                        
                    }
                    
                });
            }else{
                Console.log("Подключиться к комнате не получилось!", data);
            }

            connection.end();
        });
        

        
    });

    
    console.log("Restore Desktop Api Started!")
}