// protection.js - نظام حماية البيانات من السرقة
console.log("🔒 تحميل نظام الحماية...");

class DataProtector {
    constructor() {
        this.secretKey = this.generateSecretKey();
        this.allowedOrigins = [
            'wacelalorshe.github.io',
            'jedwal.netlify.app',
            'localhost'
        ];
        console.log("✅ نظام الحماية جاهز للموقع:", window.location.hostname);
    }

    generateSecretKey() {
        // مفتاح فريد لكل موقع
        const siteKey = window.location.hostname.replace(/[^a-z0-9]/gi, '');
        const dateKey = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
        const domainHash = btoa(siteKey + dateKey + "JEDWAL_PROTECTION_2025");
        return domainHash.substring(0, 32);
    }

    checkOrigin() {
        const currentHost = window.location.hostname;
        const isAllowed = this.allowedOrigins.includes(currentHost);
        
        if (!isAllowed) {
            console.error("🚨 الموقع غير مصرح:", currentHost);
            alert("⚠️ هذا الموقع غير مصرح له بعرض المحتوى!");
            document.body.innerHTML = `
                <div style="text-align:center; padding:50px; background:#f8f9fa;">
                    <h2 style="color:red;">⛔ الوصول ممنوع</h2>
                    <p>هذا الموقع غير مصرح له بعرض محتوى وسيل لايف برو</p>
                    <p>المواقع الرسمية فقط:</p>
                    <ul style="list-style:none; padding:20px;">
                        <li>🔗 <a href="https://wacelalorshe.github.io/jedwal/">https://wacelalorshe.github.io/jedwal/</a></li>
                        <li>🔗 <a href="https://jedwal.netlify.app/">https://jedwal.netlify.app/</a></li>
                    </ul>
                </div>
            `;
            return false;
        }
        return true;
    }

    encryptData(data) {
        try {
            let encrypted = '';
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i);
                const keyChar = this.secretKey.charCodeAt(i % this.secretKey.length);
                encrypted += String.fromCharCode(charCode ^ keyChar);
            }
            return btoa(encrypted);
        } catch (e) {
            console.error("❌ خطأ في التشفير:", e);
            return data;
        }
    }

    decryptData(encryptedData) {
        try {
            const decoded = atob(encryptedData);
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyChar = this.secretKey.charCodeAt(i % this.secretKey.length);
                decrypted += String.fromCharCode(charCode ^ keyChar);
            }
            return decrypted;
        } catch (e) {
            console.error("❌ خطأ في فك التشفير:", e);
            return encryptedData;
        }
    }

    encryptMatch(matchData) {
        const encryptedMatch = { ...matchData };
        
        // تشفير الروابط
        if (matchData.links && Array.isArray(matchData.links)) {
            encryptedMatch.protectedLinks = matchData.links.map(link => 
                this.encryptData(link)
            );
            delete encryptedMatch.links;
        }
        
        // تشفير رابط XPola
        if (matchData.xmtvLink) {
            encryptedMatch.protectedXmtv = this.encryptData(matchData.xmtvLink);
            delete encryptedMatch.xmtvLink;
        }
        
        // إضافة معلومات التشفير
        encryptedMatch.encrypted = true;
        encryptedMatch.domain = window.location.hostname;
        encryptedMatch.timestamp = Date.now();
        
        return encryptedMatch;
    }

    decryptMatch(encryptedMatch) {
        if (!encryptedMatch.encrypted) return encryptedMatch;
        
        const decryptedMatch = { ...encryptedMatch };
        
        // فك تشفير الروابط العادية
        if (encryptedMatch.protectedLinks) {
            decryptedMatch.links = encryptedMatch.protectedLinks.map(encryptedLink => 
                this.decryptData(encryptedLink)
            );
            delete decryptedMatch.protectedLinks;
        }
        
        // فك تشفير رابط XPola
        if (encryptedMatch.protectedXmtv) {
            decryptedMatch.xmtvLink = this.decryptData(encryptedMatch.protectedXmtv);
            delete decryptedMatch.protectedXmtv;
        }
        
        delete decryptedMatch.encrypted;
        delete decryptedMatch.domain;
        
        return decryptedMatch;
    }

    createXmtvLink(linksArray) {
        try {
            const jsonString = JSON.stringify(linksArray);
            const encryptedLinks = this.encryptData(jsonString);
            return "xmtv://" + encryptedLinks;
        } catch (e) {
            console.error("❌ خطأ في إنشاء رابط xmtv:", e);
            return "#";
        }
    }

    parseXmtvLink(xmtvLink) {
        try {
            if (!xmtvLink.startsWith("xmtv://")) return [];
            const encryptedPart = xmtvLink.replace("xmtv://", "");
            const decryptedJson = this.decryptData(encryptedPart);
            return JSON.parse(decryptedJson);
        } catch (e) {
            console.error("❌ خطأ في فك رابط xmtv:", e);
            return [];
        }
    }
}

// إنشاء نسخة عامة
if (!window.DataProtector) {
    window.DataProtector = new DataProtector();
    
    // التحقق من النطاق عند التحميل
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.DataProtector.checkOrigin()) {
            return;
        }
        console.log("✅ الموقع مصرح به:", window.location.hostname);
    });
}

console.log("✅ نظام الحماية جاهز!");
