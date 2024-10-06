const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose'); // Add mongoose
require('dotenv').config(); // Load environment variables from .env

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

// MongoDB connection function
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'users'
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process if connection fails
    }
};

// Call the connectDB function to establish the connection
connectDB();

// Order model
const orderSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true,
    },
    PhoneNumber: {
        type: String,
        required: true,
    },
    finalAddress: {
        type: String,
        required: true,
    },
});

const Order = mongoose.model('Order', orderSchema);

// Product model
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: String, required: true }, // e.g., "5/10"
});

const Product = mongoose.model('Product', productSchema);

// Function to save default products
const saveDefaultProducts = async () => {
    const defaultProducts = [
        { name: 'Small', size: '5', price: 780, stock: '5/10' },
        { name: 'Medium', size: '10', price: 1200, stock: '7/10' },
        { name: 'Large', size: '15', price: 1500, stock: '3/10' },
        { name: 'Ex-Large', size: '20', price: 2000, stock: '2/10' },
    ];

    try {
        await Product.insertMany(defaultProducts);
        console.log('Default products saved to the database.');
    } catch (error) {
        console.error('Error saving default products:', error);
    }
};

// Fetch products
// Route to get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products
        res.json(products); // Return products as JSON
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products.');
    }
});
// Route to get user details by phone number
app.get('/api/get-user/:phoneNumber', async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        const order = await Order.findOne({ PhoneNumber: phoneNumber }); // Assuming Order is your model
        if (order) {
            res.json(order); // Send the user details back as JSON
        } else {
            res.status(404).json(null); // User not found
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user details.' });
    }
});
// Route to send message and save order
app.post('/send-message', async (req, res) => {
    let { FirstName, PhoneNumber, Size, deliveryOption, deliveryMethod, finalAddress, addressOption } = req.body;

    // Set default values if undefined
    Size = Size || "N/A"; // Default to "N/A" if Size is undefined
    deliveryOption = deliveryOption || "doorToDoor"; // Default to "doorToDoor"

    // Construct the message
    let message = `Name: ${FirstName}\nPhone Number: ${PhoneNumber}\n`;

    try {
        // Check the delivery option
        if (deliveryOption === "takeAway") {
            // For Take Away, just send the name, number, and delivery option without checking the database
            message += `Size: ${Size}\nDelivery Option: Take Away\n`;

            // Send the message to Telegram without database operations
            await sendMessageToTelegram(message);
            return res.status(200).json({ success: true, message: 'Message sent successfully for Take Away!' });
        } 

        // If the delivery option is Door to Door
        // Use the deliveryMethod from the request body directly without defaulting
        message += `Size: ${Size}\nDelivery Option: Door to Door\nDelivery Method: ${deliveryMethod}\nAddress Type: ${addressOption}\nAddress: ${finalAddress}\n`;

        // Your Telegram bot token and chat ID
        const botToken = process.env.BOT_TOKEN; // Store your bot token in .env
        const chatId = process.env.CHAT_ID; // Store your chat ID in .env

        // Inline keyboard markup for Accept and Decline buttons
        const inlineKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Accept", callback_data: "accept" },
                        { text: "Decline", callback_data: "decline" }
                    ]
                ]
            }
        };

        // Check if the user already exists in the database by PhoneNumber
        const existingOrder = await Order.findOne({ PhoneNumber });

        if (!existingOrder) {
            // Save the user details if not already saved
            const order = new Order({ FirstName, PhoneNumber, finalAddress }); // Assuming finalAddress is part of the model
            await order.save(); // Save to the database
        } else {
            // If the user exists and the delivery option is Door to Door, update the address
            existingOrder.finalAddress = finalAddress; // Update the address
            await existingOrder.save(); // Save the updated details
        }

        // Send the message to Telegram
        await sendMessageToTelegram(message, inlineKeyboard);

        res.status(200).json({ success: true, message: 'Message sent successfully and order processed!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error sending message or processing order.' });
    }
});

// Function to send message to Telegram
const sendMessageToTelegram = async (message, inlineKeyboard = {}) => {
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
        chat_id: process.env.CHAT_ID,
        text: message,
        ...inlineKeyboard // Spread the inline keyboard object into the request body
    });
};







// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
