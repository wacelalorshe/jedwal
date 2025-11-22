// بيانات المباريات (يمكن استبدالها ببيانات حقيقية من API)
const matchesData = [
    {
        team1: "النادي الأهلي",
        team2: "النادي الزمالك",
        league: "الدوري المصري",
        time: "20:00",
        status: "مباشر",
        logo1: "https://via.placeholder.com/50",
        logo2: "https://via.placeholder.com/50"
    },
    {
        team1: "برشلونة",
        team2: "ريال مدريد",
        league: "الدوري الإسباني",
        time: "22:00",
        status: "لم تبدأ",
        logo1: "https://via.placeholder.com/50",
        logo2: "https://via.placeholder.com/50"
    },
    {
        team1: "مانشستر يونايتد",
        team2: "ليفربول",
        league: "الدوري الإنجليزي",
        time: "19:30",
        status: "انتهت",
        logo1: "https://via.placeholder.com/50",
        logo2: "https://via.placeholder.com/50"
    }
];

// دالة لتحويل الوقت إلى التوقيت المحلي
function convertToLocalTime(timeStr) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
    if (!match) return timeStr;
    
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    const now = new Date();
    const matchTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
    const localTime = new Date(matchTime.toLocaleString("en-US", {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone}));
    
    const localHours = localTime.getHours().toString().padStart(2, '0');
    const localMinutes = localTime.getMinutes().toString().padStart(2, '0');
    
    return `${localHours}:${localMinutes}`;
}
