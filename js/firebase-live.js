// firebase-live.js - اتصال مباشر مع Firebase يعمل 100%
console.log("🔥 تحميل Firebase Live...");

// إعدادات Firebase المباشرة
const firebaseConfig = {
    apiKey: "AIzaSyAMp0WIvwkNqJDj-5ZILYyOBlQ5rqswxQ8",
    authDomain: "wacel-live-pro.firebaseapp.com",
    databaseURL: "https://wacel-live-pro-default-rtdb.firebaseio.com",
    projectId: "wacel-live-pro",
    storageBucket: "wacel-live-pro.firebasestorage.app",
    messagingSenderId: "513770981112",
    appId: "1:513770981112:web:53df4c981965191c00dd0d"
};

// تهيئة Firebase مباشرة
let firebaseDb = null;

// دالة لتحميل Firebase ديناميكياً
function loadFirebase() {
    return new Promise((resolve, reject) => {
        // تحقق إذا كان Firebase محملاً مسبقاً
        if (typeof firebase !== 'undefined') {
            console.log("✅ Firebase محمّل مسبقاً");
            initFirebase();
            resolve();
            return;
        }

        console.log("📦 جاري تحميل Firebase...");
        
        // تحميل Firebase SDK
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
        script.onload = () => {
            console.log("✅ firebase-app.js محمل");
            
            // تحميل Realtime Database
            const dbScript = document.createElement('script');
            dbScript.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
            dbScript.onload = () => {
                console.log("✅ firebase-database.js محمل");
                initFirebase();
                resolve();
            };
            dbScript.onerror = reject;
            document.head.appendChild(dbScript);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// تهيئة Firebase
function initFirebase() {
    try {
        // تهيئة Firebase
        const app = firebase.initializeApp(firebaseConfig);
        firebaseDb = firebase.database(app);
        
        console.log("✅ Firebase مهيأ بنجاح");
        console.log("🔗 قاعدة البيانات:", firebaseConfig.databaseURL);
        
        // جعلها متاحة عالمياً
        window.firebaseApp = app;
        window.firebaseDb = firebaseDb;
        window.firebase = firebase;
        
        // إرسال حدث بأن Firebase جاهز
        const event = new Event('firebase-ready');
        window.dispatchEvent(event);
        
        return true;
    } catch (error) {
        console.error("❌ خطأ في تهيئة Firebase:", error);
        return false;
    }
}

// دالة لاختبار الاتصال
async function testFirebaseConnection() {
    if (!firebaseDb) {
        console.warn("⚠️ Firebase غير مهيء، جاري التحميل...");
        await loadFirebase();
    }
    
    try {
        console.log("🔗 اختبار اتصال Firebase...");
        
        // كتابة بيانات اختبارية
        const testRef = firebaseDb.ref('test_connection');
        await testRef.set({
            test: true,
            timestamp: new Date().toISOString(),
            message: 'اختبار اتصال Firebase Live',
            domain: window.location.hostname
        });
        
        // قراءة البيانات
        const snapshot = await testRef.once('value');
        const data = snapshot.val();
        
        console.log("✅ اتصال Firebase ناجح:", data);
        
        // تنظيف البيانات الاختبارية
        await testRef.remove();
        
        return {
            success: true,
            message: "✅ اتصال Firebase ناجح",
            data: data
        };
    } catch (error) {
        console.error("❌ خطأ في اتصال Firebase:", error);
        return {
            success: false,
            message: `❌ خطأ في الاتصال: ${error.message}`,
            error: error
        };
    }
}

// دالة للحصول على المباريات
async function getMatches() {
    if (!firebaseDb) {
        console.warn("⚠️ Firebase غير مهيء، جاري التحميل...");
        await loadFirebase();
    }
    
    try {
        console.log("📥 جاري جلب المباريات من Firebase...");
        const matchesRef = firebaseDb.ref('matches');
        const snapshot = await matchesRef.once('value');
        
        if (!snapshot.exists()) {
            console.log("📭 لا توجد مباريات في قاعدة البيانات");
            return [];
        }
        
        const matches = snapshot.val();
        const matchesArray = [];
        
        for (const key in matches) {
            matchesArray.push({
                id: key,
                ...matches[key]
            });
        }
        
        console.log(`✅ تم جلب ${matchesArray.length} مباراة`);
        return matchesArray;
    } catch (error) {
        console.error("❌ خطأ في جلب المباريات:", error);
        return [];
    }
}

// دالة لإضافة مباراة
async function addMatch(matchData) {
    if (!firebaseDb) {
        console.warn("⚠️ Firebase غير مهيء، جاري التحميل...");
        await loadFirebase();
    }
    
    try {
        console.log("➕ محاولة إضافة مباراة جديدة...");
        
        // إضافة بيانات إضافية
        const completeData = {
            ...matchData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            secure: true,
            addedBy: window.location.hostname,
            timestamp: Date.now()
        };
        
        const matchesRef = firebaseDb.ref('matches');
        const newMatchRef = matchesRef.push();
        
        await newMatchRef.set(completeData);
        
        console.log("✅ مباراة مضافة بنجاح، ID:", newMatchRef.key);
        
        return {
            success: true,
            id: newMatchRef.key,
            data: completeData
        };
    } catch (error) {
        console.error("❌ خطأ في إضافة المباراة:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// دالة لحذف مباراة
async function deleteMatch(matchId) {
    if (!firebaseDb) {
        console.warn("⚠️ Firebase غير مهيء، جاري التحميل...");
        await loadFirebase();
    }
    
    try {
        const matchRef = firebaseDb.ref('matches/' + matchId);
        await matchRef.remove();
        
        console.log("✅ مباراة محذوفة:", matchId);
        return true;
    } catch (error) {
        console.error("❌ خطأ في حذف المباراة:", error);
        return false;
    }
}

// دالة للاستماع للتحديثات في الوقت الحقيقي
function onMatchesUpdate(callback) {
    if (!firebaseDb) {
        loadFirebase().then(() => {
            listenForUpdates(callback);
        });
    } else {
        listenForUpdates(callback);
    }
    
    function listenForUpdates(callback) {
        const matchesRef = firebaseDb.ref('matches');
        
        matchesRef.on('value', (snapshot) => {
            if (!snapshot.exists()) {
                callback([]);
                return;
            }
            
            const matches = snapshot.val();
            const matchesArray = [];
            
            for (const key in matches) {
                matchesArray.push({
                    id: key,
                    ...matches[key]
                });
            }
            
            callback(matchesArray);
        }, (error) => {
            console.error("❌ خطأ في الاستماع للتحديثات:", error);
            callback([], error);
        });
    }
}

// تحميل Firebase تلقائياً عند تحميل الصفحة
window.addEventListener('load', async () => {
    console.log("🚀 بدء تحميل Firebase تلقائياً...");
    
    try {
        await loadFirebase();
        console.log("✅ Firebase محمل وجاهز للاستخدام");
        
        // اختبار الاتصال
        const testResult = await testFirebaseConnection();
        console.log("🎯 نتيجة اختبار الاتصال:", testResult.success ? "ناجح" : "فاشل");
        
    } catch (error) {
        console.error("❌ فشل في تحميل Firebase:", error);
    }
});

// تصدير الدوال للاستخدام العالمي
window.FirebaseLive = {
    loadFirebase,
    testConnection: testFirebaseConnection,
    getMatches,
    addMatch,
    deleteMatch,
    onMatchesUpdate,
    get db() { return firebaseDb; },
    get config() { return firebaseConfig; }
};

console.log("✅ Firebase Live جاهز");
