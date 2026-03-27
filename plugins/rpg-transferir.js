import fetch from 'node-fetch';

// Configuración del Newsletter/Canal
const newsletterJid = '120363424932450219@newsletter';
const newsletterName = '⸙ְ̻࠭ꪆ🦈 𝐄llen 𝐉ᴏ𝐄 𖥔 Sᥱrvice';

async function handler(m, { conn, args, usedPrefix, command }) {
    const user = global.db.data.users[m.sender];
    const name = conn.getName(m.sender);
    const bankType = 'bank'; 
    const txState = 'pendingLocalTx'; 

    // ContextInfo estético
    const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName,
            serverMessageId: -1
        },
        externalAdReply: {
            title: '🦈 𝙑𝙄𝘾𝙏𝙊𝙍𝙄𝘼 𝙃𝙊𝙐𝙎𝙀𝙆𝙀𝙀𝙋𝙄𝙉𝙂',
            body: `— Gestión de Fondos para ${name}`,
            thumbnail: icons, 
            sourceUrl: redes,
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    // --- 1. DETECTAR DESTINATARIO Y MONTO ---
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
    let amount;

    // Lógica para procesar CONFIRM/CANCEL de los botones
    let isConfirmation = false;
    if (args[0] === 'CONFIRM' || args[0] === 'CANCEL') {
        isConfirmation = true;
        const action = args[0];
        amount = parseInt(args[1]);
        who = args[2];

        const pendingTx = user[txState];
        if (!pendingTx || pendingTx.amount !== amount || pendingTx.recipient !== who) {
            user[txState] = null;
            return conn.reply(m.chat, `*— Tsk.* Esa transferencia ya no es válida o expiró. Inténtalo de nuevo.`, m, { contextInfo });
        }

        if (action === 'CANCEL') {
            user[txState] = null;
            return conn.reply(m.chat, `*— Bien.* He cancelado el envío de **${amount} ${moneda}**. Me vuelvo a mi descanso.`, m, { contextInfo });
        }
    } else {
        // Comando normal: .transferir <monto> (respondiendo o mencionando)
        amount = parseInt(args[0]);
    }

    if (!who) return conn.reply(m.chat, `*— (Bostezo)*... Responde a alguien o menciónalo para enviarle dinero. No voy a adivinar a quién.`, m, { contextInfo });
    if (!amount || isNaN(amount) || amount < 100) return conn.reply(m.chat, `*— Oye...* Dime una cantidad válida (mínimo 100 ${moneda}). No me hagas trabajar por nada.`, m, { contextInfo });

    // --- 2. VALIDACIONES ---
    if (user[bankType] < amount) {
        return conn.reply(m.chat, `*— Tsk.* No tienes suficiente en el banco. Tu saldo es de **${user[bankType]} ${moneda}**. Vuelve cuando seas rico.`, m, { contextInfo });
    }

    if (who === m.sender) {
        return conn.reply(m.chat, `*— ¿En serio?* No puedes enviarte dinero a ti mismo. Qué pérdida de tiempo.`, m, { contextInfo });
    }

    if (!(who in global.db.data.users)) {
        return conn.reply(m.chat, `*— ¿Eh?* Ese usuario no está en mis registros. Qué problemático.`, m, { contextInfo });
    }

    // --- 3. PROCESO DE CONFIRMACIÓN ---
    if (!isConfirmation) {
        user[txState] = { amount, recipient: who };

        const confirmationText = `⚠️ **¿𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒 𝐋𝐀 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄𝐍𝐂𝐈𝐀?** ⚠️\n\n*— Escucha...* ¿Seguro que quieres enviar **${amount} ${moneda}** a @${who.split('@')[0]}?\n\n*El dinero se descontará de tu banco inmediatamente.*`;

        // Botones (usando comandos ocultos)
        const buttons = [
            { buttonId: `${usedPrefix + command} CONFIRM ${amount} ${who}`, buttonText: { displayText: '✅ SÍ, ENVIAR' }, type: 1 },
            { buttonId: `${usedPrefix + command} CANCEL ${amount} ${who}`, buttonText: { displayText: '❌ NO, CANCELAR' }, type: 1 }
        ];

        contextInfo.mentionedJid.push(who);
        return conn.sendMessage(m.chat, { 
            text: confirmationText, 
            footer: 'Victoria Housekeeping - Servicio de Fondos',
            buttons, 
            headerType: 1,
            contextInfo 
        }, { quoted: m });
    }

    // --- 4. EJECUCIÓN FINAL ---
    if (isConfirmation) {
        user[txState] = null;
        const recipientData = global.db.data.users[who];

        user[bankType] -= amount;
        recipientData[bankType] = (recipientData[bankType] || 0) + amount;

        const successMsg = `🦈 **¡𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄𝐍𝐂𝐈𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀!**\n\n*— Trato hecho.* He movido los fondos. @${who.split('@')[0]} ha recibido **${amount} ${moneda}** en su banco.\n\n💰 **Tu saldo actual:** ${user[bankType]} ${moneda}\n\n*— Mi trabajo terminó. No me molestes.*`;

        contextInfo.mentionedJid.push(who);
        return conn.reply(m.chat, successMsg, m, { contextInfo });
    }
}

handler.help = ['pay <monto>', 'transferir <monto>'];
handler.tags = ['rpg'];
handler.command = ['pay', 'transfer', 'transferir'];
handler.group = true;
handler.register = true;

export default handler;
