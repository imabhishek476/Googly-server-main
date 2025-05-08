require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { generatePuppeteer, downloadPdfFromHtml } = require('./puppeteer');
const { home } = require('./home');

const app = express();
const port = process.env.PORT || 3000;


const corsOptions = {
    origin: [process.env.CORS_DOMAIN],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// Middleware to parse JSON requests
app.use(express.json({ limit: '50mb' }));

app.use(cors());

app.use(bodyParser.json());

// Connect to MongoDB (replace 'YOUR_MONGODB_CONNECTION_STRING' with your actual connection string) //
mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser: true, useUnifiedTopology: true})
.then(res=>{console.log("connected successfully")})
.catch(error => console.log(error));

// Define a User model
const User = mongoose.model('User', {
    email: String,
    password: String,
    createdAt: {type: Date, default: Date.now}
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        // Accept provided email and password
        const { email, password } = req.body;
        if(!email || !password){
            res.status(404).json({ message: "Sorry you are not allowed"});
        }

        // Log the received credentials (for demonstration purposes)
        console.log(`Received login request - Email: ${email}, Password: ${password}`);

        // Create a new user document
        const newUser = new User({
            email,
            password
        });

        // Save the new user document to the database
        await newUser.save();

        // Send a success response
        res.status(200).json({ message: 'Login successful. User details saved.' });
    } catch (error) {
        // Handle any errors that may occur during the process
        res.status(500).json({ message: error.message });
    }

});

app.get('/', async (req,res)=>{
    res.json({id: "puppeteer", message: "Working"})
})
app.get('/monitor', async (req,res)=>{
    res.json({id: "puppeteer", message: "Working"})
})

app.post('/vibepulse/fabric/design', generatePuppeteer)
app.get('/puppeteer/html2pdf', downloadPdfFromHtml);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
