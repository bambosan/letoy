import compileRun from "compile-run";
import * as dotenv from 'dotenv';
dotenv.config();

export function cppExec(socket, messages){
    compileRun.cpp.runSource(messages[0].message.conversation.slice(4).trim(), { executionPath: process.env.CPP_EXEC }, async (err, res) => {
        if(err){
            await socket.sendMessage(messages[0].key.remoteJid,
                { text: res.stderr.trim() },
                { quoted: messages[0] }
            );
        } else {
            await socket.sendMessage(messages[0].key.remoteJid,
                { text: res.stdout.trim() },
                { quoted: messages[0] }
            );
        }
    });
}

export function cExec(socket, messages){
    compileRun.c.runSource(messages[0].message.conversation.slice(4).trim(), { executionPath: process.env.C_EXEC }, async (err, res) => {
        if(err){
            await socket.sendMessage(messages[0].key.remoteJid,
                { text: res.stderr.trim() },
                { quoted: messages[0] }
            );
        } else {
            await socket.sendMessage(messages[0].key.remoteJid,
                { text: res.stdout.trim() },
                { quoted: messages[0] }
            );
        }
    });
}

export function pythonExec(socket, messages){
    compileRun.python.runSource(messages[0].message.conversation.slice(7).trim(), { executionPath: process.env.PYTHON_EXEC }, async (err, res) => {
        if(err){
            await socket.sendMessage(messages[0].key.remoteJid,
                { text: res.stderr.trim() },
                { quoted: messages[0] }
            );
        } else {
            await socket.sendMessage(messages[0].key.remoteJid,
                { text: res.stdout.trim() },
                { quoted: messages[0] }
            );
        }
    });
}

