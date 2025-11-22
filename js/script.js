// Clock functionality
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); 
    const minutes = now.getMinutes().toString().padStart(2, '0'); 
    const seconds = now.getSeconds().toString().padStart(2, '0'); 

    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Initialize clock
setInterval(updateClock, 1000);
updateClock();

// Utility function for time conversion
function convertToLocalTime(timeString) {
    const match = timeString.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
    if (!match) return timeString;

    let [, hours, minutes, period] = match;
    
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    const now = new Date();
    now.setHours(hours, minutes, 0, 0);

    const localTime = new Date(now.toLocaleString('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }));

    const localHours = localTime.getHours().toString().padStart(2, '0');
    const localMinutes = localTime.getMinutes().toString().padStart(2, '0');

    return `${localHours}:${localMinutes}`;
}
