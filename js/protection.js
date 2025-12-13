// protection.js - نظام حماية البيانات من السرقة
console.log("🔒 تحميل نظام الحماية...");

class DataProtector {
    constructor() {
        this.secretKey = this.generateSecretKey();
        this.allowedOrigins = [
            'wacelalorshe.github.io',
            'jedwal.netlify.app',
            'localhost',
            '127.0.0.1'
        ];
        this.checkOrigin();
        console.log("✅ نظام الحماية جاهز للموقع:", window.location.hostname);
    }

    generateSecretKey() {
        // مفتاح فريد لكل موقع
        const siteKey = window.location.hostname.replace(/[^a-z0-9]/gi, '');
        const dateKey = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
        const domainHash = btoa(siteKey + dateKey + "JEDWAL_PROTECTION_2024");
        return domainHash.substring(0, 32);
    }

    checkOrigin() {
        const currentHost = window.location.hostname;
        const isAllowed = this.allowedOrigins.some(origin => 
            currentHost.includes(origin) || origin.includes(currentHost)
        );
        
        if (!isAllowed) {
            console.error('🚫 نطاق غير مصرح:', currentHost);
            this.blockAccess();
            return false;
        }
        
        console.log('✅ النطاق مصرح:', currentHost);
        return true;
    }
    
    blockAccess() {
        // إعادة توجيه للموقع الرسمي
        setTimeout(() => {
            window.location.href = 'https://wacelalorshe.github.io/jedwal/';
        }, 3000);
        
        // عرض رسالة
        document.body.innerHTML = `
            <div style="padding: 50px; text-align: center; font-family: Arial;">
                <h1 style="color: red;">🚫 موقع غير مصرح</h1>
                <p>سيتم توجيهك إلى الموقع الرسمي...</p>
            </div>
        `;
    }

    encryptData(text) {
        try {
            if (!text) return '';
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
                result += String.fromCharCode(charCode);
            }
            return btoa(result);
        } catch (error) {
            console.error('❌ خطأ في التشفير:', error);
            return text;
        }
    }

    decryptData(encryptedText) {
        try {
            if (!encryptedText) return '';
            const decoded = atob(encryptedText);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch (error) {
            console.error('❌ خطأ في فك التشفير:', error);
            return encryptedText;
        }
    }

    encryptMatch(matchData) {
        try {
            const encryptedMatch = {
                encrypted: true,
                domain: window.location.hostname,
                timestamp: Date.now()
            };

            // تشفير الحقول الرئيسية
            const fieldsToEncrypt = ['league', 'team1', 'team2', 'channel', 'commentator', 'date'];
            fieldsToEncrypt.forEach(field => {
                if (matchData[field]) {
                    encryptedMatch[field] = this.encryptData(matchData[field]);
                }
            });

            // تشفير الروابط
            if (matchData.linkType === 'regular' && matchData.links) {
                encryptedMatch.links = matchData.links.map(link => this.encryptData(link));
            } else if (matchData.linkType === 'xmtv' && matchData.xmtvLink) {
                encryptedMatch.xmtvLink = this.encryptData(matchData.xmtvLink);
            }

            // الحقول غير المشفرة
            encryptedMatch.linkType = matchData.linkType;
            encryptedMatch.time = matchData.time;
            encryptedMatch.leagueLogo = matchData.leagueLogo;
            encryptedMatch.team1Logo = matchData.team1Logo;
            encryptedMatch.team2Logo = matchData.team2Logo;
            encryptedMatch.createdAt = matchData.createdAt;

            return encryptedMatch;
        } catch (error) {
            console.error('❌ خطأ في تشفير المباراة:', error);
            return matchData;
        }
    }

    decryptMatch(encryptedMatch) {
        try {
            if (!encryptedMatch || !encryptedMatch.encrypted) {
                return encryptedMatch;
            }

            const decryptedMatch = {};

            // فك تشفير الحقول
            const fieldsToDecrypt = ['league', 'team1', 'team2', 'channel', 'commentator', 'date'];
            fieldsToDecrypt.forEach(field => {
                if (encryptedMatch[field]) {
                    decryptedMatch[field] = this.decryptData(encryptedMatch[field]);
                }
            });

            // فك تشفير الروابط
            if (encryptedMatch.linkType === 'regular' && encryptedMatch.links) {
                decryptedMatch.links = encryptedMatch.links.map(link => this.decryptData(link));
            } else if (encryptedMatch.linkType === 'xmtv' && encryptedMatch.xmtvLink) {
                decryptedMatch.xmtvLink = this.decryptData(encryptedMatch.xmtvLink);
            }

            // الحقول غير المشفرة
            decryptedMatch.linkType = encryptedMatch.linkType;
            decryptedMatch.time = encryptedMatch.time;
            decryptedMatch.leagueLogo = encryptedMatch.leagueLogo;
            decryptedMatch.team1Logo = encryptedMatch.team1Logo;
            decryptedMatch.team2Logo = encryptedMatch.team2Logo;
            decryptedMatch.createdAt = encryptedMatch.createdAt;

            return decryptedMatch;
        } catch (error) {
            console.error('❌ خطأ في فك تشفير المباراة:', error);
            return encryptedMatch;
        }
    }

    createXmtvLink(linksArray) {
        try {
            if (!linksArray || linksArray.length === 0) return '#';
            
            // تشفير الروابط
            const encryptedLinks = linksArray.map(link => this.encryptData(link));
            const linksString = JSON.stringify(encryptedLinks);
            const encodedLinks = btoa(linksString);
            
            // إنشاء رابط خاص
            return `https://xmtv-player.netlify.app/?data=${encodedLinks}&ref=${window.location.hostname}`;
        } catch (error) {
            console.error('❌ خطأ في إنشاء رابط XM TV:', error);
            return linksArray[0] || '#';
        }
    }
}

// تهيئة النظام
window.DataProtector = new DataProtector();
console.log("✅ نظام الحماية محمل ومستعد");
