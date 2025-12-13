// firebase-config.js - الإصدار النمطي المعدل
console.log("🎯 جاري تحميل إعدادات Firebase...");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// إعدادات Firebase المعدلة مع قاعدة بيانات
const firebaseConfig = {
  apiKey: "AIzaSyDHuT30xDYB7V-ApkniYh6s4FQ--GeGBkI",
  authDomain: "wacel-jedwal.firebaseapp.com",
  projectId: "wacel-jedwal",
  storageBucket: "wacel-jedwal.firebasestorage.app",
  messagingSenderId: "1076867495104",
  appId: "1:1076867495104:web:8bf6053e7de57d73856925",
  // إضافة رابط قاعدة البيانات الحية
  databaseURL: "https://wacel-jedwal-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// تهيئة التطبيق
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log("✅ تم تهيئة التطبيق بنجاح");
  
  // تهيئة قاعدة البيانات
  db = getDatabase(app);
  console.log("✅ تم تهيئة قاعدة البيانات");
  
  // تهيئة المصادقة
  auth = getAuth(app);
  console.log("✅ تم تهيئة المصادقة");
  
  // اختبار الاتصال
  console.log("📊 حالة المصادقة الحالية:", auth.currentUser);
} catch (error) {
  console.error("❌ خطأ في تهيئة Firebase:", error);
  // خلق نسخة وهمية للاختبار
  auth = {
    currentUser: null,
    signInWithEmailAndPassword: () => Promise.reject({ code: 'test-error' }),
    signOut: () => Promise.resolve(),
    onAuthStateChanged: (callback) => {
      console.log("🔧 استخدام auth تجريبي");
      callback(null);
      return () => {};
    }
  };
}

// تصدير الخدمات
export { app, db, auth };
