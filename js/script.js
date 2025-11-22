// دالة إخفاء الـ Lightbox
function hideLightbox() {
    const lightbox = document.getElementById('lightbox-alert');
    if (lightbox) {
        lightbox.style.display = 'none';
        localStorage.setItem('lightboxHidden', 'true');
    }
}

// التحقق مما إذا كان Lightbox مخفيًا مسبقًا
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('lightboxHidden') === 'true') {
        const lightbox = document.getElementById('lightbox-alert');
        if (lightbox) {
            lightbox.style.display = 'none';
        }
    }
    
    // عرض المباريات
    displayMatches();
});

// دالة عرض المباريات
function displayMatches() {
    const contents = document.getElementById('contents');
    
    if (!contents) return;
    
    if (!matchesData || matchesData.length === 0) {
        contents.innerHTML = '<h1 id="no-match">لا يوجد أي مباريات لهذا اليوم</h1>';
        return;
    }
    
    let matchesHTML = '';
    
    matchesData.forEach((match, index) => {
        const colorClass = `najiri${(index % 3) + 1}`;
        const localTime = convertToLocalTime(match.time);
        
        matchesHTML += `
            <div class="mnajiri ${colorClass}">
                <a class="fullink" href="#" onclick="openMatch('${match.team1}', '${match.team2}')"></a>
                <div class="mnajiriin">
                    <div class="mpart1">
                        <div class="left_match">
                            <span class="fname">${match.team1}</span>
                        </div>
                        <div class="right_match">
                            <span class="fname">${match.team2}</span>
                        </div>
                        <strong>${localTime}</strong>
                    </div>
                    <div class="details_match">
                        <span class="first_match">
                            <i class="fa fa-futbol-o"></i><b>${match.league}</b>
                        </span>
                        <span class="liga_mdw">
                            <i class="fa fa-clock-o"></i><b>${match.status}</b>
                        </span>
                        <span class="thany">
                            <i class="fa fa-desktop"></i><b>مباشر</b>
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    contents.innerHTML = matchesHTML;
}

// دالة فتح المباراة
function openMatch(team1, team2) {
    alert(`سيتم فتح بث مباراة ${team1} ضد ${team2}`);
    // هنا يمكن إضافة منطق فتح البث الفعلي
}
