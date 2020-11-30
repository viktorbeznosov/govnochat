var socket = require('socket.io');
var express = require('express');
var app = express();
cookieParser = require('cookie-parser')
var io = socket.listen(app.listen(8080));

app.set('views', __dirname + '/tpl');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

app.get('/', function(req, res){
    res.render('page', {
        'title': 'Govnochat'
    });
});

//namespaces

const gameRooms = ["Red", "Green", "Blue"];

io.of("/gamers").on("connection", function(socket){

  console.log('connect gamers');
  socket.emit("welcome", "Hello and welcome to gamers area");

  // socket.on('reConnect', function(data){
  //   if (data.name){
  //     socket.emmit
  //   }
  // })

  socket.on('add user', function(data){
      socket.name = data.name;
      console.log('add user');
      console.log(data);
      socket.emit('login', {name: socket.name});
      if (data.room){
        //Выходим из всех предыдущих комнат
        var clientRooms = Object.keys(socket.rooms);
        clientRooms.forEach(function(room){
          socket.leave(room);
        });
        socket.join(data.room, function(){
          socket.emit("hello", {message: "welcome to " + data.room + " room again"});
        });
      } else {
        socket.emit('hello', {message: 'Hello '+ socket.name})
        socket.broadcast.emit('hello', {message: socket.name + ' joined to chat'}); //Всем кроме пользователя пославшего message
      }


      socket.emit("getRooms", {
        rooms: gameRooms
      });

      socket.on('message', function(data){
          var currentClientRooms = Object.keys(socket.rooms);
          var clientRooms = Object.keys(socket.rooms);
          socket.emit('hello', {message: data.message});
          clientRooms.forEach(function(room){
            socket.broadcast.to(room).emit('hello', {message: socket.name + ' > ' + data.message}); //Всем кроме пользователя пославшего message
          });

          // io.sockets.emit('hello', {message: client.name + ' --- ' + data.message}); //Всем
      });

      //Rooms
      socket.on("joinRoom", function(room){
        console.log('Join Room = ' + room);
        //Выходим из всех предыдущих комнат
        var clientRooms = Object.keys(socket.rooms);
        clientRooms.forEach(function(room){
          socket.leave(room);
        });
        if (gameRooms.includes(room)){
          socket.join(room, function(){
            socket.broadcast.to(room).emit("hello", {message: socket.name + " has joined to " + room + " room"});
          });

          // io
          //   .of("/gamers")
          //   .to(room)
          //   .emit("hello", socket.name + " HAS JOINED TO " + room);//Всем в комнате

          return socket.emit("success", "welcome to " + room + " room")
        } else {
          return socket.emit("err", "ERROR! No room named " + room)
        }

        // socket.disconnect()
      });

  });

  socket.on('disconnected', function (data) {
      console.log('disconnect');
      console.log(data);
      // console.log(data.name + ' disconnected');//!!!!!!!!!!!!!!
      socket.broadcast.to(data.room).emit('hello', {message: data.name + ' disconnected'});
      socket.disconnect();
  });

});


//==============================================================================================================================
/*
io.sockets.on('connection', function(client){
    console.log('Connect');
    client.on('add user', function(data){
        client.name = data.name;
        console.log(data);
        client.emit('login', {name: client.name});
        client.emit('hello', {message: 'Hello '+ client.name})
        client.broadcast.emit('hello', {message: client.name + ' joined to chat'}); //Всем кроме пользователя пославшего message
    });

    client.on('message', function(data){
        console.log(data);
        client.emit('hello', {message: data.message})
        client.broadcast.emit('hello', {message: client.name + ' --- ' + data.message}); //Всем кроме пользователя пославшего message
        // io.sockets.emit('hello', {message: client.name + ' --- ' + data.message}); //Всем
    });
    client.on('disconnect', function(data){
        console.log('disconnect');
        io.sockets.emit('hello', {message: client.name + ' is disconnected'}); //Всем
    });
});
*/
