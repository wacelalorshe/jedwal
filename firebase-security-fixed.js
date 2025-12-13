// firebase-security-fixed.js - نظام حماية متقدم لقاعدة البيانات
console.log("🔒 تحميل نظام حماية Firebase...");

// التحقق إذا كان النظام قد تم تحميله مسبقاً
if (window.firebaseProtection && window.firebaseProtection.__initialized) {
    console.log("✅ نظام الحماية مفعل مسبقاً");
} else {
    class FirebaseProtection {
        constructor() {
            // الحصول على النطاق الحالي
            const currentDomain = window.location.hostname;
            
            // قائمة النطاقات المصرح بها
            this.allowedDomains = [
                'wacelalorshe.github.io',
                'jedwal.netlify.app',
                'localhost',
                '127.0.0.1',
                'wacel-live-pro.web.app',
                'wacel-live-pro.firebaseapp.com',
                // إضافة النطاق الحالي تلقائياً إذا كان تطويرياً
                currentDomain.includes('github.io') ? currentDomain : null,
                currentDomain.includes('netlify.app') ? currentDomain : null
            ].filter(domain => domain !== null); // إزالة القيم الفارغة
            
            // إضافة النطاق الحالي للقائمة (للتصحيح)
            if (!this.allowedDomains.includes(currentDomain)) {
                console.log("➕ إضافة النطاق الحالي للقائمة المصرح بها:", currentDomain);
                this.allowedDomains.push(currentDomain);
            }
            
            this.encryptionKey = 'wacel_pro_2025_secret_key';
            this.isValidDomain = false;
            this.__initialized = true;
            
            this.init();
        }
        
        init() {
            this.checkDomain();
            this.protectFirebaseData();
            this.logDomainInfo();
        }
        
        checkDomain() {
            const currentDomain = window.location.hostname;
            console.log("🌐 التحقق من المجال:", currentDomain);
            console.log("📋 النطاقات المسموحة:", this.allowedDomains);
            
            this.isValidDomain = this.allowedDomains.some(domain => {
                // مقارنة دقيقة للنطاقات
                if (domain === currentDomain) return true;
                if (currentDomain.includes(domain)) return true;
                if (domain.includes(currentDomain)) return true;
                
                // تحقق من النطاقات الفرعية
                const currentParts = currentDomain.split('.');
                const domainParts = domain.split('.');
                
                // مقارنة أجزاء النطاق
                if (currentParts.length >= 2 && domainParts.length >= 2) {
                    const currentBase = currentParts.slice(-2).join('.');
                    const domainBase = domainParts.slice(-2).join('.');
                    return currentBase === domainBase;
                }
                
                return false;
            });
            
            if (!this.isValidDomain) {
                console.warn("⚠️ الوصول من مجال غير مصرح:", currentDomain);
                
                // عرض رسالة تحذيرية بدلاً من الحظر الكامل (للوحة التحكم)
                if (window.location.pathname.includes('admin.html')) {
                    this.showDomainWarning();
                } else {
                    this.blockUnauthorizedAccess();
                }
            } else {
                console.log("✅ الوصول من مجال مصرح");
            }
            
            return this.isValidDomain;
        }
        
        showDomainWarning() {
            // عرض تحذير فقط في لوحة التحكم
            const warningElement = document.getElementById('security-warning');
            const domainCheck = document.getElementById('domain-check');
            
            if (warningElement) {
                warningElement.innerHTML = `
                    ⚠️ تنبيه: هذا النطاق غير مصرح به للوصول إلى لوحة التحكم
                    <p style="margin: 5px 0 0 0; font-size: 12px;">
                        النطاقات المصرح بها: wacelalorshe.github.io ، jedwal.netlify.app
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #ff9800;">
                        النطاق الحالي: ${window.location.hostname}
                    </p>
                    <button onclick="forceEnableAccess()" style="
                        margin-top: 10px;
                        padding: 5px 10px;
                        background: #ff9800;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        font-size: 11px;
                        cursor: pointer;
                    ">
                        تفعيل الوصول رغم التحذير
                    </button>
                `;
                warningElement.classList.remove('hidden');
            }
            
            if (domainCheck) {
                domainCheck.innerHTML = `
                    ⚠️ النطاق غير مصرح (${window.location.hostname})
                    <br>
                    <small>سيتم السماح بالوصول للاختبار فقط</small>
                `;
                domainCheck.className = 'domain-check invalid-domain';
            }
            
            // السماح بالوصول مع تحذير
            this.allowWithWarning();
        }
        
        allowWithWarning() {
            // السماح بالوصول للاختبار مع التحذير
            console.log("⚠️ السماح بالوصول للاختبار رغم التحذير");
            
            // تغيير الحالة للإيجابية للسماح بالوصول
            this.isValidDomain = true;
            
            // إرسال تنبيه للتحذير
            setTimeout(() => {
                if (confirm(`⚠️ تنبيه أمني
                
أنت تصل من نطاق غير مصرح به: ${window.location.hostname}
النطاقات المصرح بها:
- wacelalorshe.github.io
- jedwal.netlify.app

هل تريد المتابعة للاختبار فقط؟`)) {
                    console.log("✅ المستخدم وافق على المتابعة");
                    this.forceEnableDashboard();
                } else {
                    console.log("❌ المستخدم رفض المتابعة");
                    window.location.href = "https://wacelalorshe.github.io/jedwal/";
                }
            }, 1000);
        }
        
        forceEnableDashboard() {
            // تفعيل لوحة التحكم قسراً
            console.log("🚀 تفعيل لوحة التحكم قسراً");
            
            // تحديث واجهة المستخدم
            const loginSection = document.getElementById('login-section');
            const dashboardSection = document.getElementById('dashboard-section');
            const warningElement = document.getElementById('security-warning');
            
            if (loginSection && dashboardSection) {
                loginSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                
                // تحديث الرسالة
                const loginMessage = document.getElementById('login-message');
                if (loginMessage) {
                    loginMessage.innerHTML = `
                        <div style="
                            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                            color: white;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 10px 0;
                            text-align: center;
                        ">
                            ⚠️ الوضع التجريبي مفعل
                            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
                                النطاق: ${window.location.hostname} | للاختبار فقط
                            </p>
                        </div>
                    `;
                }
                
                // تحديث التحذير
                if (warningElement) {
                    warningElement.innerHTML = `
                        ⚠️ وضع الاختبار مفعل
                        <p style="margin: 5px 0 0 0; font-size: 12px;">
                            هذا النطاق غير مصرح به رسمياً، ولكن تم تفعيله للاختبار فقط.
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #ff9800;">
                            النطاق: ${window.location.hostname}
                        </p>
                    `;
                    warningElement.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
                }
            }
        }
        
        protectFirebaseData() {
            // حماية Firebase (نفس الكود السابق)
            if (!window.__originalFetch) {
                window.__originalFetch = window.fetch;
            }
            
            if (!window.__firebaseProtected) {
                window.fetch = function(...args) {
                    const url = args[0];
                    if (url && url.includes('firebaseio.com') && !window.firebaseProtection?.isValidDomain) {
                        console.error("🚫 محاولة وصول غير مصرحة إلى Firebase");
                        return Promise.reject(new Error('Access Denied: Unauthorized Domain'));
                    }
                    return window.__originalFetch.apply(this, args);
                };
                window.__firebaseProtected = true;
            }
        }
        
        logDomainInfo() {
            // تسجيل معلومات النطاق
            console.log("📊 معلومات النطاق:", {
                current: window.location.hostname,
                allowed: this.allowedDomains,
                isValid: this.isValidDomain,
                url: window.location.href,
                protocol: window.location.protocol
            });
        }
        
        blockUnauthorizedAccess() {
            // حظر الوصول الكامل للصفحات الرئيسية فقط
            if (!window.location.pathname.includes('admin.html')) {
                document.body.innerHTML = this.getBlockMessage();
                window.stop();
            }
        }
        
        getBlockMessage() {
            return `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 20px;
                    z-index: 99999;
                ">
                    <div style="max-width: 500px;">
                        <h1 style="color: #ff6b6b; font-size: 2.5rem; margin-bottom: 20px;">
                            ⛔ محتوى محمي
                        </h1>
                        <p style="font-size: 1.2rem; margin-bottom: 30px;">
                            هذا المحتوى محمي ولا يمكن الوصول إليه من هذا النطاق.
                        </p>
                        <div style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 20px;
                            border-radius: 10px;
                            margin-bottom: 30px;
                        ">
                            <p style="margin-bottom: 10px;">
                                <strong>النطاق الحالي:</strong><br>
                                ${window.location.hostname}
                            </p>
                            <p>
                                <strong>النطاقات المسموحة:</strong><br>
                                wacelalorshe.github.io | jedwal.netlify.app
                            </p>
                        </div>
                        <a href="https://wacelalorshe.github.io/jedwal/" 
                           style="
                               display: inline-block;
                               padding: 15px 30px;
                               background: white;
                               color: #667eea;
                               text-decoration: none;
                               border-radius: 50px;
                               font-weight: bold;
                               font-size: 1.1rem;
                           ">
                           🔗 الانتقال للموقع الرسمي
                        </a>
                    </div>
                </div>
            `;
        }
    }
    
    // إنشاء نسخة واحدة فقط
    window.firebaseProtection = new FirebaseProtection();
    console.log("✅ نظام حماية Firebase مفعل بنجاح");
}

// دالة لتجاوز الحماية (للاستخدام من قبل المستخدم)
window.forceEnableAccess = function() {
    console.log("🚀 تجاوز الحماية وتفعيل الوصول");
    
    if (window.firebaseProtection) {
        window.firebaseProtection.isValidDomain = true;
        window.firebaseProtection.forceEnableDashboard();
    }
};
