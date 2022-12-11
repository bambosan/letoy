import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@adiwajshing/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({ apiKey: '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' });
const openai = new OpenAIApi(config);

(async function () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket.default({ auth: state });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (ev) => {
        if(ev.qr){
            qrcode.generate(ev.qr, { small: true });
        }
        if(ev.connection === 'close') {
            const shouldReconnect = new Boom(ev.lastDisconnect.error).output.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', ev.lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if(shouldReconnect) {
                connect();
            }
        } else if(ev.connection === 'open') {
            console.log('opened connection');
        }
    });
    sock.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key.remoteJid !== 'status@broadcast') {
            if (m.messages[0].message.conversation.match(/^dalle\W(?=\w)/i)) {
                await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'tunggu sedang proses..' }, { quoted: m.messages[0] });
                try {
                    const dalle = await openai.createImage({
                        prompt: m.messages[0].message.conversation.slice(5).trim(),
                        n: 1,
                        size: '512x512'
                    });
                    await sock.sendMessage(m.messages[0].key.remoteJid, { image: { url: dalle.data.data[0].url } }, { quoted: m.messages[0] });
                } catch (error) {
                    if (error.response) {
                        await sock.sendMessage(m.messages[0].key.remoteJid, { text: error.response.data.error.message }, { quoted: m.messages[0] });
                    } else {
                        console.log(error.message);
                    }
                }
            }
        }
    });
})();