const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate')
const cookieParser = require('cookie-parser');
router.use(cookieParser())

require('../db/conn')
const User = require('../model/userschema');

router.get('/', (req, res) => {
    res.send("Hello ")
})

router.post('/register', async(req, res) => {

    const { name, email, phone, work, password, cpassword } = req.body

    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(422).json({ errow: "Please fill all the input field now" })
    }

    try {

        const userExist = await User.findOne({ email: email })

        if (userExist) {
            return res.status(422).json({ error: `Email already exist` })

        } else if (password != cpassword) {
            return res.status(422).json({ error: `Password is not matching` })

        } else {
            const user = new User({ name, email, phone, work, password, cpassword })
            await user.save();
            res.status(201).json({ message: `user register successfuly` })

        }

    } catch (error) {
        console.log(error);
    }
})


router.post('/login', async(req, res) => {
    try {
        let token;

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ errow: "Please fill " })
        }
        const userLogin = await User.findOne({ email: email })

        if (userLogin) {
            const isMatching = await bcrypt.compare(password, userLogin.password);

            token = await userLogin.generateAuthToken();

            res.cookie("jwttoken", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });

            if (!isMatching) {
                res.status(400).json({ errow: "Invalid Login Details" })

            } else {
                res.json({ message: 'User Signin Sccessfully' });
            }
        } else {

            res.status(400).json({ errow: "Invalid Login Details" })
        }

    } catch (error) {
        console.log(error);
    }

});

// for login and about 

router.get('/about', authenticate, (req, res) => {
    console.log('Hello my about');
    res.send(req.rootUser);
});

// for contact and home 

router.get('/getData', authenticate, (req, res) => {
    console.log('Hello my contact');
    res.send(req.rootUser);
});

// contact us page 
router.post('/contact', authenticate, async(req, res) => {
    try {

        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            console.log('error in contact form');
            return res.json({ error: 'plzz filled the contact form' });

        }

        const userContact = await User.findOne({ _id: req.userID });

        if (userContact) {

            const userMessage = await userContact.addMessage(name, email, phone, message)

            await userContact.save();

            res.status(201).json({ message: "user Contact Successfully" })
        }

    } catch (error) {
        console.log('error hai');
    }
});


router.get('/logout', (req, res) => {
    console.log('Hello my about');
    res.clearCookie('jwttoken', { path: '/' });
    res.status(200).send(req.rootUser);
});

module.exports = router