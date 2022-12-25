import { downloadMediaMessage } from '@adiwajshing/baileys';
import { downloadContentFromMessage } from '@adiwajshing/baileys/lib/Utils/messages-media.js';
import { dalle, textCompletion } from './openai.js';
import stickers from './sticker.js';
import { Buffer } from 'node:buffer';

export default async function msgUpsert(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        if (messages[0].key.remoteJid !== 'status@broadcast') {
            if (messages[0].message.conversation.match(/^dalle\W(?=\w)/i)) {
                dalle(socket, messages);
            }

            if (messages[0].message.conversation.match(/^tc\W(?=\w)/i)) {
                textCompletion(socket, messages);
            }

            if (messages[0].message.imageMessage && messages[0].message.imageMessage.caption.match(/^ts/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then(async (buffer) => {
                    stickers(socket, messages, buffer, true);
                });
            }

            if (messages[0].message.extendedTextMessage && messages[0].message.extendedTextMessage.text.match(/^ts/)) {
                if(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.imageMessage){
                    const imgDat = await downloadContentFromMessage(messages[0].message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image');
                    const data = [];
                    imgDat.on('data', (chunk) => data.push(chunk));
                    imgDat.on('end', () => {
                        stickers(socket, messages, Buffer.concat(data), false);
                    });
                }
            }
        }
    });
}