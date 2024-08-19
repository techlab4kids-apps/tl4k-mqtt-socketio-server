// Import required modules
const socketIO = require('socket.io');
const fs = require('fs');
const https = require('https');

const aedes = require('aedes')()


// MQTT server settings
const mqttPort = 1883;
const mqttsPort = 1884;
const httpsPort = 8083;
const mqttWsPort = 8888;
const mqttWssPort = 8889;

// Socket.IO server settings
const socketIOPort = 3000;

// Create MQTT server
const mqttServer = require('net').createServer(aedes.handle)

mqttServer.listen(mqttPort, function () {
    console.log('mqtt server started and listening on port ', mqttPort)
})
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}

const mqttsServer = require('tls').createServer(options, aedes.handle)

mqttsServer.listen(mqttsPort, function () {
    console.log('mqtts server started and listening on port ', mqttsPort)
})


const httpServer = require('http').createServer()
const ws = require('websocket-stream')

ws.createServer({ server: httpServer }, aedes.handle)

httpServer.listen(mqttWsPort, function () {
    console.log('websocket server listening on port ', mqttWsPort)
})


// Create HTTPS server for MQTTS and WSS
const httpsServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
});


const mqttWssServer = require('tls').createServer(options, aedes.handle)

ws.createServer({ server: mqttWssServer }, aedes.handle)

// httpServer.listen(mqttWssPort, function () {
//     console.log('mqtt wss server listening on port ', mqttWssPort)
// })

mqttWssServer.listen(mqttWssPort, function () {
    console.log('mqtt wss server started and listening on port ', mqttWssPort)
})

// Create WebSocket server for WS and WSS
const wsServer = new socketIO.Server(httpsServer, {
    path: '/mqtt'
});

// Bridge MQTT and Socket.IO
mqttServer.on('clientConnected', (client) => {
    console.log(`MQTT client connected: ${client.id}`);

    // Subscribe to all topics
    client.subscribe('$SYS/#');

    // Forward MQTT messages to Socket.IO
    client.on('message', (topic, message) => {
        wsServer.emit('mqtt_message', { topic: topic, message: message.toString() });
    });
});

wsServer.on('connection', (socket) => {
    console.log(`Socket.IO client connected: ${socket.id}`);

    // Forward Socket.IO events to MQTT
    socket.on('mqtt_publish', (data) => {
        mqttServer.publish({
            topic: data.topic,
            payload: data.message
        });
    });
});

// Start MQTT server
// mqttServer.start();

// Start HTTPS server for MQTTS and WSS
httpsServer.listen(httpsPort);

// Start Socket.IO server for WS and WSS
// wsServer.listen(mqttWsPort);
// console.log(`Socket.IO server started on port ${mqttWsPort}`);
