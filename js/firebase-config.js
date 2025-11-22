// firebase-config.js - الإصدار النهائي مع databaseURL الصحيح للمنطقة الجديدة
console.log("جاري تحميل إعدادات Firebase Modular SDK...");

// إعدادات Firebase مع databaseURL الصحيح للمنطقة asia-southeast1
const firebaseConfig = {
    apiKey: "AIzaSyCqE7ZwveHg1dIhYf1Hlo7OpHyCZudeZvM",
    authDomain: "wacel-live.firebaseapp.com",
    databaseURL: "https://wacel-live-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ الرابط الجديد
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
        console.log("✅ المنطقة: asia-southeast1 (جنوب شرق آسيا)");
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
                            val: () => ({
                                // بيانات تجريبية للاختبار
                                "test-match-1": {
                                    league: "الدوري الانجليزي الممتاز",
                                    team1: "نوتينغهام",
                                    team2: "برينتفورد",
                                    time: "04:00م",
                                    channel: "bein sport 2",
                                    commentator: "أحمد البلوشي",
                                    links: ["https://example.com/stream1"]
                                }
                            }),
                            forEach: function(callback) {
                                const data = this.val();
                                Object.keys(data).forEach(key => {
                                    callback({
                                        key: key,
                                        val: () => data[key]
                                    });
                                });
                            }
                        });
                    }, 1000);
                }
            },
            push: (data) => Promise.resolve({ key: 'test-' + Date.now() }),
            update: (data) => Promise.resolve(),
            remove: () => Promise.resolve(),
            once: (event) => Promise.resolve({ 
                val: () => ({
                    league: "الدوري الانجليزي الممتاز",
                    team1: "نوتينغهام",
                    team2: "برينتفورد",
                    time: "04:00م",
                    channel: "bein sport 2",
                    commentator: "أحمد البلوشي",
                    links: ["https://example.com/stream1"]
                }),
                exists: () => true
            })
        })
    };
    window.firebaseAuth = {
        signInWithEmailAndPassword: (email, password) => {
            if (email && password) {
                return Promise.resolve({
                    user: { 
                        email: email, 
                        uid: 'test-user',
                        emailVerified: true
                    }
                });
            }
            return Promise.reject({ code: 'auth/invalid-credential' });
        },
        signOut: () => Promise.resolve(),
        onAuthStateChanged: (callback) => {
            // محاكاة عدم وجود مستخدم مسجل في البداية
            setTimeout(() => callback(null), 100);
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
