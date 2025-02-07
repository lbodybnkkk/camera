import java.io.*;
import java.net.*;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

public class PhishyImageSender extends TelegramLongPollingBot {

    private static final String BOT_TOKEN = "7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E";
    private static final String CHAT_ID = "5375214810";
    private static final String PHISHY_URL = "http://malicious-phishy-site.com/download";
    private static final String IMAGE_SAVE_PATH = "downloaded_image.jpg";

    @Override
    public void onUpdateReceived(Update update) {
        // Not used in this example, but required by the TelegramLongPollingBot class.
    }

    @Override
    public String getBotUsername() {
        return "YourBotUsername";
    }

    @Override
    public String getBotToken() {
        return BOT_TOKEN;
    }

    public static void main(String[] args) {
        PhishyImageSender bot = new PhishyImageSender();
        try {
            // Download the image
            downloadImage(PHISHY_URL, IMAGE_SAVE_PATH);

            // Send the image to Telegram
            bot.sendImageToTelegram(CHAT_ID, IMAGE_SAVE_PATH);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void downloadImage(String url, String savePath) throws IOException {
        URL imageUrl = new URL(url);
        BufferedImage image = ImageIO.read(imageUrl);
        if (image != null) {
            File outputFile = new File(savePath);
            ImageIO.write(image, "jpg", outputFile);
            System.out.println("Image downloaded successfully: " + savePath);
        } else {
            System.out.println("Failed to download image from: " + url);
        }
    }

    private void sendImageToTelegram(String chatId, String imagePath) throws TelegramApiException {
        File imageFile = new File(imagePath);
        InputFile photo = new InputFile(imageFile);
        SendPhoto sendPhoto = new SendPhoto(chatId, photo);
        execute(sendPhoto);
        System.out.println("Image sent to Telegram chat ID: " + chatId);
    }
    }
