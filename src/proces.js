import { downloadMediaMessage } from '@adiwajshing/baileys';
import { downloadContentFromMessage } from '@adiwajshing/baileys/lib/Utils/messages-media.js';
import { Buffer } from 'node:buffer';

import { dalle, textc } from './openai.js';
import { imageSticker, videoSticker } from './sticker.js';
import { cppExec, cExec, pythonExec } from './compile.js';

const letoyHelp = `list perintah:
.cg (text completion)
.de (DALL-E)
.st (sticker)
.g++ (compile kode simple C++)
.gcc (compile kode simple C)
.python (run kode simple Python)`;

const stikerHelp = `.st [argumen 1] [argumen 2]
argumen 1 (opsional): def, cir, crop
argumen 2 (opsional): info stiker`;

export default async function msgUpsert(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        if (messages[0].key.remoteJid !== 'status@broadcast') {
            if(messages[0].message.conversation.match(/^\.letoy/i)){
                await socket.sendMessage(messages[0].key.remoteJid,
                    { text: letoyHelp },
                    { quoted: messages[0] }
                );
            }
            
            if(messages[0].message.conversation.match(/^\.st(?= h)/i)){
                await socket.sendMessage(messages[0].key.remoteJid,
                    { text: stikerHelp },
                    { quoted: messages[0] }
                );
            }
            
            if (messages[0].message.conversation.match(/^\.cg(?= \w)/i)) {
                await textc(socket, messages);
            }

            if (messages[0].message.conversation.match(/^\.de(?= \w)/i)) {
                await dalle(socket, messages);
            }

            if (messages[0].message.conversation.match(/^\.g\+\+/i)) {
                cppExec(socket, messages);
            }

            if (messages[0].message.conversation.match(/^\.gcc/i)) {
                cExec(socket, messages);
            }
            
            if (messages[0].message.conversation.match(/^\.python/i)) {
                pythonExec(socket, messages);
            }

            if (messages[0].message.imageMessage && messages[0].message.imageMessage.caption.match(/^\.st(?= \w)/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then(async (buffer) => {
                    await imageSticker(socket, messages, buffer, false);
                });
            }

            if (messages[0].message.videoMessage && messages[0].message.videoMessage.caption.match(/^\.st(?= \w)/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then(async (buffer) => {
                    await videoSticker(socket, messages, buffer, false);
                });
            }
            
            if (messages[0].message.extendedTextMessage && messages[0].message.extendedTextMessage.text.match(/^\.st(?= \w)/i)) {
                if(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.imageMessage){
                    const imageStream = await downloadContentFromMessage(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image');

                    const data = [];
                    imageStream.on('data', (chunk) => data.push(chunk));
                    imageStream.on('end', async () => {
                        await imageSticker(socket, messages, Buffer.concat(data), true);
                    });
                }

                if(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.videoMessage){
                    const videoStream = await downloadContentFromMessage(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.videoMessage, 'video');

                    const data = [];
                    videoStream.on('data', (chunk) => data.push(chunk));
                    videoStream.on('end', async () => {
                        await videoSticker(socket, messages, Buffer.concat(data), true);
                    });
                }
            }
        }
    });
}