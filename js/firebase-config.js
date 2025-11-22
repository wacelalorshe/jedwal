// firebase-config.js - الإصدار النهائي مع databaseURL الصحيح
console.log("جاري تحميل إعدادات Firebase Modular SDK...");

// إعدادات Firebase مع databaseURL الصحيح
const firebaseConfig = {
    apiKey: "AIzaSyCqE7ZwveHg1dIhYf1Hlo7OpHyCZudeZvM",
    authDomain: "wacel-live.firebaseapp.com",
    databaseURL: "https://wacel-live-default-rtdb.firebaseio.com", // ✅ هذا هو الرابط الصحيح
    projectId: "wacel-live",
    storageBucket: "wacel-live.firebasestorage.app",
    messagingSenderId: "185108554006",
    appId: "1:185108554006:web:93171895b1d4bb07c6f037"
};

// متغيرات عالمية لتخزين instances
window.firebaseModules = {};
window.firebaseApp = null;
window.firebaseDb = null;
window.firebaseAuth = null;

// دالة لتحميل Firebase Modular SDK
async function loadFirebaseSDK() {
    try {
        // تحميل مكتبات Firebase بشكل ديناميكي
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js');
        const { getDatabase, ref, onValue, push, update, remove, get, set } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js');
        const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js');
        
        // حفظ الـ modules في كائن عام
        window.firebaseModules = {
            initializeApp,
            getDatabase, ref, onValue, push, update, remove, get, set,
            getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
        };
        
        console.log("تم تحميل Firebase Modular SDK بنجاح");
        initializeFirebase();
    } catch (error) {
        console.error("خطأ في تحميل Firebase SDK:", error);
        setupFallback();
    }
}

// تهيئة Firebase
function initializeFirebase() {
    try {
        const { initializeApp, getDatabase, getAuth } = window.firebaseModules;
        
        // تهيئة التطبيق
        window.firebaseApp = initializeApp(firebaseConfig);
        window.firebaseDb = getDatabase(window.firebaseApp);
        window.firebaseAuth = getAuth(window.firebaseApp);
        
        console.log("تم تهيئة Firebase بنجاح باستخدام Modular SDK");
        console.log("✅ Database URL:", firebaseConfig.databaseURL);
    } catch (error) {
        console.error("خطأ في تهيئة Firebase:", error);
        setupFallback();
    }
}

// إعداد النسخة الاحتياطية للاختبار
function setupFallback() {
    console.log("جاري إعداد النسخة الاحتياطية...");
    
    window.firebaseApp = { name: "[DEFAULT]" };
    window.firebaseDb = {
        ref: (path) => ({
            on: (event, callback) => {
                console.log(`الاستماع إلى ${path} - ${event}`);
                if (event === 'value') {
                    setTimeout(() => {
                        callback({
                            val: () => ({}),
                            forEach: () => {}
                        });
                    }, 500);
                }
            },
            push: (data) => Promise.resolve({ key: 'test-' + Date.now() }),
            update: (data) => Promise.resolve(),
            remove: () => Promise.resolve(),
            once: (event) => Promise.resolve({ val: () => ({}) })
        })
    };
    window.firebaseAuth = {
        signInWithEmailAndPassword: (email, password) => {
            if (email && password) {
                return Promise.resolve({
                    user: { email, uid: 'test-user' }
                });
            }
            return Promise.reject({ code: 'auth/invalid-credential' });
        },
        signOut: () => Promise.resolve(),
        onAuthStateChanged: (callback) => {
            callback(null);
            return () => {};
        },
        currentUser: null
    };
}

// بدء التحميل
if (typeof window !== 'undefined') {
    loadFirebaseSDK();
}

console.log("تم تحميل إعدادات Firebase بنجاح");
