// API configuration - استبدل YOUR_API_KEY بمفتاحك الحقيقي
const API_CONFIG = {
    apiKey: 'YOUR_API_KEY', // احصل على المفتاح من api-football.com
    baseUrl: 'https://v3.football.api-sports.io',
    useRealData: true
};

class MatchManager {
    constructor() {
        this.matches = [];
        this.container = document.getElementById('contents');
        this.leagues = {
            // أهم الدوريات (يمكنك إضافة المزيد)
            39: 'الدوري الإنجليزي',
            140: 'الدوري الإسباني', 
            78: 'الدوري الألماني',
            135: 'الدوري الإيطالي',
            61: 'الدوري الفرنسي',
            307: 'الدوري السعودي',
            271: 'دوري أبطال أفريقيا'
        };
    }

    async fetchMatches() {
        try {
            if (!API_CONFIG.useRealData) {
                this.useSampleData();
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            
            const response = await fetch(`${API_CONFIG.baseUrl}/fixtures?date=${today}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': API_CONFIG.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response && data.response.length > 0) {
                this.processApiData(data.response);
            } else {
                this.useSampleData();
            }
            
        } catch (error) {
            console.error('Error fetching matches:', error);
            this.useSampleData();
        }
    }

    processApiData(fixtures) {
        this.matches = fixtures.map(fixture => {
            const match = fixture.fixture;
            const teams = fixture.teams;
            const league = fixture.league;
            
            return {
                team1: teams.home.name,
                team2: teams.away.name,
                logo1: teams.home.logo,
                logo2: teams.away.logo,
                event_time: this.formatTime(match.date),
                league: this.leagues[league.id] || league.name,
                status: this.getMatchStatus(match.status),
                fixture_id: fixture.fixture.id
            };
        });

        this.renderMatches();
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        
        return `${formattedHours}:${minutes} ${period}`;
    }

    getMatchStatus(status) {
        const statusMap = {
            'FT': 'انتهت',
            'HT': 'شوط أول',
            'PST': 'ملغاة',
            'CANC': 'ملغاة',
            'LIVE': 'مباشر',
            'NS': 'لم تبدأ',
            '1H': 'شوط أول',
            '2H': 'شوط ثاني'
        };
        
        return statusMap[status.short] || 'لم تبدأ';
    }

    useSampleData() {
        // بيانات احتياطية إذا فشل الاتصال بالAPI
        this.matches = [
            {
                team1: "النادي الأهلي",
                team2: "النادي الزمالك",
                logo1: "https://upload.wikimedia.org/wikipedia/ar/thumb/3/3c/Al_Ahly_SC_logo.svg/200px-Al_Ahly_SC_logo.svg.png",
                logo2: "https://upload.wikimedia.org/wikipedia/ar/thumb/7/7d/Zamalek_SC_logo.svg/200px-Zamalek_SC_logo.svg.png",
                event_time: "08:00 PM",
                league: "الدوري المصري",
                status: "مباشر"
            },
            {
                team1: "برشلونة",
                team2: "ريال مدريد",
                logo1: "https://upload.wikimedia.org/wikipedia/ar/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png",
                logo2: "https://upload.wikimedia.org/wikipedia/ar/thumb/3/3a/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png",
                event_time: "10:00 PM", 
                league: "الدوري الإسباني",
                status: "لم تبدأ"
            },
            {
                team1: "مانشستر يونايتد",
                team2: "ليفربول",
                logo1: "https://upload.wikimedia.org/wikipedia/ar/thumb/7/7a/Manchester_United_FC_crest.svg/200px-Manchester_United_FC_crest.svg.png",
                logo2: "https://upload.wikimedia.org/wikipedia/ar/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png",
                event_time: "06:30 PM",
                league: "الدوري الإنجليزي",
                status: "انتهت"
            }
        ];
        this.renderMatches();
    }

    renderMatches() {
        if (!this.container) {
            console.error('Container element not found');
            return;
        }

        if (!this.matches || this.matches.length === 0) {
            this.showNoMatches();
            return;
        }

        // ترتيب المباريات حسب الوقت
        this.matches.sort((a, b) => {
            return new Date('1970/01/01 ' + a.event_time) - new Date('1970/01/01 ' + b.event_time);
        });

        this.container.innerHTML = this.matches.map(match => this.createMatchCard(match)).join('');
    }

    createMatchCard(match) {
        const localTime = this.convertToLocalTime(match.event_time);
        const status = match.status;
        const cardColor = `najiri${Math.floor(Math.random() * 3) + 1}`;
        
        return `
            <div class="mnajiri ${cardColor}">
                <a href="${this.getMatchLink(match)}" class="fullink" target="_blank"></a>
                <div class="mnajiriin">
                    <div class="mpart1">
                        <div class="left_match">
                            <img src="${match.logo1}" 
                                 alt="${match.team1}" 
                                 onerror="this.src='https://via.placeholder.com/50/666666/FFFFFF?text=${match.team1.charAt(0)}'">
                            <span class="fname">${match.team1}</span>
                        </div>
                        <strong class="t_match">${localTime}</strong>
                        <div class="right_match">
                            <img src="${match.logo2}" 
                                 alt="${match.team2}" 
                                 onerror="this.src='https://via.placeholder.com/50/666666/FFFFFF?text=${match.team2.charAt(0)}'">
                            <span class="fname">${match.team2}</span>
                        </div>
                    </div>
                    <div class="details_match">
                        <span class="first_match">${match.league}</span>
                        <span class="thany">${status}</span>
                        <span class="liga_mdw">${this.getChannel(match.league)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    convertToLocalTime(timeString) {
        try {
            const match = timeString.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
            if (!match) return timeString;

            let [, hours, minutes, period] = match;
            hours = parseInt(hours, 10);
            
            if (period === 'PM' && hours < 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }
            
            // تحويل إلى التوقيت المحلي
            const now = new Date();
            const matchTime = new Date();
            matchTime.setHours(hours, minutes, 0, 0);
            
            // حساب الفرق مع التوقيت العالمي
            const timezoneOffset = now.getTimezoneOffset() / 60;
            matchTime.setHours(matchTime.getHours() - timezoneOffset);
            
            const localHours = matchTime.getHours();
            const localMinutes = matchTime.getMinutes().toString().padStart(2, '0');
            const localPeriod = localHours >= 12 ? 'PM' : 'AM';
            const formattedHours = localHours % 12 || 12;
            
            return `${formattedHours}:${localMinutes} ${localPeriod}`;
        } catch (error) {
            return timeString;
        }
    }

    getChannel(league) {
        const channelMap = {
            'الدوري الإنجليزي': 'بي إن سبورت',
            'الدوري الإسباني': 'بي إن سبورت', 
            'الدوري المصري': 'قناة الرياضية',
            'الدوري الألماني': 'أبو ظبي سبورت',
            'الدوري الإيطالي': 'بي إن سبورت',
            'الدوري الفرنسي': 'بي إن سبورت',
            'الدوري السعودي': 'قناة SSC'
        };
        
        return channelMap[league] || 'مباشر';
    }

    getMatchLink(match) {
        // رابط افتراضي - يمكنك إضافة روابط البث الحقيقية هنا
        if (match.status === 'مباشر' || match.status === 'شوط أول' || match.status === 'شوط ثاني') {
            return `intent:https://livestream.com/match${match.fixture_id}#Intent;package=com.xpola.player;scheme=xmtv;end`;
        }
        return '#';
    }

    showNoMatches() {
        if (this.container) {
            this.container.innerHTML = '<h1 id="no-match">لا يوجد أي مباريات لهذا اليوم</h1>';
        }
    }
}

// Initialize match manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const matchManager = new MatchManager();
    matchManager.fetchMatches();
    
    // تحديث البيانات كل 5 دقائق
    setInterval(() => {
        matchManager.fetchMatches();
    }, 5 * 60 * 1000);
});
