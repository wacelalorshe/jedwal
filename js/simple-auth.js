// simple-auth.js - حل بديل بسيط
console.log("🔧 تحميل الحل البديل للمصادقة...");

// دالة تسجيل الدخول البديلة
window.simpleAuth = {
    signIn: function(email, password) {
        console.log("🔐 محاولة تسجيل دخول:", email);
        
        // محاكاة تسجيل الدخول (للتجربة فقط)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    resolve({
                        user: {
                            email: email,
                            uid: 'simple-user-' + Date.now()
                        }
                    });
                    console.log("✅ تسجيل دخول تجريبي ناجح");
                } else {
                    reject({
                        code: 'auth/missing-credentials',
                        message: 'يجب إدخال البريد الإلكتروني وكلمة المرور'
                    });
                }
            }, 1000);
        });
    },
    
    onAuthStateChange: function(callback) {
        // لا يوجد مستخدم في البداية
        setTimeout(() => callback(null), 500);
        return () => {};
    }
};

// استبدال firebaseAuth إذا لم يكن متوفراً
if (!window.firebaseAuth) {
    console.log("🔄 استخدام المصادقة البديلة");
    window.firebaseAuth = window.simpleAuth;
}
