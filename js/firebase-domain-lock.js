// firebase-domain-lock.js
console.log("🔐 تحميل قفل النطاق لـ Firebase...");

// قائمة النطاقات المسموحة فقط
const ALLOWED_DOMAINS = {
    'wacelalorshe.github.io': true,
    'jedwal.netlify.app': true,
    'localhost': true,
    '127.0.0.1': true
};

// تحقق من النطاق الحالي
const CURRENT_DOMAIN = window.location.hostname;
const IS_ALLOWED_DOMAIN = ALLOWED_DOMAINS[CURRENT_DOMAIN] || 
                         CURRENT_DOMAIN.includes('localhost') || 
                         CURRENT_DOMAIN.includes('127.0.0.1');

class FirebaseDomainLock {
    constructor() {
        if (!IS_ALLOWED_DOMAIN) {
            this.blockUnauthorizedDomain();
            return;
        }
        
        this.setupDomainProtection();
        this.monitorFirebaseAccess();
    }
    
    blockUnauthorizedDomain() {
        console.error('🚫 نطاق غير مصرح:', CURRENT_DOMAIN);
        
        // إظهار رسالة للمستخدم
        const blockHTML = `
            <div id="domain-block-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #0c2461 0%, #1e3799 100%);
                color: white;
                font-family: 'Segoe UI', Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 20px;
                z-index: 99999;
            ">
                <div style="max-width: 600px; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 15px; backdrop-filter: blur(10px);">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
                    <h1 style="color: #ff6b6b; margin-bottom: 20px; font-size: 2rem;">
                        نطاق غير مصرح للوصول
                    </h1>
                    <p style="font-size: 1.2rem; margin-bottom: 25px; line-height: 1.6;">
                        النطاق <strong style="color: #ffdd59;">${CURRENT_DOMAIN}</strong><br>
                        غير مصرح له بالوصول إلى قاعدة البيانات.
                    </p>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 25px 0;">
                        <p style="margin-bottom: 15px; color: #74b9ff;">النطاقات الرسمية المصرحة:</p>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <a href="https://wacelalorshe.github.io/jedwal/" 
                               style="background: #3742fa; color: white; padding: 15px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: 0.3s;"
                               onmouseover="this.style.background='#5352ed'; this.style.transform='scale(1.02)'"
                               onmouseout="this.style.background='#3742fa'; this.style.transform='scale(1)'">
                               🌐 الموقع الرسمي على GitHub
                            </a>
                            <a href="https://jedwal.netlify.app" 
                               style="background: #00b894; color: white; padding: 15px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: 0.3s;"
                               onmouseover="this.style.background='#00cec9'; this.style.transform='scale(1.02)'"
                               onmouseout="this.style.background='#00b894'; this.style.transform='scale(1)'">
                               🚀 الموقع الرسمي على Netlify
                            </a>
                        </div>
                    </div>
                    
                    <p style="color: #a4b0be; font-size: 0.9rem; margin-top: 25px;">
                        ⚠️ إذا كنت ترى هذه الرسالة على نطاق مسروق، فإن البيانات المعروضة مزيفة
                    </p>
                </div>
            </div>
        `;
        
        document.body.innerHTML = blockHTML;
        
        // منع أي اتصالات Firebase
        this.disableFirebase();
        
        // إرسال تقرير عن النطاق غير مصرح
        this.reportUnauthorizedAccess();
    }
    
    disableFirebase() {
        // تعطيل Firebase للمواقع غير المصرحة
        if (window.firebase) {
            window.firebase = {
                initializeApp: () => {
                    console.warn('⛔ Firebase معطل للنطاق غير مصرح');
                    return {
                        name: '[BLOCKED]',
                        options: {}
                    };
                },
                database: () => ({
                    ref: () => ({
                        on: () => () => {},
                        once: () => Promise.resolve({ val: () => null }),
                        set: () => Promise.reject(new Error('النطاق غير مصرح')),
                        update: () => Promise.reject(new Error('النطاق غير مصرح')),
                        remove: () => Promise.reject(new Error('النطاق غير مصرح'))
                    })
                }),
                auth: () => ({
                    signInWithEmailAndPassword: () => Promise.reject(new Error('النطاق غير مصرح')),
                    signOut: () => Promise.resolve(),
                    onAuthStateChanged: (callback) => {
                        callback(null);
                        return () => {};
                    },
                    currentUser: null
                })
            };
        }
        
        // إذا كان Firebase محملاً بالفعل، أغلقه
        if (window.firebaseDb) {
            try {
                window.firebaseDb.goOffline();
            } catch (e) {}
        }
    }
    
    setupDomainProtection() {
        // إضافة بصمة النطاق لجميع عمليات Firebase
        this.injectDomainSignature();
        
        // تشفير البيانات قبل إرسالها
        this.setupDataEncryption();
    }
    
    injectDomainSignature() {
        // تعديل جميع عمليات الكتابة لإضافة توقيع النطاق
        const originalSet = Object.getPrototypeOf(window.firebaseDb.ref()).set;
        const originalUpdate = Object.getPrototypeOf(window.firebaseDb.ref()).update;
        const originalPush = Object.getPrototypeOf(window.firebaseDb.ref()).push;
        
        if (originalSet) {
            Object.getPrototypeOf(window.firebaseDb.ref()).set = function(data) {
                if (data && typeof data === 'object') {
                    // إضافة توقيع النطاق
                    data._domain = CURRENT_DOMAIN;
                    data._timestamp = Date.now();
                    data._signature = this.generateDomainSignature();
                }
                return originalSet.call(this, data);
            }.bind(this);
        }
        
        console.log('✅ تم تفعيل توقيع النطاق');
    }
    
    generateDomainSignature() {
        // إنشاء توقيع فريد للنطاق
        const secret = 'jedwal-protection-2025';
        const str = CURRENT_DOMAIN + secret + Date.now();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    setupDataEncryption() {
        // تشفير أسماء الفرق والبيانات الحساسة
        window.encryptTeamData = function(data) {
            if (!data || !IS_ALLOWED_DOMAIN) return data;
            
            if (data.team1 && data.team2) {
                // إضافة علامة للنطاقات المصرحة فقط
                data._verified = true;
                data._official = true;
            }
            
            return data;
        };
        
        // فك التشفير عند القراءة
        window.decryptTeamData = function(data) {
            if (!data) return data;
            
            // إذا كانت البيانات من نطاق غير مصرح، عدلها
            if (data._domain && !ALLOWED_DOMAINS[data._domain]) {
                console.warn('⚠️ بيانات من نطاق غير مصرح:', data._domain);
                
                // إرجاع بيانات مزيفة
                return {
                    team1: "🚫 بيانات محمية",
                    team2: "استخدم النطاق الرسمي",
                    league: "jedwal.netlify.app",
                    time: "00:00",
                    channel: "النطاقات المصرحة فقط",
                    warning: "هذه النسخة غير مصرحة",
                    officialLink: "https://wacelalorshe.github.io/jedwal/"
                };
            }
            
            return data;
        };
    }
    
    monitorFirebaseAccess() {
        // مراقبة طلبات Firebase
        setInterval(() => {
            if (!IS_ALLOWED_DOMAIN && window.firebaseDb) {
                try {
                    window.firebaseDb.goOffline();
                } catch (e) {}
            }
        }, 10000);
        
        // تسجيل محاولات الوصول
        window.addEventListener('error', (e) => {
            if (e.message.includes('firebase') || e.message.includes('Firebase')) {
                console.log('📝 سجل محاولة وصول Firebase:', e.message);
            }
        });
    }
    
    reportUnauthorizedAccess() {
        // يمكن إرسال تقرير إلى خادمك
        try {
            const report = {
                domain: CURRENT_DOMAIN,
                url: window.location.href,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                referrer: document.referrer
            };
            
            console.log('📊 تقرير نطاق غير مصرح:', report);
            
            // محاولة إرسال التقرير إلى Firebase (إذا كان مسموحاً)
            if (IS_ALLOWED_DOMAIN && window.firebaseDb) {
                window.firebaseDb.ref('security/unauthorized_access').push(report);
            }
        } catch (e) {
            console.error('❌ خطأ في إرسال التقرير:', e);
        }
    }
}

// تهيئة النظام عند تحميل الصفحة
if (typeof firebase !== 'undefined') {
    // الانتظار حتى يتم تحميل Firebase
    setTimeout(() => {
        window.domainLock = new FirebaseDomainLock();
    }, 1000);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.domainLock = new FirebaseDomainLock();
    });
}

console.log("✅ نظام قفل النطاق جاهز");
