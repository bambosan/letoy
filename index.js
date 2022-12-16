import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@adiwajshing/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';

import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({ apiKey: 'your Open AI key' });
const openai = new OpenAIApi(config);

async function waConnect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket.default({ auth: state });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (cs) => {
        if (cs.connection === 'close') {
            if (new Boom(cs.lastDisconnect.error).output.statusCode === DisconnectReason.loggedOut) {
                qrcode.generate(cs.qr, { small: true });
            } else {
                waConnect();
            }
        } else if (cs.connection === 'open') {
            console.log('connection open');
        }
    });
    return sock;
}

waConnect().then((sc) => {
    sc.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key.remoteJid !== 'status@broadcast') {
            if (m.messages[0].message.conversation.match(/^dalle\W(?=\w)/i)) {
                await sc.sendMessage(m.messages[0].key.remoteJid, { text: 'tunggu sedang proses..' }, { quoted: m.messages[0] });
                try {
                    const dalle = await openai.createImage({
                        prompt: m.messages[0].message.conversation.slice(5).trim(),
                        n: 1,
                        size: '512x512'
                    });
                    await sc.sendMessage(m.messages[0].key.remoteJid, { image: { url: dalle.data.data[0].url } }, { quoted: m.messages[0] });
                } catch (error) {
                    if (error.response) {
                        await sc.sendMessage(m.messages[0].key.remoteJid, { text: error.response.data.error.message }, { quoted: m.messages[0] });
                    } else {
                        console.log(error.message);
                    }
                }
            }
            
            if (m.messages[0].message.conversation.match(/^tc\W(?=\w)/i)) {
                try {
                    const textc = await openai.createCompletion({
                        model: "text-davinci-003",
                        prompt: m.messages[0].message.conversation.slice(2).trim(),
                        temperature: 0.5,
                        max_tokens: 256,
                        top_p: 1,
                        frequency_penalty: 0.5,
                        presence_penalty: 0,
                    });
                    await sc.sendMessage(m.messages[0].key.remoteJid, { text: textc.data.choices[0].text.trimStart() }, { quoted: m.messages[0] });
                } catch (error) {
                    if (error.response) {
                        await sc.sendMessage(m.messages[0].key.remoteJid, { text: error.response.data.error.message }, { quoted: m.messages[0] });
                    } else {
                        console.log(error.message);
                    }
                }
            }
        }
    });
});