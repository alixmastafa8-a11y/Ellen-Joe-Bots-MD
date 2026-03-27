// --- VALORES NECESARIOS ---
const newsletterJid = '120363424932450219@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';
const packname = '˚🄴🄻🄼🄴🄽-🄹🄾🄴-🄱🄾🅃';
const redes = 'https://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V'; 

/**
 * Plugin centralizado para manejar mensajes de error de permisos.
 */
const handler = async (type, conn, m, comando) => {
    // Variable global o importada que contiene el buffer de la imagen
    const thumbnail = global.icons ? global.icons : null;

    // Mensajes con la personalidad de Ellen Joe
    const msg = {
        rowner: `『🦈』¿Intentando usar *${comando}*? Solo mi Creador puede tocar mi cola de tiburón, y tú definitivamente no eres él. Aléjate.`,
        owner: `『⚙️』Ese comando es exclusivo para la gerencia (Owners). No insistas, tengo un batido que terminar. 🙄`,
        mods: `『🔌』¿Permisos para *${comando}*? Solo mis Moderadores autorizados. Tú no estás en la lista. 😏`,
        premium: `『🌟』¿Quieres atención especial con *${comando}*? Paga el servicio Premium. No trabajo gratis fuera de mi horario. 💅`,
        group: `『🫂』Qué pesado... *${comando}* es solo para grupos. No me busques en privado para esto. Baka~`,
        private: `『🏠』Este comando es para chats privados. No hagas ruido aquí en el grupo, es molesto. 😒`,
        admin: `『👑』Solo los Admins que mantienen el orden pueden usar *${comando}*. Tú solo eres un cliente más, espera tu turno. 💁‍♀️`,
        botAdmin: `『🚫』¿Cómo esperas que ejecute *${comando}* si no soy Admin? Dame los permisos de una vez. 🤨`,
        unreg: `『📝』Ni siquiera tienes un contrato firmado. Regístrate con: *#reg Nombre.Edad* antes de pedirme algo. 😈`,
        restrict: `『⛔』Función restringida. Ni con un aumento de sueldo te dejaría usar *${comando}*. ¡Next! 😜`
    }[type];

    if (msg) {
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
                title: packname,
                body: '🦈 ¡SERVICIO DENEGADO! 🦈',
                thumbnail: icons,
                sourceUrl: redes,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };

        return conn.reply(m.chat, msg, m, { contextInfo }).then(_ => m.react('✖️'));
    }
    return true;
};

export default handler;
