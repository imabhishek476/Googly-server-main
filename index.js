require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;


const corsOptions = {
    origin: [process.env.CORS_DOMAIN],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
