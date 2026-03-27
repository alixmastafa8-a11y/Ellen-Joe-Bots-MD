import fs from 'fs';
import path from 'path';
import translate from '@vitalets/google-translate-api';

const dbPath = path.resolve('./src/database/lengu-db.json');
let db = {};

// Cargar DB
try {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
} catch (error) {
    console.error('No se pudo cargar la base de datos de idiomas. Creando un nuevo archivo...');
    fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
}

// Guardar DB
function saveDb() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

/**
 * Establecer idioma de usuario
 */
export function setLanguage(userId, langCode) {
    db[userId] = langCode;
    saveDb();
}

/**
 * Obtener idioma de usuario
 */
export function getLanguage(userId) {
    return db[userId] || 'es';
}

/**
 * Traducción inteligente: ignora comandos y URLs
 */
export async function translateIfNeeded(text, targetLang) {
    if (targetLang === 'es') return text;

    try {
        // Regex
        const commandRegex = /^[#./!]\w+/; 
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

        // Extraer comando
        const commandMatch = text.match(commandRegex);
        const commandPart = commandMatch ? commandMatch[0] : null;

        // Reemplazar URLs por placeholders
        let urls = [];
        let placeholderIndex = 0;
        const textWithPlaceholders = text.replace(urlRegex, match => {
            urls.push(match);
            return `__URL${placeholderIndex++}__`;
        });

        // Texto a traducir (sin comando inicial)
        let textToTranslate = commandPart
            ? textWithPlaceholders.replace(commandRegex, "").trim()
            : textWithPlaceholders;

        // Traducir solo lo necesario
        let translatedPart = textToTranslate
            ? (await translate(textToTranslate, { to: targetLang })).text
            : "";

        // Reconstruir mensaje final
        let finalText = "";
        if (commandPart) finalText += commandPart + " ";
        finalText += translatedPart;

        // Restaurar URLs
        urls.forEach((url, i) => {
            finalText = finalText.replace(`__URL${i}__`, url);
        });

        return finalText.trim();

    } catch (error) {
        console.error("Error al traducir:", error);
        return text;
    }
}

/**
 * Enviar mensaje traducido
 * @param {object} conn - conexión baileys
 * @param {string} jid - id destino
 * @param {string} text - texto original en español
 * @param {string} sender - id del remitente (para saber su idioma)
 */
export async function sendTranslated(conn, jid, text, sender) {
    const lang = getLanguage(sender);
    const finalText = await translateIfNeeded(text, lang);
    return conn.sendMessage(jid, { text: finalText });
}