import { downloadMediaMessage } from '@adiwajshing/baileys';
import { downloadContentFromMessage } from '@adiwajshing/baileys/lib/Utils/messages-media.js';
import { dalle, textc } from './openai.js';
import { imageSticker, videoSticker } from './sticker.js';
import { Buffer } from 'node:buffer';

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
                await textc(socket, messages);
            }

            if (messages[0].message.conversation.match(/^letoy(?= dalle \w)/i)) {
                await dalle(socket, messages);
            }
            
            if (messages[0].message.imageMessage && messages[0].message.imageMessage.caption.match(/^letoy(?= stiker)/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then(async (buffer) => {
                    await imageSticker(socket, messages, buffer, false);
                });
            }

            if (messages[0].message.videoMessage && messages[0].message.videoMessage.caption.match(/^letoy(?= stiker)/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then(async (buffer) => {
                    await videoSticker(socket, messages, buffer, false);
                });
            }
            
            if (messages[0].message.extendedTextMessage && messages[0].message.extendedTextMessage.text.match(/^letoy(?= stiker)/i)) {
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