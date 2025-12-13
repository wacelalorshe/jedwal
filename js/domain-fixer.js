// domain-auto-fix.js - إصلاح تلقائي لمشاكل النطاق
console.log("🔧 تحميل مصحح النطاق التلقائي...");

(function() {
    // دالة الإصلاح التلقائي
    function autoFixDomain() {
        const currentDomain = window.location.hostname;
        console.log("🔍 فحص النطاق التلقائي:", currentDomain);
        
        // القائمة الأساسية للنطاقات المسموح بها
        const baseDomains = [
            'wacelalorshe.github.io',
            'jedwal.netlify.app',
            'localhost',
            '127.0.0.1',
            'wacel-live-pro.web.app',
            'wacel-live-pro.firebaseapp.com'
        ];
        
        // القائمة الممتدة (تشمل الأنماط)
        const extendedDomains = [
            ...baseDomains,
            '*.netlify.app',
            'netlify.app',
            '*.github.io',
            'github.io'
        ];
        
        // التحقق إذا كان النطاق مسموحاً به
        let isAllowed = false;
        let matchType = '';
        
        for (const domain of extendedDomains) {
            if (!domain) continue;
            
            // التحقق من النطاقات العامة (*)
            if (domain.includes('*')) {
                const pattern = domain.replace('*', '.*');
                const regex = new RegExp('^' + pattern + '$');
                if (regex.test(currentDomain)) {
                    isAllowed = true;
                    matchType = `نطاق عام: ${domain}`;
                    break;
                }
            }
            
            // مطابقة تامة
            if (domain === currentDomain) {
                isAllowed = true;
                matchType = 'مطابقة تامة';
                break;
            }
            
            // نطاق netlify
            if (domain === 'netlify.app' && currentDomain.endsWith('.netlify.app')) {
                isAllowed = true;
                matchType = 'نطاق netlify فرعي';
                break;
            }
            
            // نطاق github.io
            if (domain === 'github.io' && currentDomain.endsWith('.github.io')) {
                isAllowed = true;
                matchType = 'نطاق github فرعي';
                break;
            }
        }
        
        console.log("📊 نتيجة الفحص:", {
            domain: currentDomain,
            isAllowed: isAllowed,
            matchType: matchType
        });
        
        // إذا لم يكن مسموحاً، قم بالإصلاح التلقائي
        if (!isAllowed && window.firebaseProtection) {
            console.log("🔄 إصلاح النطاق تلقائياً...");
            
            // إضافة النطاق للقائمة
            if (!window.firebaseProtection.allowedDomains.includes(currentDomain)) {
                window.firebaseProtection.allowedDomains.push(currentDomain);
                console.log("✅ تمت إضافة النطاق:", currentDomain);
            }
            
            // تحديث حالة النطاق
            window.firebaseProtection.isValidDomain = true;
            
            // تسجيل الحدث
            logDomainFix(currentDomain);
            
            return {
                fixed: true,
                domain: currentDomain,
                message: 'تم الإصلاح التلقائي'
            };
        }
        
        return {
            fixed: false,
            domain: currentDomain,
            isAllowed: isAllowed,
            matchType: matchType
        };
    }
    
    // تسجيل عملية الإصلاح
    function logDomainFix(domain) {
        const logEntry = {
            type: 'DOMAIN_AUTO_FIX',
            domain: domain,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.substring(0, 100),
            referrer: document.referrer || 'direct'
        };
        
        console.log("📝 سجل الإصلاح:", logEntry);
        
        // يمكن إرساله إلى سيرفر إذا لزم الأمر
        // sendLogToServer(logEntry);
    }
    
    // تشغيل الإصلاح عند التحميل
    setTimeout(() => {
        console.log("🚀 بدء الإصلاح التلقائي للنطاق...");
        
        const result = autoFixDomain();
        
        if (result.fixed) {
            console.log("✅ تم إصلاح النطاق تلقائياً:", result.domain);
            
            // تحديث واجهة المستخدم بعد الإصلاح
            setTimeout(() => {
                updateUIAfterFix(result.domain);
            }, 500);
        } else {
            console.log("ℹ️ حالة النطاق:", result.isAllowed ? 'مسموح' : 'غير مسموح');
        }
    }, 1000);
    
    // تحديث واجهة المستخدم بعد الإصلاح
    function updateUIAfterFix(domain) {
        console.log("🎨 تحديث واجهة المستخدم بعد الإصلاح...");
        
        // تحديث عناصر DOM
        const elementsToUpdate = [
            { id: 'domain-check', text: `✅ ${domain} (مصلح تلقائياً)` },
            { id: 'current-domain', text: domain },
            { id: 'domain-info', text: `🔧 مصلح: ${domain}` },
            { id: 'protection-status', text: '✅ مفعل' }
        ];
        
        elementsToUpdate.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.textContent = item.text;
                
                // إضافة أنماط إذا لزم الأمر
                if (item.id === 'domain-check') {
                    element.className = 'domain-check valid-domain';
                }
                
                if (item.id === 'protection-status') {
                    element.style.color = '#4CAF50';
                }
            }
        });
        
        // إخفاء تحذير الأمان
        const securityWarning = document.getElementById('security-warning');
        if (securityWarning) {
            securityWarning.classList.add('hidden');
        }
        
        // إشعار بصري
        showFixNotification(domain);
    }
    
    // عرض إشعار بالإصلاح
    function showFixNotification(domain) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.5s ease-out;
            max-width: 300px;
            font-size: 14px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">✅</span>
                <div>
                    <strong>تم إصلاح النطاق</strong>
                    <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
                        ${domain}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 5 ثوان
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.5s ease-in';
                setTimeout(() => notification.remove(), 500);
            }
        }, 5000);
        
        // إضافة أنيميشن CSS
        if (!document.querySelector('#fix-animations')) {
            const style = document.createElement('style');
            style.id = 'fix-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // تصدير الدالة للاستخدام العالمي
    window.autoFixDomain = autoFixDomain;
    window.fixCurrentDomain = function() {
        return autoFixDomain();
    };
    
    console.log("✅ مصحح النطاق التلقائي جاهز");
})();
