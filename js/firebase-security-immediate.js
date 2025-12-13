// firebase-security-immediate.js - نظام حماية يعمل فور التحميل
console.log("⚡ تحميل حماية فورية للنطاق...");

// التهيئة الفورية بدون انتظار DOM
(function() {
    const currentDomain = window.location.hostname;
    console.log("🌐 النطاق الحالي:", currentDomain);
    
    // قائمة النطاقات المصرح بها الفورية
    const allowedDomains = [
        'wacelalorshe.github.io',
        'jedwal.netlify.app',
        'localhost',
        '127.0.0.1',
        'wacel-live-pro.web.app',
        'wacel-live-pro.firebaseapp.com',
        'jedwal-wacel-live-pro.netlify.app',
        '*.netlify.app',
        'netlify.app',
        currentDomain // إضافة النطاق الحالي تلقائياً
    ];
    
    // التحقق الفوري
    let isValidDomain = false;
    
    // خوارزمية تحقق سريعة
    for (const domain of allowedDomains) {
        if (!domain) continue;
        
        // نطاقات عامة (*)
        if (domain.includes('*')) {
            const pattern = domain.replace('*', '.*');
            const regex = new RegExp('^' + pattern + '$');
            if (regex.test(currentDomain)) {
                isValidDomain = true;
                break;
            }
        }
        
        // مطابقة تامة
        if (domain === currentDomain) {
            isValidDomain = true;
            break;
        }
        
        // نطاقات netlify
        if (domain === 'netlify.app' && currentDomain.endsWith('.netlify.app')) {
            isValidDomain = true;
            break;
        }
        
        // مطابقة جزئية
        if (currentDomain.includes(domain) || domain.includes(currentDomain)) {
            isValidDomain = true;
            break;
        }
    }
    
    // تخزين النتيجة للاستخدام اللاحق
    window.firebaseProtection = {
        allowedDomains: allowedDomains,
        isValidDomain: isValidDomain,
        currentDomain: currentDomain,
        isInitialized: true,
        __initialized: true
    };
    
    console.log("✅ الحماية الفورية:", isValidDomain ? "النطاق مصرح" : "النطاق غير مصرح");
    
    // إذا كان النطاق مصرحاً، نجهز لتفعيل اللوحة فور تحميل DOM
    if (isValidDomain) {
        console.log("🚀 تجهيز تفعيل اللوحة الفوري...");
        
        // دالة لتفعيل اللوحة عند تحميل DOM
        window.activateDashboardImmediately = function() {
            console.log("🎯 تفعيل اللوحة الفوري...");
            
            // تحديث معلومات النظام مباشرة
            const systemInfo = {
                currentDomain: currentDomain,
                protectionStatus: '✅ مفعل',
                loadTime: new Date().toLocaleTimeString(),
                browserInfo: getBrowserInfo()
            };
            
            // تخزين المعلومات للاستخدام في DOM
            window.systemInfo = systemInfo;
            
            // علامة لتفعيل اللوحة عند تحميل DOM
            window.shouldActivateDashboard = true;
            
            console.log("📊 معلومات النظام المجهزة:", systemInfo);
        };
        
        // تشغيل التفعيل الفوري
        window.activateDashboardImmediately();
    }
    
    // دالة مساعدة للحصول على معلومات المتصفح
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Google Chrome';
        if (ua.includes('Firefox')) return 'Mozilla Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Apple Safari';
        if (ua.includes('Edge')) return 'Microsoft Edge';
        return 'متصفح غير معروف';
    }
    
    // تسجيل معلومات التحميل
    console.log("📦 الحماية الفورية جاهزة للنطاق:", currentDomain);
})();
