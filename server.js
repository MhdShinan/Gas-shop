const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose'); // Add mongoose

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the css, images, and js directories
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));

// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Define the Product Schema (for storing stock and price)
const productSchema = new mongoose.Schema({
    size: String,
    price: Number,
    stock: Number
});

// Create a Product model from the schema
const Product = mongoose.model('Product', productSchema);

// Route to handle form submission (Telegram message sending)
app.post('/send-message', async (req, res) => {
    const { FirstName, PhoneNumber } = req.body;

    // Compose the message
    const message = `Name: ${FirstName}, Phone Number: ${PhoneNumber}`;
    
    // Your Telegram bot token and chat ID
    const botToken = '7418584036:AAEmk0bynA7D4D4fOdfa6idYVybsiltwv4g'; // Replace with your bot token
    const chatId = '6236066117'; // Replace with your chat ID

    // Send the message to Telegram
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message
        });
        res.status(200).send('Message sent successfully!');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
