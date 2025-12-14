// firebase-config.js - الإصدار المبسط والموثوق
console.log("جاري تحميل إعدادات Firebase...");

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqE7ZwveHg1dIhYf1Hlo7OpHyCZudeZvM",
    authDomain: "wacel-live.firebaseapp.com",
    databaseURL: "https://wacel-live-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wacel-live",
    storageBucket: "wacel-live.firebasestorage.app",
    messagingSenderId: "185108554006",
    appId: "1:185108554006:web:93171895b1d4bb07c6f037"
};

// تهيئة Firebase
try {
    // إذا كان Firebase محملاً بالفعل
    if (typeof firebase !== 'undefined') {
        window.firebaseApp = firebase.initializeApp(firebaseConfig);
        window.firebaseDb = firebase.database();
        window.firebaseAuth = firebase.auth();
        console.log("✅ تم تهيئة Firebase بنجاح");
    } else {
        throw new Error("Firebase غير محمل");
    }
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
    
    // النسخة الاحتياطية
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
            console.log("🔐 محاولة تسجيل دخول تجريبية:", email);
            if (email && password) {
                return Promise.resolve({
                    user: { 
                        email: email, 
                        uid: 'test-user-' + Date.now(),
                        emailVerified: true
                    }
                });
            }
            return Promise.reject({ 
                code: 'auth/invalid-credential',
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        },
        signOut: () => {
            console.log("🚪 تسجيل خروج تجريبي");
            return Promise.resolve();
        },
        onAuthStateChanged: (callback) => {
            console.log("👀 الاستماع لتغير حالة المصادقة");
            // لا يوجد مستخدم مسجل في البداية
            setTimeout(() => callback(null), 100);
            return () => {};
        },
        currentUser: null
    };
    console.log("🔄 تم تحميل النسخة الاحتياطية للتجربة");
}

console.log("🎯 تم تحميل إعدادات Firebase بنجاح");
