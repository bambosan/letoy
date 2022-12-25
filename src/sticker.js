import { Sticker, StickerTypes } from 'wa-sticker-formatter/dist/index.js';

export default async function stickers(socket, messages, buffers, isImgMsg) {
    const arg = isImgMsg ? messages[0].message.imageMessage.caption.slice(14).trim() : messages[0].message.extendedTextMessage.text.slice(14).trim();

    const sticketConfig = {
        pack: arg || 'My Sticker',
        author: messages[0].pushName,
        type: StickerTypes.DEFAULT,
        categories: [],
        id: String(Math.floor(Math.random() * 1e8)),
        quality: 50,
        background: '#000000'
    };

    if (arg.match(/^full/)) {
        sticketConfig.pack = arg.slice(5) || 'my sticker';
        sticketConfig.type = StickerTypes.FULL;
    }

    if (arg.match(/^circle/)) {
        sticketConfig.pack = arg.slice(7) || 'my sticker';
        sticketConfig.type = StickerTypes.CIRCLE;
    }

    if (arg.match(/^cropped/)) {
        sticketConfig.pack = arg.slice(8) || 'my sticker';
        sticketConfig.type = StickerTypes.CROPPED;
    }

    const stc = new Sticker(buffers, sticketConfig);
    await socket.sendMessage(messages[0].key.remoteJid,
        await stc.toMessage(),
        { quoted: messages[0] }
    );
}