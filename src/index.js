import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@adiwajshing/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import msgUpsert from './proces.js';

async function waConnect() {
    const { state, saveCreds } = await useMultiFileAuthState('authinfo');
    const socket = makeWASocket.default({ auth: state });
    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', (cs) => {
        if (cs.qr) qrcode.generate(cs.qr, { small: true });
        if (cs.connection === 'close') {
            if (new Boom(cs.lastDisconnect.error).output.statusCode !== DisconnectReason.loggedOut) {
                waConnect();
                console.log('connection closed, must login');
            }
            console.log('connection closed');
        } else if (cs.connection === 'open') {
            console.log('connection open');
        }
    });
    return socket;
}

waConnect().then(async (socket) => {
    await msgUpsert(socket);
})

