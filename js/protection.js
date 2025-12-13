// protection.js - حماية مجانية وفورية
console.log("🛡️ تحميل نظام الحماية...");

class DataProtector {
    constructor() {
        this.secretKey = this.generateSecretKey();
        this.allowedOrigins = [
            'https://wacelalorshe.github.io',
            'https://jedwal.netlify.app',
            'http://localhost'
        ];
    }

    generateSecretKey() {
        // مفتاح فريد لكل موقع
        const siteKey = window.location.origin.replace(/[^a-zA-Z0-9]/g, '');
        const dateKey = new Date().toISOString().split('T')[0].replace(/-/g, '');
        return btoa(siteKey + dateKey + "JedwalProtection2025");
    }

    encryptData(data) {
        // تشفير بسيط للبيانات
        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const keyChar = this.secretKey.charCodeAt(i % this.secretKey.length);
            encrypted += String.fromCharCode(charCode ^ keyChar);
        }
        return btoa(encrypted);
    }

    decryptData(encryptedData) {
        // فك التشفير
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
            console.error("❌ فك التشفير فشل:", e);
            return "";
        }
    }

    checkOrigin() {
        const currentOrigin = window.location.origin;
        const isAllowed = this.allowedOrigins.includes(currentOrigin);
        
        if (!isAllowed) {
            console.warn("⚠️ الموقع غير مسموح:", currentOrigin);
            return false;
        }
        return true;
    }

    protectLinks(links) {
        if (!Array.isArray(links)) return [];
        return links.map(link => {
            return {
                encrypted: this.encryptData(link),
                domain: window.location.hostname
            };
        });
    }

    unprotectLinks(protectedLinks) {
        if (!Array.isArray(protectedLinks)) return [];
        return protectedLinks.map(item => {
            if (item.domain === window.location.hostname) {
                return this.decryptData(item.encrypted);
            }
            return "";
        }).filter(link => link);
    }
}

// إنشاء نسخة عامة
window.DataProtector = new DataProtector();
console.log("✅ نظام الحماية جاهز!");
