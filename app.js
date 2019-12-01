const express = require('express');

const app = express();
const server = require('http').createServer(app);
const ioRestoreDesktop = require('socket.io')(server,{path:'/restore-desktop-api'});


const fs = require('fs');
const session = require('express-session')({
    secret: 'JDKAWDJA81jhuiaydWHAUDHAu123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
require("./restore-desktop-socket-api")(ioRestoreDesktop,session);


app.set('trust proxy', 1);// trust first proxy
app.use(session);

app.use(express.static(__dirname + '/site'));

server.listen(3000);