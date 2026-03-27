import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // التحقق من أن المستخدم أدخل المعطيات الثلاثة مفصولة بعلامة |
    if (!text || !text.includes('|') || text.split('|').length < 3) {
        return m.reply(`❌ *صيغة خاطئة!*\n\nاستخدم الأمر بالشكل التالي:\n*${usedPrefix + command} اسم_الملف.js | النص_القديم | النص_الجديد*\n\n*مثال:*\n${usedPrefix + command} menu.js | الرابط_القديم | الرابط_الجديد`);
    }

    // فصل المدخلات وتنظيفها من المسافات الزائدة
    let [fileName, oldText, newText] = text.split('|').map(v => v.trim());
    
    // التأكد من أن اسم الملف ينتهي بـ .js
    if (!fileName.endsWith('.js')) fileName += '.js';

    // تحديد مسار الملف المطلوب داخل مجلد الإضافات
    let filePath = path.join(process.cwd(), 'plugins', fileName);

    // التحقق من وجود الملف
    if (!fs.existsSync(filePath)) {
        return m.reply(`❌ الملف *${fileName}* غير موجود في مجلد plugins.`);
    }

    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // التحقق مما إذا كان النص القديم موجوداً أصلاً في الملف
        if (!content.includes(oldText)) {
            return m.reply(`⚠️ لم يتم العثور على النص المذكور داخل الملف *${fileName}*.\n\nتأكد من نسخ النص القديم بدقة.`);
        }

        // استبدال النص وحفظ الملف
        let newContent = content.split(oldText).join(newText); 
        fs.writeFileSync(filePath, newContent, 'utf-8');

        // رسالة التأكيد
        let resultMsg = `✅ *تم التعديل بنجاح في ملف ${fileName}!*\n\n`;
        resultMsg += `🔍 *النص القديم:* \n${oldText}\n\n`;
        resultMsg += `✨ *النص الجديد:* \n${newText || '(تم الحذف)'}`;

        m.reply(resultMsg);

    } catch (err) {
        console.error(err);
        m.reply(`❌ حدث خطأ أثناء محاولة تعديل الملف:\n${err.message}`);
    }
};

handler.help = ['تعديل1'];
handler.tags = ['owner'];
// تفعيل الأمر ليعمل بـ .تعديل1
handler.command = /^(تعديل1)$/i;
// صلاحية للمطور فقط
handler.rowner = true; 

export default handler;
