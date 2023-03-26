const express = require('express')
const router = express.Router()
const Controller = require('./controller')

router.post('/register', Controller.register)
router.post('/verify', Controller.verifyUser)
router.post('/login/email', Controller.login_email)

module.exports = router;