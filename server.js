const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
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

// Define the Product model
const productSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ['small', 'medium', 'large', 'extra-large'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

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

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true }
  });
  
  // Create a User model based on the schema
  const User = mongoose.model('User', userSchema);
  
  // API endpoint to save the user data
  app.post('/api/saveUser', async (req, res) => {
    try {
      const { name, number, address, email } = req.body;
  
      // Create a new user document
      const newUser = new User({
        name,
        number,
        address,
        email
      });
  
      // Save user to the database
      await newUser.save();
      res.status(201).send({ message: 'User data saved successfully!' });
    } catch (error) {
      console.error('Error saving user data:', error);
      res.status(500).send({ message: 'Error saving user data' });
    }
  });
  
// Route to add or update a product
app.post('/api/products', async (req, res) => {
    const { size, price, quantity } = req.body;

    try {
        // Find an existing product by size
        const existingProduct = await Product.findOne({ size });

        if (existingProduct) {
            // If the product exists, update only the fields that are provided
            if (price) {
                existingProduct.price = price; // Update price if provided
            }
            if (quantity) {
                existingProduct.quantity = quantity; // Update quantity if provided
            }

            await existingProduct.save(); // Save changes
            return res.status(200).json({ success: true, message: 'Product updated successfully!' });
        } else {
            // If no product exists, create a new one
            const newProduct = new Product({ size, price, quantity });
            await newProduct.save();
            return res.status(200).json({ success: true, message: 'Product added successfully!' });
        }
    } catch (error) {
        console.error('Error adding/updating product:', error);
        return res.status(500).json({ success: false, message: 'Failed to add/update product.' });
    }
});

// Route to get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); // Retrieve all products from the database
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
});

// Route to get user details by phone number
app.get('/api/get-user/:phoneNumber', async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        const order = await Order.findOne({ PhoneNumber: phoneNumber }); // Find order by PhoneNumber
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

        // Inline keyboard markup for Accept and Decline buttons
        const inlineKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Accept", callback_data: `accept_${Size}` },
                        { text: "Decline", callback_data: "decline" }
                    ]
                ]
            }
        };

        // Check if the user already exists in the database by PhoneNumber
        const existingOrder = await Order.findOne({ PhoneNumber });

        if (!existingOrder) {
            // Save the user details if not already saved
            const order = new Order({ FirstName, PhoneNumber, finalAddress });
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

// Route to handle Telegram callback queries
app.post('/telegram-callback', async (req, res) => {
    const callbackQuery = req.body;

    // Check if the callback data is "accept"
    if (callbackQuery?.callback_query?.data.startsWith('accept')) {
        const chatId = callbackQuery.callback_query.from.id;
        const size = callbackQuery.callback_query.data.split('_')[1]; // Extract size from callback data

        try {
            // Find the product by size and decrement the quantity by 1
            const product = await Product.findOne({ size });
            if (product) {
                product.quantity = Math.max(0, product.quantity - 1); // Decrease by 1, ensuring quantity doesn't go below 0
                await product.save();

                // Send a confirmation message to the user
                await sendMessageToTelegram(`Thank you! The order for size ${size} has been accepted. Remaining quantity: ${product.quantity}`, { chat_id: chatId });
                res.status(200).json({ success: true, message: 'Product quantity updated and message sent.' });
            } else {
                // Send a message if the product wasn't found
                await sendMessageToTelegram(`Sorry, the product of size ${size} was not found.`, { chat_id: chatId });
                res.status(404).json({ success: false, message: 'Product not found.' });
            }
        } catch (error) {
            console.error('Error handling Telegram callback:', error);
            res.status(500).json({ success: false, message: 'Error processing callback.' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Invalid callback data.' });
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

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,      // Your email address
      pass: process.env.EMAIL_PASS   // Your email password or app password
    }
  });
  
  // Endpoint to handle form submission
  app.post('/submit-form', (req, res) => {
    const { FirstName, PhoneNumber, message } = req.body;
  
    const mailOptions = {
      from: process.env.EMAIL,        // "from" address is the sender's email
      to: process.env.EMAIL2,         // "to" address is the recipient's email
      subject: 'Form Submission',
      text: `First Name: ${FirstName}\nPhone Number: ${PhoneNumber}\nMessage: ${message}`
    };
  
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    });
});

app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    // Create a transporter with your email service credentials
    let transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: 'm.mohamed.shinan@gmail.com',      // Corrected email address
            pass: 'dkggwcvxopwmnzhm'                 // Ensure that this is your actual App Password
        }
    });

    // Email options
    let mailOptions = {
        from: 'm.mohamed.shinan@gmail.com',          // Corrected email address
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent: ' + info.response);
        res.status(200).send('OTP sent successfully');
    });
});
  


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
