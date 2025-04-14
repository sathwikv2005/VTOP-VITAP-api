import express from 'express'
import { getCaptcha, vtopLogin } from '../controllers/login.js'

const router = express.Router()

router.get('/getcaptcha', async (req, res) => {
	try {
		const captcha = await getCaptcha()
		res.json(captcha)
	} catch (err) {
		console.error('Error fetching page:', err)
		res.status(500).json({ error: 'Failed to fetch captcha' })
	}
})

router.get('/login', async (req, res) => {
	var { username, pwd, captchaStr, csrf, jsessionId } = req.query

	try {
		const sessionDetails = await vtopLogin(username, pwd, captchaStr, csrf, jsessionId)
		res.json(sessionDetails)
	} catch (err) {
		console.error('Error during login:', err)
		res.status(500).json({ error: 'Failed to login' })
	}
})

export default router
