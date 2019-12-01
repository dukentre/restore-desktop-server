var socket = io({path:'/restore-desktop-api'});

socket.on("auth-success",function (data){
    console.log(data.roomName);
    $(".auth").hide();
    $(".control-panel").show();
    $('.control-panel .room .name').html(data.roomName);
    $(".auth input").val("");
    $(".create input").val("");
});

socket.on("create-success",function (data){
    console.log(data.roomName);
    $(".create").hide();
    $(".control-panel").show();
    $('.control-panel .room .name').html(data.roomName);
    $(".auth input").val("");
    $(".create input").val("");
});

socket.on("users-count",function (data){
    $('.control-panel .count-users').html(data);
});
socket.on("auth-deny",function(data){
console.log("Авторизация не удалась");
})

socket.on("logout",function(data){
    $(".control-panel").hide();
    $(".auth").show();
    $(".auth input").val("");
    $(".create input").val("");
    $(".auth").css({opacity:"100",width:'100%'});
})

socket.emit("auth-room",{},function(){
    console.log("EEE BOY");
});//пытаемся использовать сессию

$(".auth .submit-btn").click(function(){
    var canAuth = false;
    var roomName = $(".auth .room-name-input").val();
    var roomPass = $(".auth .room-pass-input").val();
    if(roomName !== "" && roomPass !== ""){
        canAuth = true;
        $('.auth .room-name').css({color:"#444242"});
        $('.auth .room-pass').css({color:"#444242"});
    }else{
        $('.auth .room-name').css({color:"rgb(212, 16, 16)"});
        $('.auth .room-pass').css({color:"rgb(212, 16, 16)"});
        
    }
    
    if(canAuth){
        socket.emit("auth-room",{roomName: roomName, roomPass: roomPass},function(){
            console.log("EEE BOY");
        });
        
    }
});

$(".create .submit-btn").click(function(){
    console.log("create");
    var canCreate = false;
    var roomName = $(".create .room-name-input").val();
    var roomPass = $(".create .room-pass-input").val();
    if(roomName !== "" && roomPass !== ""){
        canCreate = true;
        $('.create .warning').hide();
    }else{
        $('.create .warning').show();
    }
    
    if(canCreate){
        console.log("create-send!");
        socket.emit("create-room",{roomName: roomName, roomPass: roomPass},function(){
            console.log("EEE BOY");
        });
        
    }
});

$(".create-room-btn").click(function(){
    $(".auth").animate({opacity:"0",width:'90%'},300);
    setTimeout(() => {
        $(".auth").hide();
        $(".create").show();
        $(".create").css({opacity:"0",width:'90%'});
        $(".create").animate({opacity:"100",width:'100%'},300);
    }, 300);
    
});

$(".back-to-auth-btn").click(function(){
    $(".create").animate({opacity:"0",width:'90%'},300);
    setTimeout(() => {
        $(".create").hide();
        $(".auth").show();
        $(".auth").css({opacity:"0",width:'90%'});
        $(".auth").animate({opacity:"100",width:'100%'},300);
    }, 300);
    
});

$('.logout-btn').click(function(){
    console.log("Выходим");
    socket.emit("logout",{},function(){
        console.log("EEE BOY");
    });
});

$(".restore-desktop-btn").click(function(){
    socket.emit('restore-desktops-room');
});