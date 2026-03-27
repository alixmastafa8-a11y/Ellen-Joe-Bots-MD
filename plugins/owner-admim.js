import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // التحقق من وجود نص واسم للملف
    if (!m.quoted) throw `*⚠️ خطأ:* قم بالرد على الكود الذي تريد حفظه.`
    if (!text) throw `*📂 يرجى تحديد اسم للأمر الجديد.*\nمثال: ${usedPrefix + command} test`

    // تجهيز اسم الملف والمسار
    let name = text.replace(/\s+/g, '_').toLowerCase()
    let filePath = path.join(process.cwd(), 'plugins', `${name}.js`)

    // منع استبدال ملفات موجودة مسبقاً
    if (fs.existsSync(filePath)) throw `*🚨 تنبيه:* هذا الملف موجود بالفعل في مجلد الأوامر!`

    try {
        // جلب محتوى الكود من الرسالة المقتبسة
        let code = m.quoted.text ? m.quoted.text : m.quoted.caption ? m.quoted.caption : null
        if (!code) throw `*❌ فشل:* لم يتم العثور على محتوى برمجي في الرسالة.`

        // كتابة الملف في مجلد plugins
        fs.writeFileSync(filePath, code)

        // رسالة تأكيد بتنسيق كود أنيق
        let response = `
┌─〔 **SUCCESS | حفظ أمر** 〕
├──────────────────
│ 📁 **المسار:** /plugins/${name}.js
│ 🛠️ **الأمر:** ${usedPrefix + name}
│ ✨ **الحالة:** تم الحفظ بنجاح
└──────────────────
`
        await conn.reply(m.chat, response.trim(), m)

    } catch (e) {
        console.error(e)
        throw `*❌ حدث خطأ تقني:* ${e.message}`
    }
}

handler.help = ['addcmd <name>']
handler.tags = ['owner']
handler.command = /^(addcmd|حفظ|save)$/i
handler.owner = true // للأمان: المطور فقط من يحفظ الأوامر

export default handler
