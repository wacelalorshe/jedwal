// simple-index.js - الصفحة الرئيسية المبسطة
console.log("🏠 تحميل الصفحة الرئيسية...");

document.addEventListener('DOMContentLoaded', async function() {
    console.log("📄 الصفحة الرئيسية جاهزة");
    
    // تحديث التاريخ
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = today.toLocaleDateString('ar-AR', options);
    }
    
    // استيراد Firebase
    await import('./firebase-config-new.js');
    
    // تحميل المباريات
    loadMatches();
    
    // تحديث حالة Firebase
    updateFirebaseStatus();
});

async function loadMatches() {
    console.log("📥 جاري تحميل المباريات للصفحة الرئيسية...");
    
    const matchesContainer = document.getElementById('matches-container');
    if (!matchesContainer) return;
    
    matchesContainer.innerHTML = '<div class="loading">جاري تحميل المباريات...</div>';
    
    try {
        // الانتظار حتى يصبح Firebase جاهزاً
        await new Promise(resolve => {
            if (window.firebaseDb) {
                resolve();
            } else {
                window.addEventListener('firebase-ready', resolve);
                setTimeout(resolve, 2000);
            }
        });
        
        // استخدام دالة getMatches إذا كانت موجودة
        let matches = [];
        if (window.getMatches) {
            matches = await window.getMatches();
        } else {
            // طريقة بديلة
            matches = await getMatchesDirectly();
        }
        
        displayMatchesInIndex(matches);
    } catch (error) {
        console.error("❌ خطأ في تحميل المباريات:", error);
        matchesContainer.innerHTML = `
            <div class="error" style="
                background: #f8d7da;
                color: #721c24;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px;
            ">
                <h3>❌ خطأ في تحميل المباريات</h3>
                <p>${error.message || 'يرجى التحقق من اتصال الإنترنت'}</p>
                <button onclick="loadMatches()" style="
                    margin-top: 10px;
                    padding: 10px 20px;
                    background: #434C75;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">
                    إعادة المحاولة
                </button>
            </div>
        `;
    }
}

async function getMatchesDirectly() {
    if (!window.firebaseDb) {
        throw new Error("Firebase غير متصل");
    }
    
    const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
    const matchesRef = ref(window.firebaseDb, 'matches');
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
    
    return matchesArray;
}

function displayMatchesInIndex(matches) {
    const matchesContainer = document.getElementById('matches-container');
    if (!matchesContainer) return;
    
    if (matches.length === 0) {
        matchesContainer.innerHTML = `
            <div class="loading" style="
                text-align: center;
                padding: 40px;
                color: #6c757d;
            ">
                <h3>📭 لا توجد مباريات اليوم</h3>
                <p style="margin-top: 10px;">يمكنك إضافة مباريات من لوحة التحكم</p>
                <a href="admin.html" style="
                    display: inline-block;
                    margin-top: 15px;
                    padding: 10px 20px;
                    background: #434C75;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">
                    🚀 الذهاب للوحة التحكم
                </a>
            </div>
        `;
        return;
    }
    
    matchesContainer.innerHTML = '';
    
    // ترتيب المباريات حسب الوقت
    matches.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
    });
    
    let currentLeague = '';
    
    matches.forEach(match => {
        // عرض قسم الدوري إذا تغير
        if (match.league !== currentLeague) {
            currentLeague = match.league;
            
            const leagueContainer = document.createElement('div');
            leagueContainer.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
                padding: 15px;
                margin: 20px 0 10px 0;
                border-radius: 10px;
                border-right: 5px solid #434C75;
            `;
            
            leagueContainer.innerHTML = `
                <div>
                    <h3 style="margin: 0; color: #434C75;">${match.league || 'دوري غير محدد'}</h3>
                    ${match.date ? `<p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">${match.date}</p>` : ''}
                </div>
                <div>
                    <img src="${match.leagueLogo || 'https://via.placeholder.com/80x45?text=LOGO'}" 
                         style="width: 80px; height: 45px; border-radius: 5px;" 
                         alt="${match.league}"
                         onerror="this.src='https://via.placeholder.com/80x45?text=LOGO'">
                </div>
            `;
            
            matchesContainer.appendChild(leagueContainer);
        }
        
        // إنشاء رابط المشاهدة
        let watchLink = "#";
        let linkType = 'default';
        
        if (match.linkType === 'xmtv' && match.xmtvLink) {
            watchLink = match.xmtvLink;
            linkType = 'xmtv';
        } else if (match.links && match.links.length > 0) {
            watchLink = match.links[0];
            linkType = 'regular';
        }
        
        // إنشاء عنصر المباراة
        const matchElement = document.createElement('a');
        matchElement.href = watchLink;
        matchElement.className = 'match-box';
        matchElement.target = "_blank";
        matchElement.style.cssText = `
            display: block;
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            text-decoration: none;
            color: inherit;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            border-left: 5px solid #434C75;
        `;
        matchElement.onmouseover = function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        };
        matchElement.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        };
        
        matchElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div style="
                    background: ${linkType === 'xmtv' ? '#28a745' : '#007bff'};
                    color: white;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                ">
                    ${linkType === 'xmtv' ? '🎬 رابط مباشر' : '🔗 رابط بث'}
                </div>
                <div style="
                    background: #ffc107;
                    color: #000;
                    padding: 5px 15px;
                    border-radius: 15px;
                    font-weight: bold;
                ">
                    ${match.time || '00:00'}
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-around; align-items: center; text-align: center;">
                <div style="flex: 1;">
                    <img src="${match.team1Logo || 'https://via.placeholder.com/60?text=T1'}" 
                         style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;"
                         onerror="this.src='https://via.placeholder.com/60?text=T1'">
                    <p style="margin: 0; font-weight: bold;">${match.team1 || 'فريق 1'}</p>
                </div>
                
                <div style="margin: 0 20px; font-size: 24px; font-weight: bold; color: #434C75;">VS</div>
                
                <div style="flex: 1;">
                    <img src="${match.team2Logo || 'https://via.placeholder.com/60?text=T2'}" 
                         style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;"
                         onerror="this.src='https://via.placeholder.com/60?text=T2'">
                    <p style="margin: 0; font-weight: bold;">${match.team2 || 'فريق 2'}</p>
                </div>
            </div>
            
            <div style="
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #6c757d;
            ">
                <div>📺 ${match.channel || 'قناة غير محددة'}</div>
                <div>🎤 ${match.commentator || 'معلق غير محدد'}</div>
            </div>
            
            ${match.links && match.links.length > 1 ? `
                <div style="
                    margin-top: 15px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 5px;
                    font-size: 12px;
                ">
                    <strong>🔗 روابط بديلة (${match.links.length - 1})</strong>
                </div>
            ` : ''}
        `;
        
        matchesContainer.appendChild(matchElement);
    });
    
    console.log(`✅ تم عرض ${matches.length} مباراة في الصفحة الرئيسية`);
}

function updateFirebaseStatus() {
    const firebaseStatus = document.getElementById('firebase-status');
    if (!firebaseStatus) return;
    
    // التحقق من اتصال Firebase
    const checkConnection = async () => {
        if (window.firebaseDb) {
            try {
                const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
                const testRef = ref(window.firebaseDb, 'test_connection');
                await get(testRef);
                
                firebaseStatus.innerHTML = '✅ متصل بـ Firebase';
                firebaseStatus.style.background = '#28a745';
            } catch (error) {
                firebaseStatus.innerHTML = '⚠️ اتصال محدود';
                firebaseStatus.style.background = '#ff9800';
            }
        } else {
            firebaseStatus.innerHTML = '❌ غير متصل';
            firebaseStatus.style.background = '#dc3545';
        }
    };
    
    checkConnection();
    setInterval(checkConnection, 30000); // تحديث كل 30 ثانية
}

// دوال مساعدة
window.refreshMatches = function() {
    const matchesContainer = document.getElementById('matches-container');
    if (matchesContainer) {
        matchesContainer.innerHTML = '<div class="loading">جاري تحديث المباريات...</div>';
    }
    setTimeout(loadMatches, 500);
};

window.debugFirebase = function() {
    console.log("🔍 تصحيح أخطاء Firebase:");
    console.log("Database:", window.firebaseDb);
    console.log("App:", window.firebaseApp);
    
    if (window.firebaseDb) {
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js')
            .then(({ ref, get }) => {
                const matchesRef = ref(window.firebaseDb, 'matches');
                return get(matchesRef);
            })
            .then(snapshot => {
                console.log("📊 بيانات matches:", snapshot.val());
                alert(`✅ Firebase يعمل\nعدد المباريات: ${snapshot.size || 0}`);
            })
            .catch(error => {
                console.error("❌ خطأ:", error);
                alert("❌ خطأ في Firebase: " + error.message);
            });
    } else {
        alert("❌ Firebase غير مهيء");
    }
};

console.log("✅ الصفحة الرئيسية جاهزة");
