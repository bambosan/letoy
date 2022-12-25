import { Sticker, StickerTypes } from 'wa-sticker-formatter/dist/index.js';

export default async function stickers(socket, messages, data, msgtype) {
    let arg = '';
    if(msgtype === 'image'){
        arg = messages[0].message.imageMessage.caption.slice(13).trim();
    }
    if(msgtype === 'video'){
        arg = messages[0].message.videoMessage.caption.slice(13).trim();   
    }
    if(msgtype === 'extimg' || msgtype === 'extvid'){
        arg = messages[0].message.extendedTextMessage.text.slice(13).trim();
    }

    const sticketConfig = {
        pack: arg || 'My Sticker',
        author: messages[0].pushName,
        type: StickerTypes.FULL,
        categories: undefined,
        id: String(Math.floor(Math.random() * 1e8)),
        quality: (msgtype === 'video' || msgtype === 'extvid') ? 1 : 50,
        background: '#000000'
    };

    if (arg.match(/^default/)) {
        sticketConfig.pack = arg.slice(5) || 'my sticker';
        sticketConfig.type = StickerTypes.DEFAULT;
    }

    if (arg.match(/^circle/)) {
        sticketConfig.pack = arg.slice(7) || 'my sticker';
        sticketConfig.type = StickerTypes.CIRCLE;
    }

    if (arg.match(/^cropped/)) {
        sticketConfig.pack = arg.slice(8) || 'my sticker';
        sticketConfig.type = StickerTypes.CROPPED;
    }

    const stc = new Sticker(data, sticketConfig);
    await socket.sendMessage(messages[0].key.remoteJid,
        await stc.toMessage(),
        { quoted: messages[0] }
    );
}