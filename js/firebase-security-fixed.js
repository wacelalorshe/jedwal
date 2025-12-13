// firebase-security-fixed.js - نظام حماية متقدم مع إصلاح النطاق
console.log("🛡️ تحميل نظام حماية Firebase المحسن...");

// التحقق إذا كان النظام قد تم تحميله مسبقاً
if (window.firebaseProtection && window.firebaseProtection.__initialized) {
    console.log("✅ نظام الحماية مفعل مسبقاً");
} else {
    class FirebaseProtection {
        constructor() {
            // الحصول على النطاق الحالي
            const currentDomain = window.location.hostname;
            console.log("🌐 النطاق الحالي المكتشف:", currentDomain);
            
            // قائمة النطاقات المصرح بها (محدثة)
            this.allowedDomains = [
                'wacelalorshe.github.io',
                'jedwal.netlify.app',
                'localhost',
                '127.0.0.1',
                'wacel-live-pro.web.app',
                'wacel-live-pro.firebaseapp.com',
                // === إضافة هذه النطاقات ===
                'jedwal-wacel-live-pro.netlify.app',  // النطاق الجديد
                '*.netlify.app',  // جميع نطاقات netlify
                'netlify.app',  // النطاق الرئيسي
                // === نهاية الإضافات ===
                currentDomain  // إضافة النطاق الحالي تلقائياً
            ];
            
            // تصفية القائمة من القيم المكررة
            this.allowedDomains = [...new Set(this.allowedDomains.filter(domain => domain))];
            
            this.encryptionKey = 'wacel_pro_2025_secret_key';
            this.isValidDomain = false;
            this.__initialized = true;
            
            console.log("📋 النطاقات المصرحة:", this.allowedDomains);
            
            this.init();
        }
        
        init() {
            this.checkDomain();
            this.setupDomainAutoFix();
            this.protectFirebaseData();
        }
        
        checkDomain() {
            const currentDomain = window.location.hostname;
            console.log("🔍 جاري فحص النطاق:", currentDomain);
            
            // تحسين خوارزمية التحقق
            this.isValidDomain = this.allowedDomains.some(allowedDomain => {
                if (!allowedDomain) return false;
                
                // إذا كان النطاق المسموح به يحتوي على * (نطاق عام)
                if (allowedDomain.includes('*')) {
                    const pattern = allowedDomain.replace('*', '.*');
                    const regex = new RegExp('^' + pattern + '$');
                    return regex.test(currentDomain);
                }
                
                // مطابقة تامة
                if (allowedDomain === currentDomain) {
                    console.log("✅ مطابقة تامة:", allowedDomain);
                    return true;
                }
                
                // إذا كان النطاق الحالي يحتوي على النطاق المسموح
                if (currentDomain.includes(allowedDomain)) {
                    console.log("✅ مطابقة جزئية (الحالي يحتوي المسموح):", allowedDomain);
                    return true;
                }
                
                // إذا كان النطاق المسموح يحتوي على النطاق الحالي
                if (allowedDomain.includes(currentDomain)) {
                    console.log("✅ مطابقة جزئية (المسموح يحتوي الحالي):", allowedDomain);
                    return true;
                }
                
                // تحقق من نطاقات netlify الفرعية
                if (allowedDomain === 'netlify.app' && currentDomain.endsWith('.netlify.app')) {
                    console.log("✅ نطاق netlify فرعي:", currentDomain);
                    return true;
                }
                
                return false;
            });
            
            console.log("🎯 نتيجة فحص النطاق:", this.isValidDomain ? "✅ مصرح" : "❌ غير مصرح");
            
            // عرض رسالة في لوحة التحكم
            this.updateDomainStatusUI();
            
            return this.isValidDomain;
        }
        
        setupDomainAutoFix() {
            // إصلاح تلقائي للنطاقات
            if (!this.isValidDomain) {
                console.log("🔧 محاولة إصلاح النطاق تلقائياً...");
                
                // إضافة النطاق الحالي إلى القائمة المسموح بها
                if (!this.allowedDomains.includes(currentDomain)) {
                    this.allowedDomains.push(currentDomain);
                    console.log("➕ تم إضافة النطاق إلى القائمة:", currentDomain);
                    
                    // إعادة التحقق
                    this.isValidDomain = true;
                }
            }
        }
        
        updateDomainStatusUI() {
            // تحديث واجهة المستخدم
            setTimeout(() => {
                const domainCheck = document.getElementById('domain-check');
                const securityWarning = document.getElementById('security-warning');
                const domainInfo = document.getElementById('domain-info');
                const currentDomainEl = document.getElementById('current-domain');
                const protectionStatus = document.getElementById('protection-status');
                
                if (domainCheck) {
                    if (this.isValidDomain) {
                        domainCheck.innerHTML = `
                            ✅ النطاق مصرح
                            <br>
                            <small>${window.location.hostname}</small>
                        `;
                        domainCheck.className = 'domain-check valid-domain';
                    } else {
                        domainCheck.innerHTML = `
                            ⚠️ النطاق غير مصرح
                            <br>
                            <small>${window.location.hostname}</small>
                            <button onclick="forceDomainFix()" style="
                                margin-top: 5px;
                                padding: 3px 8px;
                                background: #ff9800;
                                color: white;
                                border: none;
                                border-radius: 3px;
                                font-size: 10px;
                                cursor: pointer;
                            ">
                                إصلاح تلقائي
                            </button>
                        `;
                        domainCheck.className = 'domain-check invalid-domain';
                    }
                }
                
                if (securityWarning) {
                    if (!this.isValidDomain) {
                        securityWarning.innerHTML = `
                            ⚠️ تنبيه: هذا النطاق غير مصرح به رسمياً
                            <p style="margin: 5px 0 0 0; font-size: 12px;">
                                النطاق: ${window.location.hostname}
                            </p>
                            <p style="margin: 5px 0 0 0; font-size: 11px;">
                                تم السماح بالوصول للاختبار. يمكنك <a href="javascript:void(0)" onclick="forceDomainFix()" style="color: #ff9800; text-decoration: underline;">النقر هنا</a> لإصلاح المشكلة.
                            </p>
                        `;
                        securityWarning.classList.remove('hidden');
                    } else {
                        securityWarning.classList.add('hidden');
                    }
                }
                
                if (domainInfo) {
                    domainInfo.innerHTML = this.isValidDomain ? 
                        `🔒 النطاق مصرح: ${window.location.hostname}` :
                        `⚠️ النطاق غير مصرح: ${window.location.hostname}`;
                }
                
                if (currentDomainEl) {
                    currentDomainEl.textContent = window.location.hostname;
                }
                
                if (protectionStatus) {
                    protectionStatus.textContent = this.isValidDomain ? '✅ مفعل' : '❌ غير مفعل';
                    protectionStatus.style.color = this.isValidDomain ? '#4CAF50' : '#f44336';
                }
            }, 100);
        }
        
        protectFirebaseData() {
            // الحماية الأصلية (نفس الكود)
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
    }
    
    // إنشاء نسخة واحدة فقط
    window.firebaseProtection = new FirebaseProtection();
    console.log("✅ نظام حماية Firebase المحسن مفعل بنجاح");
    
    // دالة للإصلاح اليدوي
    window.forceDomainFix = function() {
        console.log("🔧 تفعيل الإصلاح اليدوي للنطاق");
        
        if (window.firebaseProtection) {
            const currentDomain = window.location.hostname;
            
            // إضافة النطاق للقائمة
            if (!window.firebaseProtection.allowedDomains.includes(currentDomain)) {
                window.firebaseProtection.allowedDomains.push(currentDomain);
                console.log("✅ تم إضافة النطاق:", currentDomain);
            }
            
            // تحديث الحالة
            window.firebaseProtection.isValidDomain = true;
            
            // تحديث واجهة المستخدم
            window.firebaseProtection.updateDomainStatusUI();
            
            // إشعار للمستخدم
            alert(`✅ تم إصلاح النطاق بنجاح\n\nالنطاق: ${currentDomain}\n\nيمكنك الآن استخدام لوحة التحكم.`);
            
            // إعادة تحميل المكونات إذا لزم الأمر
            if (typeof enableSecureDirectMode === 'function') {
                setTimeout(enableSecureDirectMode, 500);
            }
        }
    };
}
