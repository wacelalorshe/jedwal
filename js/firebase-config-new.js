// firebase-config-new.js - إصدار مبسط وعملي
console.log("🚀 تحميل إعدادات Firebase الجديدة...");

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAMp0WIvwkNqJDj-5ZILYyOBlQ5rqswxQ8",
    authDomain: "wacel-live-pro.firebaseapp.com",
    databaseURL: "https://wacel-live-pro-default-rtdb.firebaseio.com",
    projectId: "wacel-live-pro",
    storageBucket: "wacel-live-pro.firebasestorage.app",
    messagingSenderId: "513770981112",
    appId: "1:513770981112:web:53df4c981965191c00dd0d"
};

// تهيئة Firebase
let app;
let db;

try {
    // استيراد مكتبة Firebase
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js')
        .then(({ initializeApp }) => {
            app = initializeApp(firebaseConfig, 'wacel-live-app');
            console.log("✅ Firebase App مهيئة بنجاح");
            
            // استيراد واستخدام Realtime Database
            return import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
        })
        .then(({ getDatabase }) => {
            db = getDatabase(app);
            console.log("✅ Realtime Database جاهزة للاستخدام");
            console.log("📊 قاعدة البيانات:", firebaseConfig.databaseURL);
            
            // جعلها متاحة عالمياً
            window.firebaseApp = app;
            window.firebaseDb = db;
            
            // إرسال حدث بأن Firebase جاهزة
            window.dispatchEvent(new Event('firebase-ready'));
        })
        .catch(error => {
            console.error("❌ خطأ في تحميل Firebase:", error);
        });
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
}

// تصدير متغيرات Firebase
export { app, db };

// دالة لاختبار الاتصال
export async function testConnection() {
    if (!db) {
        return { success: false, message: "قاعدة البيانات غير مهيئة" };
    }
    
    try {
        const { ref, set, remove } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
        
        // اختبار الكتابة
        const testRef = ref(db, 'test_connection');
        await set(testRef, {
            test: true,
            timestamp: new Date().toISOString(),
            message: 'اختبار اتصال Firebase'
        });
        
        // اختبار القراءة
        const { get } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
        const snapshot = await get(testRef);
        
        // تنظيف الاختبار
        await remove(testRef);
        
        return {
            success: true,
            message: "✅ اتصال Firebase ناجح",
            data: snapshot.val()
        };
    } catch (error) {
        return {
            success: false,
            message: `❌ خطأ في الاتصال: ${error.message}`,
            error: error
        };
    }
}

// دالة للحصول على المباريات
export async function getMatches() {
    if (!db) {
        console.error("❌ قاعدة البيانات غير مهيئة");
        return [];
    }
    
    try {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
        const matchesRef = ref(db, 'matches');
        const snapshot = await get(matchesRef);
        
        if (!snapshot.exists()) {
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
        
        console.log(`📊 تم تحميل ${matchesArray.length} مباراة`);
        return matchesArray;
    } catch (error) {
        console.error("❌ خطأ في جلب المباريات:", error);
        return [];
    }
}

// دالة لإضافة مباراة
export async function addMatch(matchData) {
    if (!db) {
        console.error("❌ قاعدة البيانات غير مهيئة");
        return null;
    }
    
    try {
        const { ref, push } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
        
        // إضافة بيانات إضافية
        const completeData = {
            ...matchData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            secure: true,
            addedBy: window.location.hostname
        };
        
        const matchesRef = ref(db, 'matches');
        const result = await push(matchesRef, completeData);
        
        console.log("✅ تم إضافة مباراة جديدة:", result.key);
        return result.key;
    } catch (error) {
        console.error("❌ خطأ في إضافة المباراة:", error);
        throw error;
    }
}

// دالة لحذف مباراة
export async function deleteMatch(matchId) {
    if (!db) {
        console.error("❌ قاعدة البيانات غير مهيئة");
        return false;
    }
    
    try {
        const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
        const matchRef = ref(db, 'matches/' + matchId);
        await remove(matchRef);
        
        console.log("✅ تم حذف المباراة:", matchId);
        return true;
    } catch (error) {
        console.error("❌ خطأ في حذف المباراة:", error);
        throw error;
    }
}

// دالة لمراقبة التحديثات
export function onMatchesUpdate(callback) {
    if (!db) {
        console.error("❌ قاعدة البيانات غير مهيئة");
        return () => {};
    }
    
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js')
        .then(({ ref, onValue }) => {
            const matchesRef = ref(db, 'matches');
            
            const unsubscribe = onValue(matchesRef, (snapshot) => {
                if (snapshot.exists()) {
                    const matches = snapshot.val();
                    const matchesArray = [];
                    
                    for (const key in matches) {
                        matchesArray.push({
                            id: key,
                            ...matches[key]
                        });
                    }
                    
                    callback(matchesArray);
                } else {
                    callback([]);
                }
            }, (error) => {
                console.error("❌ خطأ في مراقبة التحديثات:", error);
                callback([], error);
            });
            
            window.firebaseUnsubscribe = unsubscribe;
            return unsubscribe;
        });
}

console.log("✅ إعدادات Firebase الجديدة جاهزة");
