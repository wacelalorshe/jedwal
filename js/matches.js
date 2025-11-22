// API configuration and match data handling
const API_CONFIG = {
    baseUrl: 'https://raw.githubusercontent.com/user/repo/main/data/',
    endpoints: {
        matches: 'matches-api.json',
        images: 'images/'
    }
};

// Main match fetching function
class MatchManager {
    constructor() {
        this.matches = [];
        this.container = document.getElementById('contents');
    }

    async fetchMatches() {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.matches}`);
            const data = await response.json();
            this.matches = data.matches || [];
            this.renderMatches();
        } catch (error) {
            console.error('Error fetching matches:', error);
            this.showError();
        }
    }

    renderMatches() {
        if (!this.matches || this.matches.length === 0) {
            this.showNoMatches();
            return;
        }

        this.container.innerHTML = this.matches.map(match => this.createMatchCard(match)).join('');
    }

    createMatchCard(match) {
        const localTime = convertToLocalTime(match.event_time);
        const status = this.getMatchStatus(match);
        
        return `
            <div class="mnajiri najiri${Math.floor(Math.random() * 3) + 1}">
                <a href="${this.getMatchLink(match)}" class="fullink" target="_blank"></a>
                <div class="mnajiriin">
                    <div class="mpart1">
                        <div class="left_match">
                            <img src="${API_CONFIG.baseUrl}${API_CONFIG.endpoints.images}${match.logo1}" 
                                 alt="${match.team1}" onerror="this.src='default-team.png'">
                            <span class="fname">${match.team1}</span>
                        </div>
                        <strong class="t_match">${localTime}</strong>
                        <div class="right_match">
                            <img src="${API_CONFIG.baseUrl}${API_CONFIG.endpoints.images}${match.logo2}" 
                                 alt="${match.team2}" onerror="this.src='default-team.png'">
                            <span class="fname">${match.team2}</span>
                        </div>
                    </div>
                    <div class="details_match">
                        <span class="first_match">${match.league}</span>
                        <span class="thany">${status}</span>
                        <span class="liga_mdw">${match.channel || 'مباشر'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getMatchStatus(match) {
        const now = new Date();
        const matchTime = new Date(match.event_time);
        
        if (now > matchTime) return 'انتهت';
        if (match.streamUrl) return 'مباشر';
        return 'لم تبدأ';
    }

    getMatchLink(match) {
        if (match.streamUrl) {
            return `intent:${match.streamUrl}#Intent;package=com.xpola.player;scheme=xmtv;end`;
        }
        return '#';
    }

    showNoMatches() {
        this.container.innerHTML = '<h1 id="no-match">لا يوجد أي مباريات لهذا اليوم</h1>';
    }

    showError() {
        this.container.innerHTML = '<h1 id="no-match">حدث خطأ أثناء جلب البيانات</h1>';
    }
}

// Initialize match manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const matchManager = new MatchManager();
    matchManager.fetchMatches();
});
