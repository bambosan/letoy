import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv';
dotenv.config();

const config = new Configuration({ apiKey: process.env.OPENAI_KEY_API });
const openai = new OpenAIApi(config);

export async function dalle(sc, messages){
    try {
        const dalle = await openai.createImage({
            prompt: messages[0].message.conversation.slice(5).trim(),
            n: 1,
            size: '512x512'
        });

        await sc.sendMessage(messages[0].key.remoteJid,
            { image: { url: dalle.data.data[0].url } },
            { quoted: messages[0] }
        );

    } catch (error) {
        if (error.response) {
            await sc.sendMessage(messages[0].key.remoteJid,
                { text: error.response.data.error.message },
                { quoted: messages[0] }
            );
        } else {
            console.error(error.message);
        }
    }
}

export async function textCompletion(sc, messages){
    try {
        const completions = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: messages[0].message.conversation.slice(2).trim(),
            temperature: 0,
            max_tokens: 3500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        if (completions.data.choices[0].finish_reason === 'stop') {
            await sc.sendMessage(messages[0].key.remoteJid,
                { text: completions.data.choices[0].text.trimStart() },
                { quoted: messages[0] }
            );
        }

    } catch (error) {
        if (error.response) {
            await sc.sendMessage(messages[0].key.remoteJid,
                { text: error.response.data.error.message },
                { quoted: messages[0] }
            );
        } else {
            console.error(error.message);
        }
    }
}