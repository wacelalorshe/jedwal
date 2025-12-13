// protection.js - نظام حماية البيانات من السرقة
console.log("🔒 تحميل نظام الحماية...");

class DataProtector {
    constructor() {
        this.secretKey = this.generateSecretKey();
        this.allowedOrigins = [
            'wacelalorshe.github.io',
            'jedwal.netlify.app',
            'localhost',
            '127.0.0.1'
        ];
        console.log("✅ نظام الحماية جاهز للموقع:", window.location.hostname);
    }

    generateSecretKey() {
        // مفتاح فريد لكل موقع
        const siteKey = window.location.hostname.replace(/[^a-z0-9]/gi, '');
        const dateKey = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
        const domainHash = btoa(siteKey + dateKey + "JEDWAL_PROTECTION_2024");
        return domainHash.substring(0, 32);
    }

    checkOrigin() {
        const currentHost = window.location.hostname;
        const isAllowed = this.allowedOrigins.includes(current
