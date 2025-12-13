// firebase-config.js - مع الحماية المنطقية
console.log("🔄 جاري تحميل إعدادات Firebase مع الحماية...");

// النطاقات المصرحة
const OFFICIAL_DOMAINS = [
    'wacelalorshe.github.io',
    'jedwal.netlify.app'
];

const CURRENT_DOMAIN = window.location.hostname;
const IS_OFFICIAL = OFFICIAL_DOMAINS.some(domain => CURRENT_DOMAIN.includes(domain)) || 
                   CURRENT_DOMAIN.includes('localhost');

if (!IS_OFFICIAL) {
    console.warn('⚠️ نطاق غير رسمي:', CURRENT_DOMAIN);
    
    // 1. إضافة علامة في localStorage
    localStorage.setItem('unauthorized_domain', CURRENT_DOMAIN);
    
    // 2. تسجيل المحاولة
    try {
        if (navigator.sendBeacon) {
            navigator.sendBeacon('https://wacelalorshe.github.io/jedwal/log.php', 
                JSON.stringify({
                    type: 'unauthorized_access',
                    domain: CURRENT_DOMAIN,
                    time: new Date().toISOString()
                })
            );
        }
    } catch(e) {}
}

// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqE7ZwveHg1dIhYf1Hlo7OpHyCZudeZvM",
    authDomain: "wacel-live.firebaseapp.com",
    databaseURL: "https://wacel-live-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wacel-live",
    storageBucket: "wacel-live.firebasestorage.app",
    messagingSenderId: "185108554006",
    appId: "1:185108554006:web:93171895b1d4bb07c6f037"
};

try {
    if (typeof firebase !== 'undefined') {
        // فقط للنطاقات المصرحة، استخدم Firebase الحقيقي
        if (IS_OFFICIAL) {
            window.firebaseApp = firebase.initializeApp(firebaseConfig);
            window.firebaseDb = firebase.database();
            window.firebaseAuth = firebase.auth();
            
            // إضافة علامة للنطاق الرسمي
            window.firebaseDb.ref('.info/connected').on('value', (snap) => {
                if (snap.val() === true) {
                    window.firebaseDb.ref('domain_verification').set({
                        domain: CURRENT_DOMAIN,
                        verified: true,
                        timestamp: Date.now()
                    });
                }
            });
            
            console.log("✅ Firebase نشط للنطاق الرسمي:", CURRENT_DOMAIN);
        } else {
            // للنطاقات غير الرسمية، استخدم نسخة محدودة
            console.log("🛡️ تحميل نسخة محدودة من Firebase");
            // ... نفس الكود السابق للنسخة المحدودة
        }
    }
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
}

console.log("🎯 Firebase Config loaded for domain:", CURRENT_DOMAIN);
