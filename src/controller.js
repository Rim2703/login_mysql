const db = require('../db')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')

// Generate a random OTP
function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

// Send OTP to user's email using nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your@gmail.com',
        pass: 'your_pass'
    }
});

// Register Api -
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const otp = generateOTP()

        const user = { name, email, password, otp }

        const sql = 'INSERT INTO users SET ?';

        db.query(sql, user, (err, result) => {
            if (err) {
                res.status(500).send('Server Error')
                return;
            }

            console.log('User data inserted to the database: ', result)

            // Send OTP to User's Email
            const mailOptions = {
                from: 'your@gmail.com',
                to: email,
                subject: 'OTP for Registration',
                text: `Your OTP for registration is ${otp}`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    res.status(500).send('Server Error');
                    return
                }

                res.status(200).send('OTP sent to the user\'s email')

            })
        })
    }
    catch (err) {
        res.status(500).json({ status: false, Error: err.message })
    }
}

// Verify Account Api:
const verifyUser = (req, res) => {
    const { email, otp } = req.body;

    // Check if the OTP is correct
    const sql = 'SELECT * FROM users WHERE email = ? AND otp = ?';
    db.query(sql, [email, otp], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: 'Failed to verify account' })
        }
        if (result.length === 0) {
            return res.status(400).json({ message: 'Incorrect OTP' });
        }
        res.json({ message: 'Account verified' })
    });
}

const jwtSecret = "secretKey";

// login with email and password Api with JWT token
const login_email = (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, email, (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length === 0) {
            res.status(401).send('Invalid email or password');
        } else {
            if (password === result[0].password) {
                // Create JWT token
                const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });

                const user = {
                    email,
                    token
                }

                res.status(200).send({ message: 'User logged in with access Token:', data: user });
            } else {
                res.status(401).send('Invalid email or password');
            }
        }
    })
}

module.exports = { register, verifyUser, login_email }