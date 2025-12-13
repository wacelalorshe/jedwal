// fake-data.js - بيانات مزيفة للمواقع المسروقة
console.log("🎭 تحميل بيانات العرض المزيفة...");

const FAKE_MATCHES = {
    "blocked_001": {
        team1: "🚫 نطاق غير مصرح",
        team2: CURRENT_DOMAIN,
        team1Logo: "https://img.icons8.com/color/96/000000/cancel-2.png",
        team2Logo: "https://img.icons8.com/color/96/000000/domain.png",
        league: "الرجاء استخدام النطاقات الرسمية",
        leagueLogo: "https://img.icons8.com/color/96/000000/shield.png",
        time: "00:00",
        channel: "مصرح فقط لـ:",
        commentator: "wacelalorshe.github.io",
        links: [
            "https://wacelalorshe.github.io/jedwal/",
            "https://jedwal.netlify.app"
        ],
        warning: "هذه النسخة غير مصرحة",
        official: false
    },
    "blocked_002": {
        team1: "🔒 البيانات محمية",
        team2: "النطاق المسروق",
        team1Logo: "https://img.icons8.com/color/96/000000/lock.png",
        team2Logo: "https://img.icons8.com/color/96/000000/steal.png",
        league: "دوري النطاقات المصرحة",
        leagueLogo: "https://img.icons8.com/color/96/000000/firebase.png",
        time: "حالياً",
        channel: "jedwal.netlify.app",
        commentator: "الموقع الأصلي فقط",
        links: [],
        notice: "البيانات الحقيقية متاحة على النطاقات الرسمية",
        redirect: true
    }
};

// استبدال دالة عرض المباريات
if (!IS_OFFICIAL && typeof displayMatches === 'function') {
    const originalDisplayMatches = displayMatches;
    
    displayMatches = function(snapshot) {
        const container = document.getElementById('matches-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="match-box" style="border: 2px solid #ff4757;">
                <div class='match-info'>
                    <div>
                        <img src='https://img.icons8.com/color/96/000000/cancel-2.png' 
                             alt='ممنوع' style="width: 40px; height: 40px;">
                        <p style="color: #ff4757; font-weight: bold;">🚫 نطاق غير مصرح</p>
                    </div>
                    <div><span class='match-time'>${CURRENT_DOMAIN}</span></div>
                    <div>
                        <img src='https://img.icons8.com/color/96/000000/shield.png' 
                             alt='حماية' style="width: 40px; height: 40px;">
                        <p style="color: #3742fa; font-weight: bold;">النطاق الأصلي</p>
                    </div>
                </div>
                <div class='match-details'>
                    <div>البيانات متاحة فقط على:</div>
                    <div style="margin-top: 10px;">
                        <a href="https://wacelalorshe.github.io/jedwal/" 
                           style="color: #3742fa; text-decoration: none; margin: 0 10px;">
                           🌐 GitHub
                        </a>
                        <a href="https://jedwal.netlify.app" 
                           style="color: #00b894; text-decoration: none; margin: 0 10px;">
                           🚀 Netlify
                        </a>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h4 style="color: #2d3436;">⚠️ تحذير</h4>
                <p>هذا النطاق (<strong>${CURRENT_DOMAIN}</strong>) يستخدم بيانات مسروقة.</p>
                <p>للعرض الصحيح، يرجى زيارة الموقع الرسمي.</p>
            </div>
        `;
    };
}

console.log("✅ نظام البيانات المزيفة جاهز");
