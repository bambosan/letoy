import { downloadMediaMessage } from '@adiwajshing/baileys';
import { dalle, textCompletion } from './openai.js';
import stickers from './sticker.js';

export default async function msgUpsert(socket){
    socket.ev.on('messages.upsert', async ({ messages }) => {
        if (messages[0].key.remoteJid !== 'status@broadcast') {
            if (messages[0].message.conversation.match(/^dalle\W(?=\w)/i)) {
                dalle(socket, messages);
            }

            if (messages[0].message.conversation.match(/^tc\W(?=\w)/i)) {
                textCompletion(socket, messages);
            }

            if (messages[0].message.imageMessage && messages[0].message.imageMessage.caption.match(/^ts/i)) {
                downloadMediaMessage(messages[0], 'buffer', {}, {})
                    .then(async (buffer) => {
                        stickers(socket, messages, buffer);
                    });
            }
        }
    });
}