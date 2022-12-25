import { downloadMediaMessage } from '@adiwajshing/baileys';
import { downloadContentFromMessage } from '@adiwajshing/baileys/lib/Utils/messages-media.js';
import { dalle, textc } from './openai.js';
import stickers from './sticker.js';
import { Buffer } from 'node:buffer';
import * as fs from 'fs';

const letoyHelp = `letoy <arg>

list arg:
• jawab
• dalle
• stiker
`;

const stikerHelp = `letoy stiker <arg1> <arg2>

arg1 (opsional):
• default
• circle
• cropped

arg2 (opsional): info stiker / pesan..
`;

export default async function msgUpsert(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        if (messages[0].key.remoteJid !== 'status@broadcast') {
            if(messages[0].message.conversation.match(/^letoy(?= help)/i)){
                await socket.sendMessage(messages[0].key.remoteJid,
                    { text: letoyHelp },
                    { quoted: messages[0] }
                );
            }

            if(messages[0].message.conversation.match(/^letoy(?= stiker help)/i)){
                await socket.sendMessage(messages[0].key.remoteJid,
                    { text: stikerHelp },
                    { quoted: messages[0] }
                );
            }
            
            if (messages[0].message.conversation.match(/^letoy(?= jawab \w)/i)) {
                textc(socket, messages);
            }

            if (messages[0].message.conversation.match(/^letoy(?= dalle \w)/i)) {
                dalle(socket, messages);
            }
            
            if (messages[0].message.imageMessage && messages[0].message.imageMessage.caption.match(/^letoy(?= stiker)/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then(async (buffer) => {
                    stickers(socket, messages, buffer, 'image');
                });
            }

            if (messages[0].message.videoMessage && messages[0].message.videoMessage.caption.match(/^letoy(?= stiker)/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then((buffer) => {
                    stickers(socket, messages, buffer, 'video');
                });
            }
            
            if (messages[0].message.extendedTextMessage && messages[0].message.extendedTextMessage.text.match(/^letoy(?= stiker)/i)) {
                if(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.imageMessage){
                    const imgStream = await downloadContentFromMessage(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image');

                    const data = [];
                    imgStream.on('data', (chunk) => data.push(chunk));
                    imgStream.on('end', () => {
                        stickers(socket, messages, Buffer.concat(data), 'extimg');
                    });
                }

                if(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.videoMessage){
                    const imgDat = await downloadContentFromMessage(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.videoMessage, 'video');

                    const data = [];
                    imgDat.on('data', (chunk) => data.push(chunk));
                    imgDat.on('end', () => {
                        stickers(socket, messages, Buffer.concat(data), 'extvid');
                    });
                }
            }
        }
    });
}