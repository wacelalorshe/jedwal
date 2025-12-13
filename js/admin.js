// admin.js - السكريبت الرئيسي للوحة التحكم
console.log("🚀 تحميل لوحة التحكم...");

// استيراد خدمات Firebase
import { db, auth } from "./firebase-config.js";
import { 
    ref, 
    onValue, 
    push, 
    update, 
    remove, 
    set,
    get 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// الانتظار حتى تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 تم تحميل الصفحة admin.html");
    
    // عناصر DOM
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginMessage = document.getElementById('login-message');
    
    const matchForm = document.getElementById('match-form');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const formMessage = document.getElementById('form-message');
    const matchesList = document.getElementById('matches-list');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    
    // عناصر اختيار نوع الروابط
    const linkTypeButtons = document.querySelectorAll('.link-type-btn');
    const regularLinksSection = document.getElementById('regular-links-section');
    const xmtvLinksSection = document.getElementById('xmtv-links-section');
    
    let currentEditId = null;
    
    // ========== بيانات الاختبار ==========
    window.testCredentials = {
        email: "www735981122@gmail.com",
        password: "Ww735981122",
        firebaseEmail: "wacel@gmail.com",
        firebasePassword: "Ww735981122"
    };
    
    // ========== أزرار إضافية ==========
    // زر تعبئة بيانات الاختبار
    const autoFillBtn = document.createElement('button');
    autoFillBtn.textContent = "تعبئة بيانات الاختبار";
    autoFillBtn.className = "btn btn-info";
    autoFillBtn.style.marginTop = "10px";
    autoFillBtn.style.marginRight = "10px";
    autoFillBtn.onclick = function() {
        document.getElementById('email').value = window.testCredentials.email;
        document.getElementById('password').value = window.testCredentials.password;
        showMessage(loginMessage, "🔧 تم تعبئة بيانات الاختبار تلقائياً", "info");
    };
    
    // زر تعبئة بيانات Firebase
    const autoFillFirebaseBtn = document.createElement('button');
    autoFillFirebaseBtn.textContent = "تعبئة بيانات Firebase";
    autoFillFirebaseBtn.className = "btn btn-warning";
    autoFillFirebaseBtn.style.marginTop = "10px";
    autoFillFirebaseBtn.onclick = function() {
        document.getElementById('email').value = window.testCredentials.firebaseEmail;
        document.getElementById('password').value = window.testCredentials.firebasePassword;
        showMessage(loginMessage, "🔧 تم تعبئة بيانات Firebase", "info");
    };
    
    // إضافة الأزرار إلى قسم تسجيل الدخول
    if (document.getElementById('login-form')) {
        const formRow = document.querySelector('#login-form .form-row');
        if (formRow) {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.marginTop = '10px';
            buttonContainer.appendChild(autoFillBtn);
            buttonContainer.appendChild(autoFillFirebaseBtn);
            formRow.appendChild(buttonContainer);
        }
    }
    // ========== نهاية الأزرار الإضافية ==========
    
    // تفعيل نظام التعبئة التلقائية
    setTimeout(setupAutoLogoFill, 500);
    
    // تفعيل نظام اختيار نوع الروابط
    linkTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // إزالة النشاط من جميع الأزرار
            linkTypeButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة النشاط للزر المحدد
            this.classList.add('active');
            
            // إخفاء جميع أقسام الروابط
            regularLinksSection.classList.remove('active');
            xmtvLinksSection.classList.remove('active');
            
            // إظهار القسم المحدد
            if (type === 'regular') {
                regularLinksSection.classList.add('active');
            } else if (type === 'xmtv') {
                xmtvLinksSection.classList.add('active');
            }
        });
    });
    
    // دالة لاختبار الاتصال
    window.testFirebaseConnection = function() {
        console.log("🔍 اختبار اتصال Firebase...");
        console.log("Firebase Database:", db);
        console.log("Firebase Auth:", auth);
        
        showMessage(formMessage, "🔍 جاري اختبار اتصال Firebase...", "info");
        
        if (!db) {
            showMessage(formMessage, "❌ قاعدة البيانات غير متاحة", "error");
            return;
        }
        
        // اختبار قراءة البيانات
        get(ref(db, 'matches')).then(snapshot => {
            console.log("✅ اختبار القراءة ناجح");
            console.log("📊 بيانات matches:", snapshot.val());
            console.log("🔢 عدد المباريات:", snapshot.size);
            showMessage(formMessage, "✅ اختبار الاتصال ناجح - قاعدة البيانات متاحة", "success");
        }).catch(error => {
            console.error("❌ اختبار القراءة فاشل:", error);
            showMessage(formMessage, "❌ اختبار الاتصال فاشل: " + error.message, "error");
        });
        
        // اختبار الكتابة
        const testRef = ref(db, 'test');
        set(testRef, {
            testTime: new Date().toISOString(),
            message: "اختبار اتصال Firebase"
        }).then(() => {
            console.log("✅ اختبار الكتابة ناجح");
            // مسح البيانات الاختبارية
            setTimeout(() => {
                remove(testRef);
                console.log("🗑️ تم مسح بيانات الاختبار");
            }, 3000);
        }).catch(error => {
            console.error("❌ اختبار الكتابة فاشل:", error);
        });
    };
    
    // ربط زر اختبار الاتصال
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', window.testFirebaseConnection);
    }
    
    // نظام التعبئة التلقائية لشعارات الفرق والدوريات
    function setupAutoLogoFill() {
        const team1Input = document.getElementById('team1');
        const team2Input = document.getElementById('team2');
        const team1LogoInput = document.getElementById('team1-logo');
        const team2LogoInput = document.getElementById('team2-logo');
        const leagueInput = document.getElementById('league');
        const leagueLogoInput = document.getElementById('league-logo');
        const team1Preview = document.getElementById('team1-preview');
        const team2Preview = document.getElementById('team2-preview');
        const leaguePreview = document.getElementById('league-preview');

        if (!team1Input || !team2Input || !team1LogoInput || !team2LogoInput || !leagueInput || !leagueLogoInput) {
            console.error("❌ لم يتم العثور على حقول الفرق والدوري");
            return;
        }

        // دالة لتحديث شعار الدوري
        function updateLeagueLogo() {
            const leagueName = leagueInput.value;
            const leagueLogo = window.teamsDatabase.getLeagueLogo(leagueName);
            
            if (leagueLogo) {
                leagueLogoInput.value = leagueLogo;
                leaguePreview.src = leagueLogo;
                console.log("✅ تم تحديث شعار الدوري:", leagueLogo);
            } else {
                leagueLogoInput.value = '';
                leaguePreview.src = 'https://via.placeholder.com/40?text=LOGO';
                console.log("⚠️ لم يتم العثور على شعار للدوري:", leagueName);
            }
        }

        // تحديث شعار الدوري عند تغيير الدوري
        leagueInput.addEventListener('change', function() {
            updateLeagueLogo();
        });

        // تحديث معاينات الشعارات
        function updateLogoPreviews() {
            if (team1LogoInput.value) {
                team1Preview.src = team1LogoInput.value;
            } else {
                team1Preview.src = 'https://via.placeholder.com/40?text=T1';
            }
            
            if (team2LogoInput.value) {
                team2Preview.src = team2LogoInput.value;
            } else {
                team2Preview.src = 'https://via.placeholder.com/40?text=T2';
            }
            
            if (leagueLogoInput.value) {
                leaguePreview.src = leagueLogoInput.value;
            } else {
                leaguePreview.src = 'https://via.placeholder.com/40?text=LOGO';
            }
        }

        // تحديث المعاينات عند تغيير الروابط
        team1LogoInput.addEventListener('input', updateLogoPreviews);
        team2LogoInput.addEventListener('input', updateLogoPreviews);
        leagueLogoInput.addEventListener('input', updateLogoPreviews);

        // دالة للبحث عن الشعار
        function findLogo(teamName, leagueName) {
            if (!teamName || teamName.length < 2) return null;
            
            // البحث أولاً في الدوري المحدد
            const leagueTeams = window.teamsDatabase.getTeamsByLeague(leagueName);
            if (leagueTeams) {
                for (const team in leagueTeams) {
                    if (team.toLowerCase().includes(teamName.toLowerCase()) || 
                        teamName.toLowerCase().includes(team.toLowerCase())) {
                        return leagueTeams[team];
                    }
                }
            }
            
            // البحث في جميع الدوريات
            return window.teamsDatabase.findTeamLogo(teamName);
        }

        // تعبئة الشعار تلقائياً عند الكتابة
        function setupAutoFillOnInput(inputElement, logoInputElement, previewElement) {
            let timeoutId;
            
            inputElement.addEventListener('input', function() {
                const teamName = this.value.trim();
                const leagueName = leagueInput.value.trim();
                
                // إلغاء المهلة السابقة
                clearTimeout(timeoutId);
                
                // إذا كان النص أقل من حرفين، امسح الشعار
                if (teamName.length < 2) {
                    logoInputElement.value = '';
                    previewElement.src = 'https://via.placeholder.com/40?text=T' + (inputElement.id === 'team1' ? '1' : '2');
                    return;
                }
                
                // تعيين مهلة للبحث بعد توقف المستخدم عن الكتابة
                timeoutId = setTimeout(() => {
                    const logoUrl = findLogo(teamName, leagueName);
                    if (logoUrl) {
                        logoInputElement.value = logoUrl;
                        previewElement.src = logoUrl;
                        console.log("✅ تم تعبئة شعار الفريق تلقائياً:", logoUrl);
                    } else {
                        logoInputElement.value = '';
                        previewElement.src = 'https://via.placeholder.com/40?text=T' + (inputElement.id === 'team1' ? '1' : '2');
                        console.log("⚠️ لم يتم العثور على شعار للفريق:", teamName);
                    }
                }, 500);
            });
        }

        // تفعيل التعبئة التلقائية للفريقين
        setupAutoFillOnInput(team1Input, team1LogoInput, team1Preview);
        setupAutoFillOnInput(team2Input, team2LogoInput, team2Preview);

        // اقتراحات الفرق عند الكتابة
        function setupTeamSuggestions(inputElement, logoInputElement, previewElement) {
            let suggestionBox = document.getElementById('suggestions-' + inputElement.id);
            if (!suggestionBox) {
                suggestionBox = document.createElement('div');
                suggestionBox.id = 'suggestions-' + inputElement.id;
                suggestionBox.className = 'suggestions-box hidden';
                inputElement.parentNode.appendChild(suggestionBox);
            }

            inputElement.addEventListener('input', function() {
                const query = this.value.trim();
                const leagueName = leagueInput.value.trim();
                
                if (query.length < 2) {
                    suggestionBox.classList.add('hidden');
                    return;
                }

                const suggestions = [];
                const leagueTeams = window.teamsDatabase.getTeamsByLeague(leagueName);
                
                if (leagueTeams) {
                    for (const team in leagueTeams) {
                        if (team.toLowerCase().includes(query.toLowerCase())) {
                            suggestions.push({
                                name: team,
                                logo: leagueTeams[team]
                            });
                        }
                    }
                }

                // إذا لم نجد اقتراحات في الدوري الحالي، ابحث في جميع الدوريات
                if (suggestions.length === 0) {
                    for (const league in window.teamsDatabase) {
                        if (league === 'findTeamLogo' || league === 'getTeamsByLeague' || league === 'leagues') continue;
                        
                        for (const team in window.teamsDatabase[league]) {
                            if (team.toLowerCase().includes(query.toLowerCase())) {
                                suggestions.push({
                                    name: team,
                                    logo: window.teamsDatabase[league][team]
                                });
                                if (suggestions.length >= 5) break;
                            }
                        }
                        if (suggestions.length >= 5) break;
                    }
                }

                if (suggestions.length > 0) {
                    suggestionBox.innerHTML = suggestions.map(team => 
                        `<div class="suggestion-item" data-logo="${team.logo}">
                            <img src="${team.logo}" width="20" height="20" onerror="this.src='https://via.placeholder.com/20?text=LOGO'">
                            ${team.name}
                        </div>`
                    ).join('');
                    suggestionBox.classList.remove('hidden');
                } else {
                    suggestionBox.classList.add('hidden');
                }
            });

            // اختيار اقتراح
            suggestionBox.addEventListener('click', function(e) {
                if (e.target.classList.contains('suggestion-item')) {
                    const teamName = e.target.textContent.trim();
                    const logoUrl = e.target.getAttribute('data-logo');
                    
                    inputElement.value = teamName;
                    logoInputElement.value = logoUrl;
                    previewElement.src = logoUrl;
                    suggestionBox.classList.add('hidden');
                    
                    console.log("✅ تم اختيار الفريق:", teamName, logoUrl);
                }
            });

            // إخفاء الاقتراحات عند فقدان التركيز
            inputElement.addEventListener('blur', function() {
                setTimeout(() => {
                    suggestionBox.classList.add('hidden');
                }, 200);
            });
        }

        // تفعيل نظام الاقتراحات
        setupTeamSuggestions(team1Input, team1LogoInput, team1Preview);
        setupTeamSuggestions(team2Input, team2LogoInput, team2Preview);

        // تحديث شعار الدوري عند التحميل الأولي
        updateLeagueLogo();

        console.log("✅ تم تفعيل نظام التعبئة التلقائية للشعارات");
    }
    
    // دالة لنسخ الروابط إلى الحافظة
    window.copyToClipboard = function(text) {
        if (!text) {
            alert("❌ لا يوجد نص للنسخ");
            return;
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert("✅ تم نسخ الرابط إلى الحافظة");
            }).catch(err => {
                console.error('❌ فشل في النسخ: ', err);
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    };

    // طريقة بديلة للنسخ
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert("✅ تم نسخ الرابط إلى الحافظة");
        } catch (err) {
            console.error('❌ فشل في النسخ: ', err);
            alert("❌ فشل في نسخ الرابط");
        }
        document.body.removeChild(textArea);
    }

    // دالة لفتح رابط XPola
    window.openXpolaApp = function(xmtvLink, googlePlayLink) {
        if (xmtvLink && xmtvLink.trim() !== '') {
            // محاولة فتح الرابط في تطبيق XPola
            window.location.href = xmtvLink;
            
            // إذا لم يفتح التطبيق، نعرض رسالة
            setTimeout(() => {
                if (confirm("⚠️ إذا لم يفتح التطبيق تلقائياً، قد تحتاج إلى تثبيت XPola Player أولاً. هل تريد الذهاب إلى متجر التطبيقات؟")) {
                    window.open(googlePlayLink || "https://play.google.com/store/apps/details?id=com.xpola.player", "_blank");
                }
            }, 2000);
        } else {
            alert("❌ لا توجد روابط XPola متاحة");
        }
    };
    
    // ========== التحقق من حالة المصادقة ==========
    console.log("🔍 التحقق من حالة المصادقة...");
    console.log("auth object:", auth);

    if (auth && auth.onAuthStateChanged) {
        const unsubscribe = onAuthStateChanged(auth, function(user) {
            console.log("👤 حالة المصادقة الجديدة:", user ? `مسجل دخول (${user.email})` : "غير مسجل");
            
            if (user) {
                console.log("🎯 تفاصيل المستخدم:", {
                    email: user.email,
                    uid: user.uid,
                    emailVerified: user.emailVerified
                });
                
                loginSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                showMessage(loginMessage, `✅ مرحباً ${user.email}!`, "success");
                loadMatches();
            } else {
                console.log("👤 لا يوجد مستخدم مسجل دخول");
                loginSection.classList.remove('hidden');
                dashboardSection.classList.add('hidden');
            }
        });
    } else {
        console.error("❌ خدمة المصادقة غير متاحة");
        showMessage(loginMessage, "⚠️ وضع الاختبار: يمكنك استخدام لوحة التحكم بدون تسجيل دخول", "warning");
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadMatches();
    }
    
    // ========== تسجيل الدخول الاحتياطي ==========
    window.enableTestMode = function() {
        console.log("🔧 تفعيل وضع الاختبار...");
        
        // إخفاء قسم تسجيل الدخول وإظهار لوحة التحكم
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        
        // إظهار رسالة
        showMessage(loginMessage, "🔧 وضع الاختبار مفعل - يمكنك إضافة وتعديل المباريات", "info");
        
        // تحميل المباريات
        loadMatches();
        
        // تغيير نص زر تسجيل الخروج
        if (logoutBtn) {
            logoutBtn.textContent = "الخروج من وضع الاختبار";
            logoutBtn.onclick = function() {
                location.reload(); // إعادة تحميل الصفحة
            };
        }
        
        // إضافة إشعار في لوحة التحكم
        const testNotice = document.createElement('div');
        testNotice.className = 'alert alert-warning';
        testNotice.style.margin = '10px';
        testNotice.style.padding = '10px';
        testNotice.style.borderRadius = '5px';
        testNotice.style.backgroundColor = '#fff3cd';
        testNotice.style.border = '1px solid #ffeaa7';
        testNotice.innerHTML = `
            <strong>⚠️ وضع الاختبار مفعل</strong>
            <p>أنت الآن في وضع الاختبار. يمكنك إضافة وتعديل وحذف المباريات، ولكن البيانات لن تحفظ في Firebase.</p>
            <p>للتسجيل الحقيقي، أعد تحميل الصفحة وحاول تسجيل الدخول مرة أخرى.</p>
        `;
        
        // إضافة الإشعار في بداية لوحة التحكم
        const dashboardContainer = document.querySelector('.container');
        if (dashboardContainer) {
            dashboardContainer.insertBefore(testNotice, dashboardContainer.firstChild);
        }
    };
    
    // زر للدخول إلى وضع الاختبار
    const testLoginBtn = document.createElement('button');
    testLoginBtn.textContent = "الدخول بوضع الاختبار";
    testLoginBtn.className = "btn btn-warning";
    testLoginBtn.style.marginTop = "10px";
    testLoginBtn.onclick = window.enableTestMode;
    
    // إضافة الزر إلى قسم تسجيل الدخول
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').appendChild(testLoginBtn);
    }
    
    // ========== تسجيل الدخول الرئيسي ==========
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("🔄 معالجة تسجيل الدخول...");
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = loginForm.querySelector('button[type="submit"]');
        
        // التحقق من البيانات المدخلة
        console.log("📧 البريد المدخل:", email);
        console.log("🔐 كلمة المرور مدخلة:", password ? "نعم" : "لا");
        
        // إذا كانت بيانات الاختبار، استخدم وضع الاختبار مباشرة
        if (email === "www735981122@gmail.com" && password === "Ww735981122") {
            console.log("🔧 استخدام بيانات الاختبار، جاري التبديل إلى وضع الاختبار...");
            showMessage(loginMessage, "🔧 استخدام بيانات الاختبار - جاري التحميل...", "info");
            setTimeout(() => {
                window.enableTestMode();
            }, 500);
            return;
        }
        
        loginBtn.disabled = true;
        loginBtn.textContent = "جاري تسجيل الدخول...";
        
        // اختبار اتصال Firebase أولاً
        console.log("🔍 اختبار اتصال Firebase...");
        console.log("auth object:", auth);
        console.log("signInWithEmailAndPassword موجود:", auth && typeof auth.signInWithEmailAndPassword);
        
        if (!auth || typeof auth.signInWithEmailAndPassword !== 'function') {
            console.error("❌ خدمة المصادقة غير متاحة أو غير مهيئة");
            showMessage(loginMessage, "❌ خدمة المصادقة غير متاحة. جاري التبديل إلى وضع الاختبار...", "error");
            setTimeout(() => {
                window.enableTestMode();
            }, 1000);
            loginBtn.disabled = false;
            loginBtn.textContent = "تسجيل الدخول";
            return;
        }
        
        console.log("📤 محاولة تسجيل الدخول مع:", email);
        
        // محاولة تسجيل الدخول
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("✅ تم تسجيل الدخول بنجاح!");
                console.log("👤 بيانات المستخدم:", {
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                    emailVerified: userCredential.user.emailVerified
                });
                
                // تحديث واجهة المستخدم
                showMessage(loginMessage, `✅ تم تسجيل الدخول بنجاح! مرحباً ${userCredential.user.email}`, "success");
                
                // إخفاء قسم التسجيل وإظهار لوحة التحكم
                loginSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                
                // تحميل المباريات
                loadMatches();
            })
            .catch((error) => {
                console.error("❌ خطأ في تسجيل الدخول:", error);
                console.error("كود الخطأ:", error.code);
                console.error("رسالة الخطأ:", error.message);
                
                let errorMessage = "❌ خطأ في تسجيل الدخول";
                let errorCode = error.code || '';
                
                // تحليل أخطاء Firebase الشائعة
                if (errorCode.includes('invalid-credential') || errorCode.includes('wrong-password')) {
                    errorMessage = "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة";
                } else if (errorCode.includes('user-not-found')) {
                    errorMessage = "❌ لم يتم العثور على مستخدم بهذا البريد الإلكتروني";
                } else if (errorCode.includes('invalid-email')) {
                    errorMessage = "❌ عنوان البريد الإلكتروني غير صالح";
                } else if (errorCode.includes('too-many-requests')) {
                    errorMessage = "❌ تم إجراء محاولات كثيرة. حاول مرة أخرى لاحقاً";
                } else if (errorCode.includes('network-request-failed')) {
                    errorMessage = "❌ خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت";
                } else if (errorCode.includes('auth/invalid-credential')) {
                    errorMessage = "❌ بيانات الاعتماد غير صالحة. تحقق من البريد وكلمة المرور";
                } else {
                    errorMessage = `❌ ${error.message || errorCode}`;
                }
                
                showMessage(loginMessage, errorMessage, "error");
                
                // إذا كانت المشكلة في بيانات wacel@gmail.com، عرض خيارات بديلة
                if (email === "wacel@gmail.com") {
                    setTimeout(() => {
                        const useTest = confirm("بيانات wacel@gmail.com لا تعمل. هل تريد استخدام بيانات الاختبار بدلاً من ذلك؟");
                        
                        if (useTest) {
                            // استخدام بيانات الاختبار
                            console.log("🔧 استخدام بيانات الاختبار...");
                            document.getElementById('email').value = window.testCredentials.email;
                            document.getElementById('password').value = window.testCredentials.password;
                            showMessage(loginMessage, "🔧 تم تعبئة بيانات الاختبار. انقر تسجيل الدخول مرة أخرى", "info");
                        } else {
                            // اختبار اتصال Firebase
                            window.testFirebaseConnection();
                        }
                    }, 1500);
                } else {
                    // اقتراح وضع الاختبار للمستخدمين الآخرين
                    setTimeout(() => {
                        const useTestMode = confirm("هل ترغب في استخدام وضع الاختبار للوصول إلى لوحة التحكم؟");
                        
                        if (useTestMode) {
                            window.enableTestMode();
                        }
                    }, 1500);
                }
            })
            .finally(() => {
                loginBtn.disabled = false;
                loginBtn.textContent = "تسجيل الدخول";
            });
    });
    
    // ========== تسجيل الخروج ==========
    logoutBtn.addEventListener('click', function() {
        if (auth && auth.signOut) {
            signOut(auth)
                .then(() => {
                    showMessage(loginMessage, "✅ تم تسجيل الخروج بنجاح", "success");
                    location.reload(); // إعادة تحميل الصفحة بعد تسجيل الخروج
                })
                .catch((error) => {
                    console.error('❌ خطأ في تسجيل الخروج:', error);
                    // إذا فشل تسجيل الخروج، أعد تحميل الصفحة
                    location.reload();
                });
        } else {
            // إذا لم تكن خدمة auth متاحة، أعد تحميل الصفحة
            location.reload();
        }
    });
    
    // ========== إرسال نموذج المباراة ==========
    matchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // التحقق من حالة المصادقة
        if (!auth || !auth.currentUser) {
            showMessage(formMessage, "⚠️ أنت في وضع الاختبار. البيانات ستخزن محلياً فقط", "warning");
        }
        
        if (!db) {
            showMessage(formMessage, "❌ قاعدة البيانات غير متاحة. البيانات ستخزن محلياً فقط", "error");
        }
        
        // تحديد نوع الروابط المستخدمة
        const activeLinkType = document.querySelector('.link-type-btn.active').getAttribute('data-type');
        let linksData = [];
        let xmtvLink = '';
        
        if (activeLinkType === 'regular') {
            const linksText = document.getElementById('links').value;
            linksData = linksText.split('\n')
                .map(link => link.trim())
                .filter(link => link !== '');
        } else if (activeLinkType === 'xmtv') {
            xmtvLink = document.getElementById('xmtv-link').value.trim();
        }
        
        // جمع البيانات من النموذج
        const matchData = {
            league: document.getElementById('league').value,
            leagueLogo: document.getElementById('league-logo').value,
            team1: document.getElementById('team1').value,
            team1Logo: document.getElementById('team1-logo').value,
            team2: document.getElementById('team2').value,
            team2Logo: document.getElementById('team2-logo').value,
            time: document.getElementById('match-time').value,
            channel: document.getElementById('channel').value,
            commentator: document.getElementById('commentator').value,
            date: document.getElementById('match-date').value,
            links: linksData,
            xmtvLink: xmtvLink,
            linkType: activeLinkType,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        console.log("💾 محاولة حفظ البيانات:", matchData);
        
        submitBtn.disabled = true;
        submitBtn.textContent = "جاري الحفظ...";
        
        if (currentEditId) {
            // تحديث مباراة موجودة
            console.log("✏️ تحديث مباراة موجودة:", currentEditId);
            
            if (db) {
                const matchRef = ref(db, 'matches/' + currentEditId);
                
                update(matchRef, matchData)
                    .then(() => {
                        console.log("✅ تم تحديث المباراة بنجاح في Firebase");
                        showMessage(formMessage, "✅ تم تحديث المباراة بنجاح!", "success");
                        resetForm();
                    })
                    .catch(error => {
                        console.error("❌ خطأ في تحديث المباراة:", error);
                        showMessage(formMessage, "❌ حدث خطأ أثناء تحديث المباراة: " + error.message, "error");
                        saveToLocalStorage(matchData, currentEditId, true);
                    })
                    .finally(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "تحديث المباراة";
                    });
            } else {
                // حفظ محلي إذا كان Firebase غير متاح
                saveToLocalStorage(matchData, currentEditId, true);
                submitBtn.disabled = false;
                submitBtn.textContent = "تحديث المباراة";
            }
        } else {
            // إضافة مباراة جديدة
            console.log("➕ إضافة مباراة جديدة");
            
            if (db) {
                const matchesRef = ref(db, 'matches');
                
                push(matchesRef, matchData)
                    .then((result) => {
                        console.log("✅ تم إضافة المباراة بنجاح في Firebase، المعرف:", result.key);
                        showMessage(formMessage, "✅ تم إضافة المباراة بنجاح!", "success");
                        resetForm();
                        
                        // التحقق من أن البيانات محفوظة
                        setTimeout(() => {
                            get(ref(db, 'matches/' + result.key)).then(snapshot => {
                                if (snapshot.exists()) {
                                    console.log("✅ تأكيد: البيانات محفوظة بشكل صحيح", snapshot.val());
                                }
                            });
                        }, 1000);
                    })
                    .catch(error => {
                        console.error("❌ خطأ في إضافة المباراة:", error);
                        console.error("تفاصيل الخطأ:", error.code, error.message);
                        showMessage(formMessage, "❌ حدث خطأ أثناء إضافة المباراة: " + error.message, "error");
                        saveToLocalStorage(matchData, null, false);
                    })
                    .finally(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "إضافة المباراة";
                    });
            } else {
                // حفظ محلي إذا كان Firebase غير متاح
                saveToLocalStorage(matchData, null, false);
                submitBtn.disabled = false;
                submitBtn.textContent = "إضافة المباراة";
            }
        }
    });
    
    // دالة للحفظ المحلي (Local Storage)
    function saveToLocalStorage(matchData, matchId, isUpdate) {
        try {
            let matches = JSON.parse(localStorage.getItem('localMatches')) || {};
            
            if (!matchId) {
                matchId = 'local_' + Date.now();
            }
            
            matches[matchId] = matchData;
            localStorage.setItem('localMatches', JSON.stringify(matches));
            
            console.log("💾 تم الحفظ محلياً:", matchId);
            showMessage(formMessage, "💾 تم الحفظ محلياً (لأن Firebase غير متاح)", "info");
            
            if (!isUpdate) {
                resetForm();
            }
            
            // تحديث القائمة
            loadMatches();
            
        } catch (error) {
            console.error("❌ خطأ في الحفظ المحلي:", error);
            showMessage(formMessage, "❌ فشل في الحفظ محلياً: " + error.message, "error");
        }
    }
    
    // دالة لتحميل المباريات المحلية
    function loadLocalMatches() {
        try {
            const localMatches = JSON.parse(localStorage.getItem('localMatches')) || {};
            console.log("📦 المباريات المحلية:", localMatches);
            
            if (Object.keys(localMatches).length > 0) {
                const localNotice = document.createElement('div');
                localNotice.className = 'alert alert-info';
                localNotice.style.margin = '10px';
                localNotice.style.padding = '10px';
                localNotice.innerHTML = `
                    <strong>📦 بيانات محلية</strong>
                    <p>يوجد ${Object.keys(localMatches).length} مباراة مخزنة محلياً لأن Firebase غير متاح</p>
                `;
                matchesList.appendChild(localNotice);
            }
            
            return localMatches;
        } catch (error) {
            console.error("❌ خطأ في تحميل المباريات المحلية:", error);
            return {};
        }
    }
    
    // إلغاء التعديل
    cancelBtn.addEventListener('click', resetForm);
    
    // تحميل المباريات للعرض في لوحة التحكم
    function loadMatches() {
        if (!db) {
            console.error("❌ قاعدة البيانات غير متاحة");
            showMessage(formMessage, "⚠️ Firebase غير متصل. جاري تحميل البيانات المحلية...", "warning");
            
            // تحميل المباريات المحلية
            const localMatches = loadLocalMatches();
            displayLocalMatches(localMatches);
            return;
        }
        
        console.log("📥 جاري تحميل المباريات من Firebase...");
        
        const matchesRef = ref(db, 'matches');
        
        onValue(matchesRef, 
            function(snapshot) {
                console.log("📊 تم استلام بيانات المباريات من Firebase");
                displayMatchesInAdmin(snapshot);
                
                // تحميل المباريات المحلية أيضاً
                loadLocalMatches();
            }, 
            function(error) {
                console.error("❌ خطأ في تحميل المباريات من Firebase:", error);
                showMessage(formMessage, "❌ خطأ في تحميل المباريات من Firebase", "error");
                
                // تحميل المباريات المحلية كبديل
                const localMatches = loadLocalMatches();
                displayLocalMatches(localMatches);
            }
        );
    }
    
    // عرض المباريات المحلية
    function displayLocalMatches(localMatches) {
        if (Object.keys(localMatches).length === 0) {
            matchesList.innerHTML = '<div class="loading">لا توجد مباريات مخزنة محلياً</div>';
            return;
        }
        
        console.log(`📦 عرض المباريات المحلية: ${Object.keys(localMatches).length} مباراة`);
        
        matchesList.innerHTML = '';
        
        Object.entries(localMatches).forEach(([matchId, match]) => {
            const googlePlayLink = "https://play.google.com/store/apps/details?id=com.xpola.player";
            
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            matchItem.style.border = '2px dashed #ffc107';
            
            let linksContent = '';
            
            if (match.linkType === 'regular' && match.links && match.links.length > 0) {
                linksContent = `
                    <strong>روابط المشاهدة (${match.links.length}):</strong>
                    ${match.links.map((link, index) => 
                        `<div class="link-item">
                            <span>${index + 1}. ${link}</span>
                            <button class="btn btn-small" onclick="copyToClipboard('${link.replace(/'/g, "\\'")}')">نسخ</button>
                        </div>`
                    ).join('')}
                `;
            } else if (match.linkType === 'xmtv' && match.xmtvLink) {
                linksContent = `
                    <div class="xmtv-section">
                        <strong>رابط XPola المباشر:</strong>
                        <div class="xmtv-link-preview">
                            ${match.xmtvLink.substring(0, 100)}...
                        </div>
                        <div class="xmtv-actions">
                            <a class="btn btn-success btn-small" onclick="openXpolaApp('${match.xmtvLink.replace(/'/g, "\\'")}', '${googlePlayLink}')">فتح في XPola</a>
                            <button class="btn btn-info btn-small" onclick="copyToClipboard('${match.xmtvLink.replace(/'/g, "\\'")}')">نسخ رابط xmtv</button>
                        </div>
                    </div>
                `;
            } else {
                linksContent = '<div class="link-item">لا توجد روابط متاحة</div>';
            }
            
            matchItem.innerHTML = `
                <div class="match-header">
                    <h4>${match.league} <span style="color: #ffc107; font-size: 12px;">(محلي)</span></h4>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="editMatch('${matchId}')">تعديل</button>
                        <button class="btn btn-danger" onclick="deleteLocalMatch('${matchId}')">حذف</button>
                    </div>
                </div>
                <div class="match-teams">
                    <div class="match-team">
                        <img src="${match.team1Logo || 'https://via.placeholder.com/50?text=T1'}" alt="${match.team1}" onerror="this.src='https://via.placeholder.com/50?text=T1'">
                        <span>${match.team1}</span>
                    </div>
                    <div class="match-time">${match.time}</div>
                    <div class="match-team">
                        <img src="${match.team2Logo || 'https://via.placeholder.com/50?text=T2'}" alt="${match.team2}" onerror="this.src='https://via.placeholder.com/50?text=T2'">
                        <span>${match.team2}</span>
                    </div>
                </div>
                <div class="match-details">
                    <div>${match.channel}</div>
                    <div>${match.commentator}</div>
                </div>
                <div class="links-container">
                    ${linksContent}
                    
                    <div class="xmtv-actions" style="margin-top: 15px;">
                        <button class="btn btn-warning btn-small" onclick="window.open('${googlePlayLink}', '_blank')">تحميل XPola Player</button>
                        <button class="btn btn-secondary btn-small" onclick="copyToClipboard('${googlePlayLink}')">نسخ رابط التحميل</button>
                    </div>
                </div>
            `;
            
            matchesList.appendChild(matchItem);
        });
    }
    
    // دالة لحذف المباريات المحلية
    window.deleteLocalMatch = function(matchId) {
        if (confirm('⚠️ هل أنت متأكد من حذف هذه المباراة المحلية؟')) {
            try {
                let matches = JSON.parse(localStorage.getItem('localMatches')) || {};
                delete matches[matchId];
                localStorage.setItem('localMatches', JSON.stringify(matches));
                console.log("🗑️ تم حذف المباراة المحلية:", matchId);
                showMessage(formMessage, "✅ تم حذف المباراة المحلية بنجاح!", "success");
                loadMatches();
            } catch (error) {
                console.error("❌ خطأ في حذف المباراة المحلية:", error);
                showMessage(formMessage, "❌ حدث خطأ أثناء حذف المباراة المحلية: " + error.message, "error");
            }
        }
    };
    
    function displayMatchesInAdmin(snapshot) {
        matchesList.innerHTML = '';
        
        if (!snapshot.exists()) {
            matchesList.innerHTML = '<div class="loading">لا توجد مباريات مضافة</div>';
            console.log("ℹ️ لا توجد مباريات في قاعدة البيانات");
            return;
        }
        
        const matches = snapshot.val();
        console.log(`🎯 عدد المباريات المعروضة: ${Object.keys(matches).length}`);
        
        snapshot.forEach(function(childSnapshot) {
            const matchId = childSnapshot.key;
            const match = childSnapshot.val();
            
            const googlePlayLink = "https://play.google.com/store/apps/details?id=com.xpola.player";
            
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            
            let linksContent = '';
            
            if (match.linkType === 'regular' && match.links && match.links.length > 0) {
                linksContent = `
                    <strong>روابط المشاهدة (${match.links.length}):</strong>
                    ${match.links.map((link, index) => 
                        `<div class="link-item">
                            <span>${index + 1}. ${link}</span>
                            <button class="btn btn-small" onclick="copyToClipboard('${link.replace(/'/g, "\\'")}')">نسخ</button>
                        </div>`
                    ).join('')}
                `;
            } else if (match.linkType === 'xmtv' && match.xmtvLink) {
                linksContent = `
                    <div class="xmtv-section">
                        <strong>رابط XPola المباشر:</strong>
                        <div class="xmtv-link-preview">
                            ${match.xmtvLink.substring(0, 100)}...
                        </div>
                        <div class="xmtv-actions">
                            <a class="btn btn-success btn-small" onclick="openXpolaApp('${match.xmtvLink.replace(/'/g, "\\'")}', '${googlePlayLink}')">فتح في XPola</a>
                            <button class="btn btn-info btn-small" onclick="copyToClipboard('${match.xmtvLink.replace(/'/g, "\\'")}')">نسخ رابط xmtv</button>
                        </div>
                    </div>
                `;
            } else {
                linksContent = '<div class="link-item">لا توجد روابط متاحة</div>';
            }
            
            matchItem.innerHTML = `
                <div class="match-header">
                    <h4>${match.league}</h4>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="editMatch('${matchId}')">تعديل</button>
                        <button class="btn btn-danger" onclick="deleteMatch('${matchId}')">حذف</button>
                    </div>
                </div>
                <div class="match-teams">
                    <div class="match-team">
                        <img src="${match.team1Logo || 'https://via.placeholder.com/50?text=T1'}" alt="${match.team1}" onerror="this.src='https://via.placeholder.com/50?text=T1'">
                        <span>${match.team1}</span>
                    </div>
                    <div class="match-time">${match.time}</div>
                    <div class="match-team">
                        <img src="${match.team2Logo || 'https://via.placeholder.com/50?text=T2'}" alt="${match.team2}" onerror="this.src='https://via.placeholder.com/50?text=T2'">
                        <span>${match.team2}</span>
                    </div>
                </div>
                <div class="match-details">
                    <div>${match.channel}</div>
                    <div>${match.commentator}</div>
                </div>
                <div class="links-container">
                    ${linksContent}
                    
                    <div class="xmtv-actions" style="margin-top: 15px;">
                        <button class="btn btn-warning btn-small" onclick="window.open('${googlePlayLink}', '_blank')">تحميل XPola Player</button>
                        <button class="btn btn-secondary btn-small" onclick="copyToClipboard('${googlePlayLink}')">نسخ رابط التحميل</button>
                    </div>
                </div>
            `;
            
            matchesList.appendChild(matchItem);
        });
    }
    
    // تعريف الدوال العالمية
    window.editMatch = function(matchId) {
        console.log("✏️ تحرير المباراة:", matchId);
        
        // تحقق إذا كانت مباراة محلية
        if (matchId.startsWith('local_')) {
            try {
                const matches = JSON.parse(localStorage.getItem('localMatches')) || {};
                const match = matches[matchId];
                
                if (!match) {
                    showMessage(formMessage, "❌ لم يتم العثور على المباراة المحلية", "error");
                    return;
                }
                
                console.log("📝 بيانات المباراة المحلية للتحرير:", match);
                fillFormWithMatchData(match, matchId);
                return;
            } catch (error) {
                console.error("❌ خطأ في تحميل بيانات المباراة المحلية:", error);
                showMessage(formMessage, "❌ حدث خطأ أثناء تحميل بيانات المباراة المحلية", "error");
                return;
            }
        }
        
        // إذا كانت مباراة من Firebase
        if (!db) {
            showMessage(formMessage, "❌ قاعدة البيانات غير متاحة", "error");
            return;
        }
        
        const matchRef = ref(db, 'matches/' + matchId);
        
        get(matchRef)
            .then(function(snapshot) {
                const match = snapshot.val();
                console.log("📝 بيانات المباراة للتحرير:", match);
                fillFormWithMatchData(match, matchId);
            })
            .catch(error => {
                console.error("❌ خطأ في تحميل بيانات المباراة:", error);
                showMessage(formMessage, "❌ حدث خطأ أثناء تحميل بيانات المباراة: " + error.message, "error");
            });
    };
    
    // دالة مساعدة لملء النموذج
    function fillFormWithMatchData(match, matchId) {
        document.getElementById('league').value = match.league || '';
        document.getElementById('league-logo').value = match.leagueLogo || '';
        document.getElementById('team1').value = match.team1 || '';
        document.getElementById('team1-logo').value = match.team1Logo || '';
        document.getElementById('team2').value = match.team2 || '';
        document.getElementById('team2-logo').value = match.team2Logo || '';
        document.getElementById('match-time').value = match.time || '';
        document.getElementById('channel').value = match.channel || '';
        document.getElementById('commentator').value = match.commentator || '';
        document.getElementById('match-date').value = match.date || '';
        
        // تعبئة نوع الروابط المناسب
        const linkType = match.linkType || 'regular';
        document.querySelectorAll('.link-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === linkType) {
                btn.classList.add('active');
            }
        });
        
        regularLinksSection.classList.remove('active');
        xmtvLinksSection.classList.remove('active');
        
        if (linkType === 'regular') {
            document.getElementById('links').value = match.links ? match.links.join('\n') : '';
            regularLinksSection.classList.add('active');
        } else if (linkType === 'xmtv') {
            document.getElementById('xmtv-link').value = match.xmtvLink || '';
            xmtvLinksSection.classList.add('active');
        }
        
        // تحديث معاينات الشعارات
        document.getElementById('team1-preview').src = match.team1Logo || 'https://via.placeholder.com/40?text=T1';
        document.getElementById('team2-preview').src = match.team2Logo || 'https://via.placeholder.com/40?text=T2';
        document.getElementById('league-preview').src = match.leagueLogo || 'https://via.placeholder.com/40?text=LOGO';
        
        formTitle.textContent = 'تعديل المباراة';
        submitBtn.textContent = 'تحديث المباراة';
        cancelBtn.classList.remove('hidden');
        currentEditId = matchId;
        
        matchForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    window.deleteMatch = function(matchId) {
        if (confirm('⚠️ هل أنت متأكد من حذف هذه المباراة؟')) {
            // تحقق إذا كانت مباراة محلية
            if (matchId.startsWith('local_')) {
                window.deleteLocalMatch(matchId);
                return;
            }
            
            if (!db) {
                showMessage(formMessage, "❌ قاعدة البيانات غير متاحة", "error");
                return;
            }
            
            console.log("🗑️ حذف المباراة:", matchId);
            
            const matchRef = ref(db, 'matches/' + matchId);
            
            remove(matchRef)
                .then(() => {
                    console.log("✅ تم حذف المباراة بنجاح");
                    showMessage(formMessage, "✅ تم حذف المباراة بنجاح!", "success");
                })
                .catch(error => {
                    console.error("❌ خطأ في حذف المباراة:", error);
                    showMessage(formMessage, "❌ حدث خطأ أثناء حذف المباراة: " + error.message, "error");
                });
        }
    };
    
    // إعادة تعيين النموذج
    function resetForm() {
        matchForm.reset();
        formTitle.textContent = 'إضافة مباراة جديدة';
        submitBtn.textContent = 'إضافة المباراة';
        cancelBtn.classList.add('hidden');
        currentEditId = null;
        formMessage.innerHTML = '';
        
        // إعادة تعيين القيم الافتراضية
        document.getElementById('league').value = 'الدوري الانجليزي الممتاز';
        document.getElementById('league-logo').value = 'https://resources.premierleague.com/premierleague/badges/50/t1.png';
        document.getElementById('team1').value = '';
        document.getElementById('team1-logo').value = '';
        document.getElementById('team2').value = '';
        document.getElementById('team2-logo').value = '';
        document.getElementById('match-time').value = '04:00م';
        document.getElementById('channel').value = 'bein sport 2';
        document.getElementById('commentator').value = 'أحمد البلوشي';
        document.getElementById('match-date').value = 'الأحد 23 نوفمبر 2025';
        document.getElementById('links').value = 'https://example.com/stream1\nhttps://example.com/stream2\nhttps://example.com/stream3';
        
        // إعادة تعيين نوع الروابط إلى الافتراضي
        document.querySelectorAll('.link-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === 'regular') {
                btn.classList.add('active');
            }
        });
        regularLinksSection.classList.add('active');
        xmtvLinksSection.classList.remove('active');
        
        // تحديث معاينات الشعارات
        document.getElementById('team1-preview').src = 'https://via.placeholder.com/40?text=T1';
        document.getElementById('team2-preview').src = 'https://via.placeholder.com/40?text=T2';
        document.getElementById('league-preview').src = 'https://resources.premierleague.com/premierleague/badges/50/t1.png';
    }
    
    // عرض الرسائل
    function showMessage(element, message, type) {
        element.innerHTML = `<div class="${type}">${message}</div>`;
        setTimeout(() => {
            element.innerHTML = '';
        }, 5000);
    }
    
    // اختبار الاتصال تلقائياً بعد تحميل الصفحة
    setTimeout(() => {
        console.log("🔧 اختبار اتصال تلقائي...");
        window.testFirebaseConnection();
    }, 2000);
});
