// domain-fixer.js - تصحيح تلقائي لمشاكل النطاق
console.log("🔧 تحميل مصحح النطاق...");

(function() {
    // دالة التصحيح التلقائي
    function autoFixDomainIssues() {
        const currentDomain = window.location.hostname;
        console.log("🔍 فحص النطاق الحالي:", currentDomain);
        
        // القائمة المصرح بها
        const allowedDomains = [
            'wacelalorshe.github.io',
            'jedwal.netlify.app',
            'localhost',
            '127.0.0.1',
            'wacel-live-pro.web.app',
            'wacel-live-pro.firebaseapp.com'
        ];
        
        // التحقق من النطاق
        let isAllowed = false;
        
        for (const domain of allowedDomains) {
            if (currentDomain === domain || 
                currentDomain.includes(domain) || 
                domain.includes(currentDomain)) {
                isAllowed = true;
                break;
            }
        }
        
        // إذا لم يكن مصرحاً، إضافته للقائمة
        if (!isAllowed && window.firebaseProtection) {
            console.log("➕ إضافة النطاق الحالي للقائمة المصرح بها:", currentDomain);
            
            if (!window.firebaseProtection.allowedDomains.includes(currentDomain)) {
                window.firebaseProtection.allowedDomains.push(currentDomain);
            }
            
            window.firebaseProtection.isValidDomain = true;
            
            // إشعار المستخدم
            if (window.location.pathname.includes('admin.html')) {
                setTimeout(() => {
                    alert(`✅ تم تصحيح إعدادات النطاق تلقائياً\n\nالنطاق: ${currentDomain}\n\nيمكنك الآن استخدام لوحة التحكم.`);
                }, 1000);
            }
            
            return true;
        }
        
        return isAllowed;
    }
    
    // تشغيل التصحيح عند التحميل
    setTimeout(() => {
        if (!window.firebaseProtection || !window.firebaseProtection.isValidDomain) {
            console.log("🔄 محاولة تصحيح مشاكل النطاق...");
            const fixed = autoFixDomainIssues();
            console.log(fixed ? "✅ تم تصحيح النطاق" : "✅ النطاق مصرح بالفعل");
        }
    }, 1500);
    
    // تصدير الدالة
    window.autoFixDomainIssues = autoFixDomainIssues;
})();
