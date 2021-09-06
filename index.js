//services
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// models
const Reply = require('./reply.js');

// socket.io channels
const messageChannel = 'message';
const replyChannel = 'reply';
const { Wit } = require('node-wit');

const client = new Wit({
  accessToken: '4Z3IJRRUIP47VAFLIXINVTPSMRPNNTIL',
});

app.use('/', express.static(path.join(__dirname + '/public')));

io.on('connection', function (socket) {
  console.log('User connected to Chatbot');
  console.log(new Reply('init', JSON.parse('{"name": "init1"}'), '').toJson());
  console.log('User connected to Chatbot2');
  socket.emit(
    replyChannel,
    new Reply('init', JSON.parse('{"name": "init1"}'), '').toJson()
  );

  socket.on(messageChannel, function (message, isUser, fn) {
    fn('Message arrived to the server'); //callback function
    sendToBot(message, socket);
  });

  socket.on(replyChannel, function (message, intent, feedback) {
    console.log(
      'Message: ' +
        message +
        ' | Intent: ' +
        intent +
        ' | Feedback: ' +
        feedback
    );
  });
});

var port = 8000;
server.listen(port, function () {
  console.log('Chatbot is listening on port ' + port + '!');
});

sendToBot = function (message, socket) {
  client
    .message(message, {})
    .then((data) => {
      console.log(data);
      handleMessage(data, socket);
      //     const res=data.
      //     console.log(data.entities?.length)
      //   const category = firstValue(data.entities, 'wit$location:location');
      //   socket.emit(replyChannel, category);
      //   //   socket.emit(replyChannel, new Reply(message, intent, entities).toJson());
      //   console.log('Yay, got Wit.ai response: ' + category);
    })
    .catch(console.error);
};

const firstValue = (obj, key) => {
  const val =
    obj &&
    obj[key] &&
    Array.isArray(obj[key]) &&
    obj[key].length > 0 &&
    obj[key][0].value;
  if (!val) {
    return null;
  }
  return val;
};

const handleMessage = ({ text, entities }, socket) => {
  console.log(entities);
  const greeting = firstValue(entities, 'greeting:greeting');
  const HelpQuery = firstValue(entities, 'HelpQuery:HelpQuery');

  if (greeting || HelpQuery) {
    const response = {
      intent: { name: 'init1' },
      entities: '',
      reply: greeting ? greeting : HelpQuery,
      message: text,
    };
    socket.emit(replyChannel, response);
  } else {
  }
};
