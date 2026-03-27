import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

const newsletterJid = '120363424932450219@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';
const packname = '˚🄴🄻🄼🄴🄽-🄹🄾🄴-🄱🄾🅃';
const redes = 'https://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V';

const GITHUB_REPO_OWNER = 'nevi-dev';
const GITHUB_REPO_NAME = 'Ellen-Joe-Bot-MD';
const GITHUB_BRANCH = 'main';

const CATEGORY_GROUPS = {
  '🦈 فيكتوريا هاوس كيبينج | المطور': ['owner'],
  '🔌 اتصال الشبكة | بوت فرعي': ['serbot'],
  '🔞 منطقة محظورة | غير لائق': ['nsfw', '+18'],
  '💖 تفاعلات عاطفية': ['emox'],
  '⚔️ اقتحام التجاويف | تقمص أدوار': ['rpg'],
  '📝 تسجيل المواطنين': ['rg'],
  '🎲 موالفة | غاتشا': ['gacha', 'waifus'], 
  '🏙️ نيو إيريدو | القائمة الأساسية': ['main'],
  '⚙️ بروتوكول المشرفين': ['admin', 'mods'],
  '🛠️ الدعم الفني | أدوات': ['tools', 'herramientas', 'transformador', 'info', 'economy', 'economia', 'premium', 'bot'],
  '🧠 الذكاء الاصطناعي': ['ai', 'search'],
  '🕹️ ترفيه | ألعاب': ['fun', 'game', 'games'], 
  '🖼️ محتوى مرئي | صور وملصقات': ['image', 'sticker'],
  '⬇️ التنزيلات | التحميل': ['downloads', 'dl', 'buscador', 'internet'],
  '👥 إدارة الفصائل | المجموعات': ['group'],
  '✨ ملفات الوسائط': ['anime', 'audio'],
  '⚙️ الإعدادات': ['nable'], 
};

const TAG_TO_GROUP = {};
for (const [groupName, tags] of Object.entries(CATEGORY_GROUPS)) {
  for (const tag of tags) { TAG_TO_GROUP[tag] = groupName; }
}

let handler = async (m, { conn, usedPrefix, text }) => {
  let enlacesMultimedia;
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    enlacesMultimedia = JSON.parse(fs.readFileSync(dbPath, 'utf-8')).links;
  } catch (e) {
    return conn.reply(m.chat, '❌ خطأ في قراءة قاعدة بيانات الروابط.', m);
  }

  let nombre = await conn.getName(m.sender);
  const horaRD = moment().tz("America/Santo_Domingo").format('h:mm A');

  // نظام الأوامر والفئات
  let comandosPorGrupo = {};
  Object.values(global.plugins).forEach(plugin => {
    if (!plugin.help || !plugin.tags) return;
    const tags = Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags];
    const help = Array.isArray(plugin.help) ? plugin.help : [plugin.help];

    tags.forEach(tag => {
      const groupName = TAG_TO_GROUP[tag] || '❓ قطاعات أخرى';
      if (!comandosPorGrupo[groupName]) comandosPorGrupo[groupName] = new Set();
      help.forEach(h => {
        if (!/^\$|^=>|^>/.test(h)) comandosPorGrupo[groupName].add(`${usedPrefix}${h}`);
      });
    });
  });

  const allGroupNames = Object.keys(comandosPorGrupo).sort();
  const CATEGORIES_PER_PAGE = 3;
  const totalPaginas = Math.ceil(allGroupNames.length / CATEGORIES_PER_PAGE);

  let paginaActual = 1;
  // دعم كلمتي pagina و صفحة
  const match = text.match(/(?:pagina|صفحة) (\d+)/i);
  if (match) paginaActual = Math.max(1, Math.min(parseInt(match[1]), totalPaginas));

  const startIndex = (paginaActual - 1) * CATEGORIES_PER_PAGE;
  const gruposPagina = allGroupNames.slice(startIndex, startIndex + CATEGORIES_PER_PAGE);

  const secciones = gruposPagina.map(groupName => {
    const commandList = Array.from(comandosPorGrupo[groupName]).sort().map(cmd => `  ○ ${cmd}`).join('\n');
    return `\n🔷 **${groupName}**\n${commandList}`;
  }).join('\n');

  // التحقق من الإصدار
  let localVersion = '1.0.0';
  let updateStatus = '✅ يعمل بشكل ممتاز';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    localVersion = pkg.version;
    const res = await axios.get(`https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/package.json`);
    if (localVersion !== res.data.version) updateStatus = '⚠️ يتوفر تحديث جديد';
  } catch (e) {}

  const sep = '——————————————————';
  const encabezado = `
🦈 **𝐄𝐋𝐋𝐄𝐍 𝐉𝐎𝐄 | قائمة الخدمات**
${sep}
*— (تثاؤب)... مرحباً بك في نيو إيريدو.*
*أخبرني بما تريده بسرعة، نوبتي ستنتهي قريباً.*

👤 **البروكسي:** ${nombre}
⌚ **الوقت:** ${horaRD}
${sep}
⚙️ **معلومات النظام**
| 🛠️ **الإصدار:** v${localVersion}
| 🔔 **الحالة:** ${updateStatus}
| ⏳ **مدة التشغيل:** ${clockString(process.uptime() * 1000)}
| 🏙️ **المستخدمين:** ${Object.keys(global.db?.data?.users || {}).length}
| 📑 **الأوامر:** ${Object.keys(global.plugins).length}
${sep}
📑 **القطاع:** ${paginaActual} / ${totalPaginas}
${sep}`.trim();

  const textoFinal = `${encabezado}\n${secciones}\n\n*— لا تطلب مني أي شيء آخر خارج ساعات عملي.*\n*${packname}*`;

  // الأزرار
  let buttons = [];
  if (paginaActual > 1) {
    buttons.push({ buttonId: `${usedPrefix}menu صفحة ${paginaActual - 1}`, buttonText: { displayText: '⬅️ السابق' }, type: 1 });
  }
  if (paginaActual < totalPaginas) {
    buttons.push({ buttonId: `${usedPrefix}menu صفحة ${paginaActual + 1}`, buttonText: { displayText: 'التالي ➡️' }, type: 1 });
  }

  // الوسائط المتعددة
  const videoGifURL = enlacesMultimedia.video[Math.floor(Math.random() * enlacesMultimedia.video.length)];
  const miniaturaRandom = enlacesMultimedia.imagen[Math.floor(Math.random() * enlacesMultimedia.imagen.length)];

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
    externalAdReply: {
      title: 'فيكتوريا هاوس كيبينج المحدودة',
      body: `خدمات القرش | صفحة ${paginaActual}`,
      thumbnailUrl: miniaturaRandom,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  try {
    const response = await fetch(videoGifURL);
    if (!response.ok) throw new Error();
    const videoBuffer = await response.buffer();

    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      gifPlayback: true, // تشغيل كصورة متحركة (GIF)
      caption: textoFinal,
      footer: packname,
      buttons: buttons.length > 0 ? buttons : undefined,
      headerType: 5,
      contextInfo
    }, { quoted: m });
  } catch (e) {
    await conn.sendMessage(m.chat, { 
      image: { url: miniaturaRandom }, 
      caption: textoFinal, 
      footer: packname,
      buttons: buttons.length > 0 ? buttons : undefined,
      contextInfo 
    }, { quoted: m });
  }
};

handler.help = ['اوامر'];
handler.tags = ['main'];
handler.command = ['اوامر', 'menú', 'help', 'اوامر', 'المهام']; // أضفت أوامر عربية لاستدعاء القائمة

export default handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
