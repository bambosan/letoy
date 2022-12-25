import { downloadMediaMessage } from '@adiwajshing/baileys';
import { downloadContentFromMessage } from '@adiwajshing/baileys/lib/Utils/messages-media.js';
import { dalle, textc } from './openai.js';
import stickers from './sticker.js';
import { Buffer } from 'node:buffer';

const helpMsg = `jawab:
  letoy jawab pesan..

dalle:
  letoy dalle pesan..

stiker:
  letoy stiker <arg1> <arg2>
  arg1 (opsional): full, circle, cropped
  arg2 (opsional): info stiker pack / pesan..
`
export default async function msgUpsert(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        if (messages[0].key.remoteJid !== 'status@broadcast') {
            if (messages[0].message.conversation.match(/^letoy(?= jawab \w)/i)) {
                textc(socket, messages);
            }

            if(messages[0].message.conversation.match(/^letoy(?= help)/i)){
                await socket.sendMessage(messages[0].key.remoteJid,
                    { text: helpMsg },
                    { quoted: messages[0] }
                );
            }
            
            if (messages[0].message.conversation.match(/^letoy(?= dalle \w)/i)) {
                dalle(socket, messages);
            }
            
            if (messages[0].message.imageMessage && messages[0].message.imageMessage.caption.match(/^letoy(?= stiker)/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {}).then(async (buffer) => {
                    stickers(socket, messages, buffer, true);
                });
            }
            
            if (messages[0].message.extendedTextMessage && messages[0].message.extendedTextMessage.text.match(/^letoy(?= stiker)/i)) {
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