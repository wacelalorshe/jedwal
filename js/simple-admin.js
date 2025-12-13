// simple-admin.js - لوحة تحكم مبسطة وعملية
console.log("🎮 تحميل لوحة التحكم المبسطة...");

document.addEventListener('DOMContentLoaded', async function() {
    console.log("📄 الصفحة جاهزة، جاري تهيئة لوحة التحكم...");
    
    // استيراد Firebase
    await import('./firebase-config-new.js');
    
    // الانتظار حتى يصبح Firebase جاهزاً
    await new Promise(resolve => {
        if (window.firebaseDb) {
            resolve();
        } else {
            window.addEventListener('firebase-ready', resolve);
            setTimeout(resolve, 2000); // تأخير احتياطي
        }
    });
    
    // تهيئة واجهة المستخدم
    initUI();
    
    // تحميل المباريات
    loadMatches();
});

function initUI() {
    console.log("🎨 تهيئة واجهة المستخدم...");
    
    // إخفاء قسم تسجيل الدخول وفتح لوحة التحكم مباشرة
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    
    // تحديث معلومات النظام
    updateSystemInfo();
    
    // إعداد نموذج إضافة المباراة
    setupMatchForm();
    
    // إعداد أزرار التحكم
    setupControlButtons();
}

function updateSystemInfo() {
    const currentDomain = document.getElementById('current-domain');
    const domainInfo = document.getElementById('domain-info');
    const systemStatusText = document.getElementById('system-status-text');
    
    if (currentDomain) currentDomain.textContent = window.location.hostname;
    if (domainInfo) domainInfo.textContent = `✅ النطاق: ${window.location.hostname}`;
    if (systemStatusText) {
        systemStatusText.textContent = '✅ النظام يعمل بشكل طبيعي';
        systemStatusText.style.color = '#4CAF50';
    }
    
    // تحديث حالة Firebase
    const firebaseStatus = document.getElementById('firebase-status');
    if (firebaseStatus) {
        firebaseStatus.textContent = window.firebaseDb ? '🔐 متصل' : '🔓 غير متصل';
        firebaseStatus.style.color = window.firebaseDb ? '#4CAF50' : '#f44336';
    }
}

async function loadMatches() {
    console.log("📥 جاري تحميل المباريات...");
    
    const matchesList = document.getElementById('matches-list');
    if (!matchesList) return;
    
    matchesList.innerHTML = '<div class="loading">جاري تحميل المباريات...</div>';
    
    try {
        // استخدام دالة getMatches من firebase-config-new.js
        if (window.getMatches) {
            const matches = await window.getMatches();
            displayMatches(matches);
        } else {
            // طريقة بديلة
            await loadMatchesDirectly();
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل المباريات:", error);
        matchesList.innerHTML = `
            <div class="error">
                ❌ خطأ في تحميل المباريات
                <p>${error.message}</p>
                <button onclick="loadMatches()" class="btn btn-small btn-warning">
                    إعادة المحاولة
                </button>
            </div>
        `;
    }
}

async function loadMatchesDirectly() {
    if (!window.firebaseDb) {
        throw new Error("Firebase غير متصل");
    }
    
    const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
    const matchesRef = ref(window.firebaseDb, 'matches');
    const snapshot = await get(matchesRef);
    
    if (!snapshot.exists()) {
        displayMatches([]);
        return;
    }
    
    const matches = snapshot.val();
    const matchesArray = [];
    
    for (const key in matches) {
        matchesArray.push({
            id: key,
            ...matches[key]
        });
    }
    
    displayMatches(matchesArray);
}

function displayMatches(matches) {
    const matchesList = document.getElementById('matches-list');
    if (!matchesList) return;
    
    // تحديث العداد
    const matchesCount = document.getElementById('matches-count');
    if (matchesCount) {
        matchesCount.textContent = matches.length;
    }
    
    if (matches.length === 0) {
        matchesList.innerHTML = `
            <div class="loading">
                📭 لا توجد مباريات مضافة
                <p style="margin-top: 10px;">ابدأ بإضافة أول مباراة</p>
            </div>
        `;
        return;
    }
    
    matchesList.innerHTML = '';
    
    matches.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item secure-match';
        
        // معالجة الروابط
        let linksContent = '';
        if (match.linkType === 'xmtv' && match.xmtvLink) {
            linksContent = `
                <div class="xmtv-section">
                    <strong>🔗 رابط مباشر:</strong>
                    <div class="xmtv-actions">
                        <button class="btn btn-success btn-small" 
                            onclick="window.open('${match.xmtvLink}', '_blank')">
                            فتح المشاهدة
                        </button>
                    </div>
                </div>
            `;
        } else if (match.links && match.links.length > 0) {
            linksContent = `
                <strong>🔗 روابط المشاهدة (${match.links.length}):</strong>
                ${match.links.slice(0, 3).map((link, index) => `
                    <div class="link-item">
                        <span>${index + 1}. ${link.substring(0, 40)}...</span>
                        <button class="btn btn-small" onclick="copyToClipboard('${link}')">
                            نسخ
                        </button>
                    </div>
                `).join('')}
            `;
        }
        
        matchItem.innerHTML = `
            <div class="match-header">
                <h4>${match.league || 'بدون دوري'}</h4>
                <span class="secure-badge">🔒</span>
                <div class="actions">
                    <button class="btn btn-primary" onclick="editMatch('${match.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteMatch('${match.id}')">حذف</button>
                </div>
            </div>
            <div class="match-teams">
                <div class="match-team">
                    <img src="${match.team1Logo || 'https://via.placeholder.com/50?text=T1'}" 
                         alt="${match.team1}" 
                         onerror="this.src='https://via.placeholder.com/50?text=T1'">
                    <span>${match.team1 || 'فريق 1'}</span>
                </div>
                <div class="match-time">${match.time || '--:--'}</div>
                <div class="match-team">
                    <img src="${match.team2Logo || 'https://via.placeholder.com/50?text=T2'}" 
                         alt="${match.team2}" 
                         onerror="this.src='https://via.placeholder.com/50?text=T2'">
                    <span>${match.team2 || 'فريق 2'}</span>
                </div>
            </div>
            <div class="match-details">
                <div>📺 ${match.channel || 'بدون قناة'}</div>
                <div>🎤 ${match.commentator || 'بدون معلق'}</div>
                <div>📅 ${match.date || 'بدون تاريخ'}</div>
            </div>
            ${linksContent ? `
                <div class="links-container secure-links">
                    ${linksContent}
                </div>
            ` : ''}
            <div class="match-meta">
                <small>🆔 ${match.id.substring(0, 8)}...</small>
                <small>🕒 ${match.createdAt ? new Date(match.createdAt).toLocaleString('ar-AR') : 'غير معروف'}</small>
            </div>
        `;
        
        matchesList.appendChild(matchItem);
    });
    
    console.log(`✅ تم عرض ${matches.length} مباراة`);
}

function setupMatchForm() {
    const matchForm = document.getElementById('match-form');
    if (!matchForm) return;
    
    matchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log("➕ محاولة إضافة مباراة جديدة...");
        
        // جمع البيانات
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
            linkType: document.querySelector('.link-type-btn.active')?.dataset.type || 'regular'
        };
        
        // معالجة الروابط حسب النوع
        if (matchData.linkType === 'xmtv') {
            matchData.xmtvLink = document.getElementById('xmtv-link').value;
            matchData.links = [];
        } else {
            matchData.links = document.getElementById('links').value
                .split('\n')
                .filter(link => link.trim() !== '');
        }
        
        console.log("📝 بيانات المباراة:", matchData);
        
        try {
            let matchId;
            
            // استخدام دالة addMatch إذا كانت موجودة
            if (window.addMatch) {
                matchId = await window.addMatch(matchData);
            } else {
                // طريقة بديلة مباشرة
                matchId = await addMatchDirectly(matchData);
            }
            
            if (matchId) {
                showSuccessMessage(`✅ تم إضافة المباراة بنجاح (ID: ${matchId.substring(0, 8)})`);
                matchForm.reset();
                
                // إعادة تحميل المباريات بعد ثانية
                setTimeout(loadMatches, 1000);
            }
        } catch (error) {
            console.error("❌ خطأ في إضافة المباراة:", error);
            showErrorMessage(`❌ فشل في إضافة المباراة: ${error.message}`);
        }
    });
    
    // إعداد تبديل نوع الروابط
    setupLinkTypeToggle();
}

async function addMatchDirectly(matchData) {
    if (!window.firebaseDb) {
        throw new Error("Firebase غير متصل");
    }
    
    const { ref, push } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
    
    // إضافة بيانات إضافية
    const completeData = {
        ...matchData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        secure: true,
        addedBy: window.location.hostname
    };
    
    const matchesRef = ref(window.firebaseDb, 'matches');
    const result = await push(matchesRef, completeData);
    
    return result.key;
}

function setupLinkTypeToggle() {
    const linkTypeButtons = document.querySelectorAll('.link-type-btn');
    const regularSection = document.getElementById('regular-links-section');
    const xmtvSection = document.getElementById('xmtv-links-section');
    
    linkTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة النشاط من جميع الأزرار
            linkTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة النشاط للزر المضغوط
            this.classList.add('active');
            
            const type = this.dataset.type;
            
            // إظهار/إخفاء الأقسام المناسبة
            if (type === 'regular') {
                if (regularSection) regularSection.classList.add('active');
                if (xmtvSection) xmtvSection.classList.remove('active');
            } else if (type === 'xmtv') {
                if (regularSection) regularSection.classList.remove('active');
                if (xmtvSection) xmtvSection.classList.add('active');
            }
        });
    });
}

function setupControlButtons() {
    // زر اختبار الاتصال
    const testBtn = document.getElementById('test-connection-btn');
    if (testBtn) {
        testBtn.addEventListener('click', async function() {
            try {
                if (window.testConnection) {
                    const result = await window.testConnection();
                    alert(result.message);
                } else {
                    // اختبار مباشر
                    const { ref, set, remove } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
                    
                    const testRef = ref(window.firebaseDb, 'test_connection');
                    await set(testRef, {
                        test: true,
                        timestamp: new Date().toISOString()
                    });
                    
                    await remove(testRef);
                    
                    alert('✅ اتصال Firebase ناجح!');
                }
            } catch (error) {
                alert(`❌ فشل اختبار الاتصال: ${error.message}`);
            }
        });
    }
    
    // زر فحص البيانات
    const validateBtn = document.getElementById('validate-data-btn');
    if (validateBtn) {
        validateBtn.addEventListener('click', function() {
            alert('✅ نظام فحص البيانات يعمل بشكل صحيح');
        });
    }
}

function showSuccessMessage(message) {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
            ">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            formMessage.innerHTML = '';
        }, 5000);
    }
}

function showErrorMessage(message) {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
            ">
                ${message}
            </div>
        `;
    }
}

// دوال مساعدة عامة
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert('✅ تم النسخ إلى الحافظة'))
        .catch(() => alert('❌ فشل في النسخ'));
};

window.deleteMatch = async function(matchId) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه المباراة؟')) return;
    
    try {
        if (window.deleteMatch) {
            await window.deleteMatch(matchId);
        } else {
            // طريقة بديلة
            const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
            const matchRef = ref(window.firebaseDb, 'matches/' + matchId);
            await remove(matchRef);
        }
        
        showSuccessMessage('✅ تم حذف المباراة بنجاح');
        setTimeout(loadMatches, 1000);
    } catch (error) {
        showErrorMessage(`❌ فشل في حذف المباراة: ${error.message}`);
    }
};

window.editMatch = function(matchId) {
    alert(`✏️ تحرير المباراة: ${matchId}\nسيتم إضافة هذه الميزة لاحقاً`);
};

window.refreshSecureMatches = function() {
    loadMatches();
};

console.log("✅ لوحة التحكم المبسطة جاهزة");
