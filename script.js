const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { createLogger, format, transports } = require('winston');
const { Command } = require('commander');
const FileType = require('file-type');
require('dotenv').config();

// Initialize Winston Logger
const logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' }),
    ],
});

// Configuration from Environment Variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const IMAGE_FOLDER = process.env.IMAGE_FOLDER || 'downloaded_images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Ensure the image folder exists
if (!fs.existsSync(IMAGE_FOLDER)) {
    fs.mkdirSync(IMAGE_FOLDER, { recursive: true });
}

// CLI Setup
const program = new Command();
program
    .option('-u, --url <url>', 'URL of the image to download')
    .option('-c, --chat-id <chatId>', 'Telegram chat ID')
    .parse(process.argv);

const options = program.opts();

// Validate URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

// Download Image with Retry Logic
async function downloadImage(url, savePath, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                url,
                responseType: 'stream',
            });

            if (response.status === 200) {
                const contentLength = response.headers['content-length'];
                if (contentLength > MAX_FILE_SIZE) {
                    throw new Error('Image is too large');
                }

                const writer = fs.createWriteStream(savePath);
                response.data.pipe(writer);

                return new Promise((resolve, reject) => {
                    writer.on('finish', async () => {
                        const fileInfo = await FileType.fromFile(savePath);
                        if (!fileInfo || !fileInfo.mime.startsWith('image/')) {
                            fs.unlinkSync(savePath); // Delete the file if it's not an image
                            throw new Error('Downloaded file is not an image');
                        }
                        logger.info(`Image successfully downloaded: ${savePath}`);
                        resolve();
                    });
                    writer.on('error', reject);
                });
            } else {
                logger.error(`Failed to download image from ${url}`);
            }
        } catch (error) {
            logger.error(`Attempt ${i + 1}: Error downloading image:`, error);
            if (i === retries - 1) throw error; // Throw error after last retry
        }
    }
}

// Send Image to Telegram
async function sendImageToTelegram(chatId, imagePath) {
    try {
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', fs.createReadStream(imagePath));

        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
            form,
            {
                headers: form.getHeaders(),
            }
        );

        if (response.data.ok) {
            logger.info(`Image sent to Telegram chat ID: ${chatId}`);
        } else {
            logger.error('Failed to send image to Telegram:', response.data);
        }
    } catch (error) {
        logger.error('Error sending image to Telegram:', error);
    }
}

// Main Function
async function main() {
    try {
        const url = options.url || process.env.PHISHY_URL;
        const chatId = options.chatId || TELEGRAM_CHAT_ID;

        if (!isValidUrl(url)) {
            logger.error('Invalid URL provided');
            return;
        }

        const imageFormat = path.extname(new URL(url).pathname).toLowerCase() || '.jpg';
        const imageName = `image_${Date.now()}${imageFormat}`;
        const imagePath = path.join(IMAGE_FOLDER, imageName);

        await downloadImage(url, imagePath);
        await sendImageToTelegram(chatId, imagePath);
    } catch (error) {
        logger.error('Error in main function:', error);
    }
}

// Run the Program
main().catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
});
