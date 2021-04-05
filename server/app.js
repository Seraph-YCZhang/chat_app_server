const express = require('express');
const ws = require('ws');
const http = require('http');
const { MESSAGE, ONLINE_NUMBER } = require('./constants');
const PORT = 8000;

const app = express();
const wss = new ws.Server({ noServer: true });

const rooms = new Map();
const formatData = data => JSON.stringify(data);

wss.on('connection', ws => {
    // console.log('connected', wss.clients.size, Date.now());
    wss.clients.forEach(c => {
        c.send(
            formatData({
                data: wss.clients.size,
                type: ONLINE_NUMBER
            })
        );
    });
    ws.on('message', _msg => {
        console.log(typeof _msg);
        if (typeof _msg === 'string') {
            const msg = JSON.parse(_msg);
            wss.clients.forEach(c => {
                if (c !== ws) c.send(formatData(msg));
            });
        } else {
            wss.clients.forEach(c => {
                if (c !== ws) c.send(_msg);
            });
        }
    });
    ws.on('close', () => {
        wss.clients.forEach(c => {
            c.send(
                formatData({
                    data: wss.clients.size,
                    type: ONLINE_NUMBER
                })
            );
        });
    });
    ws.send(formatData({ type: MESSAGE, message: 'Connection established' }));
});

const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, socket => {
        wss.emit('connection', socket, req);
    });
});

server.listen(PORT, () => console.log(`Listening to ${PORT}`));
