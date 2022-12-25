import { Sticker, StickerTypes } from 'wa-sticker-formatter/dist/index.js';

function selectType(sticketConfig, arg){
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
    return sticketConfig;
}

export async function videoSticker(socket, messages, data, isExtMsg){
    const arg = isExtMsg ? messages[0].message.extendedTextMessage.text.slice(13).trim() : messages[0].message.videoMessage.caption.slice(13).trim();
    const sticketConfig = {
        pack: arg || 'My Sticker',
        author: messages[0].pushName,
        type: StickerTypes.FULL,
        categories: undefined,
        id: String(Math.floor(Math.random() * 1e8)),
        quality: 1,
        background: '#000000'
    };

    sticketConfig = selectType(arg);

    const stickers = new Sticker(data, sticketConfig);
    await socket.sendMessage(messages[0].key.remoteJid,
        await stickers.toMessage(),
        { quoted: messages[0] }
    );
}

export async function imageSticker(socket, messages, data, isExtMsg) {
    let arg = isExtMsg ? messages[0].message.extendedTextMessage.text.slice(13).trim() : messages[0].message.imageMessage.caption.slice(13).trim();
    const sticketConfig = {
        pack: arg || 'My Sticker',
        author: messages[0].pushName,
        type: StickerTypes.FULL,
        categories: undefined,
        id: String(Math.floor(Math.random() * 1e8)),
        quality: 50,
        background: '#000000'
    };

    sticketConfig = selectType(arg);

    const stc = new Sticker(data, sticketConfig);
    await socket.sendMessage(messages[0].key.remoteJid,
        await stc.toMessage(),
        { quoted: messages[0] }
    );
}