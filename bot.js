require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


if (!TELEGRAM_BOT_TOKEN || !GEMINI_API_KEY) {
    console.error("❌ ERROR: Missing API keys! Check your .env file.");
    process.exit(1);
}


const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 

console.log("✅ Bot is running (Using Gemini-Pro for text only)...");


async function getGeminiResponse(userMessage) {
    try {
        const result = await model.generateContent(userMessage);
        const response = result.response;
        return response.text() || "🤖 Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("❌ Error calling Gemini AI:", error);
        return "⚠️ Error processing your request. Try again later!";
    }
}


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "👋 Hello! I'm your AI-powered bot 🤖 using Google Gemini AI (Text-Only). Ask me anything!");
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text?.trim(); 

    // Ignore bot commands
    if (!userMessage || userMessage.startsWith("/")) return;

    // Show "typing..." action
    bot.sendChatAction(chatId, "typing");

    try {
       
        const tempMessage = await bot.sendMessage(chatId, "🤔 Thinking...");

    
        const geminiReply = await getGeminiResponse(userMessage);

        
        bot.editMessageText(geminiReply, {
            chat_id: chatId,
            message_id: tempMessage.message_id,
        });
    } catch (error) {
        console.error("❌ Error sending message:", error);
        bot.sendMessage(chatId, "⚠️ Oops! Something went wrong. Try again.");
    }
});
