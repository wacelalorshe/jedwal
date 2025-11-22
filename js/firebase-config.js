// firebase-config.js
console.log("جاري تحميل إعدادات Firebase...");

// إعدادات Firebase - استبدل هذه بالقيم الخاصة بمشروعك
const firebaseConfig = {
    apiKey: "AIzaSyC6h-oOG7xteSiJt2jDpSyGitiPp0aDimI",
    authDomain: "wacelmarkt.firebaseapp.com",
    databaseURL: "https://wacelmarkt-default-rtdb.firebaseio.com",
    projectId: "wacelmarkt",
    storageBucket: "wacelmarkt.firebasestorage.app",
    messagingSenderId: "662446208797",
    appId: "1:662446208797:web:a3cc83551d42761e4753f4"
};

// التحقق من تحميل Firebase SDK
if (typeof firebase === 'undefined') {
    console.error("Firebase SDK لم يتم تحميله بشكل صحيح");
    // تحميل Firebase SDK ديناميكياً إذا لم يكن محملاً
    loadFirebaseSDK();
} else {
    console.log("Firebase SDK محمل بنجاح");
    initializeFirebase();
}

function loadFirebaseSDK() {
    const scripts = [
        'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js',
        'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js'
    ];
    
    let loaded = 0;
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loaded++;
            if (loaded === scripts.length) {
                console.log("تم تحميل Firebase SDK بنجاح");
                initializeFirebase();
            }
        };
        document.head.appendChild(script);
    });
}

function initializeFirebase() {
    try {
        // تهيئة Firebase
        window.firebaseApp = firebase.initializeApp(firebaseConfig);
        window.firebaseDb = firebase.database();
        window.firebaseAuth = firebase.auth();
        console.log("تم تهيئة Firebase بنجاح");
    } catch (error) {
        console.error("خطأ في تهيئة Firebase:", error);
        // استخدام قيم افتراضية للاختبار
        window.firebaseApp = { name: "[DEFAULT]" };
        window.firebaseDb = {
            ref: (path) => ({
                on: (event, callback) => {
                    console.log(`الاستماع إلى ${path} - ${event}`);
                    // بيانات تجريبية للاختبار
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
                // في البيئة التجريبية، لا يوجد مستخدم مسجل
                callback(null);
                return () => {};
            }
        };
    }
}

console.log("تم تحميل إعدادات Firebase بنجاح");
