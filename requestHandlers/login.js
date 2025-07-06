import dotenv from 'dotenv'
import fetch from 'node-fetch'
import fetchCookie from 'fetch-cookie'
import { parseHTML } from 'linkedom'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import Headers from '../headers.json' with { type: 'json' }
import { CookieJar } from 'tough-cookie'
import { solveCaptcha } from '../util/captcha/captchaSolver.js'

dotenv.config()

export async function getCaptcha(req, res) {
	const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)
	try {
		//Get csrf token
		var response = await fetchWithCookies(VtopConfig.domain + VtopConfig.backEndApi.prelogin, {
			headers: {
				...Headers,
			},
		})

		const html = await response.text()
		var { document } = parseHTML(html)
		const csrf = document.querySelector('input[name="_csrf"]').value

		//Create a session with VTOP server at /vtop/preLoginSetup
		var response = await fetchWithCookies(
			VtopConfig.domain + VtopConfig.backEndApi.prelogin + `?_csrf=${csrf}&flag=VTOP`,
			{
				headers: {
					...Headers,
				},
			}
		)

		//Get the sessionID
		const cookies = await jar.getCookies(VtopConfig.domain + '/vtop')
		const jsessionId = cookies.find((c) => c.key === 'JSESSIONID')

		//Get captcha.
		const captchaResponse = await fetchWithCookies(
			VtopConfig.domain + VtopConfig.backEndApi.newCaptcha
		)

		const captchaHtml = await captchaResponse.text()
		var { document } = parseHTML(captchaHtml)
		const img = document.querySelector('img')
		const src = img?.getAttribute('src') //Captch url

		
		//The csrf token is required for the /api/login endpoint
		res.json({ captcha: src, csrf, jsessionId, next: `http://127.0.0.1:6700/api/login?csrf=${csrf}&jsessionId=${jsessionId.value}&captchaStr=`  })
	} catch (err) {
		console.error('Error fetching page:', err)
		res.status(500).json({ error: 'Failed to fetch captcha' })
	}
}

export async function vtopLogin(req, res) {
	var { username, pwd, captchaStr, csrf, jsessionId } = req.query
	const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)
	if (!username) username = process.env.USER_NAME //use default creds from .env
	if (!pwd) pwd = process.env.PASSWORD //use default creds from .env

	try {
		if (!username || !pwd || !captchaStr || !csrf || !jsessionId)
			return res.status(400).json({ error: 'BAD REQUEST. Missing parameters. Failed to login' })
		// Prepare form data for login
		const loginParams = new URLSearchParams()
		loginParams.append('username', username.toUpperCase())
		loginParams.append('password', pwd)
		loginParams.append('captchaStr', captchaStr.toUpperCase())
		loginParams.append('_csrf', csrf)

		// Send POST request for login
		const response = await fetchWithCookies(VtopConfig.domain + VtopConfig.vtopUrls.login, {
			method: 'POST',
			headers: {
				...Headers,
                Cookie: `JSESSIONID=${jsessionId}`
			},
			body: loginParams.toString(),
		})
		

		// Session not found
		if (response.status === 404)
			return res.status(401).json({ error: 'Unauthorized. Invalid csrf or session ID' })

		const html = await response.text()

		var { document } = parseHTML(html)

		const errorSpan = document.querySelector('span.text-danger.text-center[role="alert"]')
		const errorText = errorSpan?.textContent.trim()

		if (errorText) {
			//Invalid username, password or captcha
			return res.status(401).json({ error: errorText })
		}

		//Get new csrf Token
		var csrf = document.querySelector('input[name="_csrf"]')?.value

		var cookies = await jar.getCookies(VtopConfig.domain + '/vtop') //Contains new session cookie

		res.json({ message: 'Login successful', cookies, csrf, html })
	} catch (err) {
		console.error('Error during login:', err)
		res.status(500).json({ error: 'Failed to login' })
	}
}

export async function loginAutoCaptcha(req,res) {
	var { username, pwd } = req.query
	let jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)
	if (!username) username = process.env.USER_NAME //use default creds from .env
	if (!pwd) pwd = process.env.PASSWORD //use default creds from .env
	try {
		//Get csrf token
		var response = await fetchWithCookies(VtopConfig.domain + VtopConfig.backEndApi.prelogin, {
			headers: {
				...Headers,
			},
		})

		let html = await response.text()
		var { document } = parseHTML(html)
		var csrf = document.querySelector('input[name="_csrf"]').value

		//Create a session with VTOP server at /vtop/preLoginSetup
		response = await fetchWithCookies(
			VtopConfig.domain + VtopConfig.backEndApi.prelogin + `?_csrf=${csrf}&flag=VTOP`,
			{
				headers: {
					...Headers,
				},
			}
		)

		//Get the sessionID
		var cookies = await jar.getCookies(VtopConfig.domain + '/vtop')
		let jsessionId = cookies.find((c) => c.key === 'JSESSIONID')?.value

		//Get captcha.
		const captchaResponse = await fetchWithCookies(
			VtopConfig.domain + VtopConfig.backEndApi.newCaptcha
		)

		const captchaHtml = await captchaResponse.text()
		var { document } = parseHTML(captchaHtml)
		const img = document.querySelector('img')
		const src = img?.getAttribute('src') //Captch url

		
		//solve captcha
		const captchaStr = await solveCaptcha(src)

		//login
		if (!username || !pwd || !captchaStr || !csrf || !jsessionId)
			return res.status(400).json({ error: 'BAD REQUEST. Missing parameters. Failed to login' })
		// Prepare form data for login
		const loginParams = new URLSearchParams()
		loginParams.append('username', username.toUpperCase())
		loginParams.append('password', pwd)
		loginParams.append('captchaStr', captchaStr.toUpperCase())
		loginParams.append('_csrf', csrf)

		// Send POST request for login
		response = await fetchWithCookies(VtopConfig.domain + VtopConfig.vtopUrls.login, {
			method: 'POST',
			headers: {
				...Headers,
                Cookie: `JSESSIONID=${jsessionId}`
			},
			body: loginParams.toString(),
		})
		

		// Session not found
		if (response.status === 404)
			return res.status(401).json({ error: 'Unauthorized. Invalid csrf or session ID' })

		html = await response.text()

		var { document } = parseHTML(html)

		const errorSpan = document.querySelector('span.text-danger.text-center[role="alert"]')
		const errorText = errorSpan?.textContent.trim()

		if (errorText) {
			//Invalid username, password or captcha
			return res.status(401).json({ error: errorText })
		}

		//Get new csrf Token
		csrf = document.querySelector('input[name="_csrf"]')?.value

		cookies = await jar.getCookies(VtopConfig.domain + '/vtop') //Contains new session cookie

		res.json({ message: 'Login successful', cookies, csrf, html })
		

	} catch (err) {
		console.error('Error fetching page:', err)
		res.status(500).json({ error: 'Failed to login with auto captcha' })
	}
	
}
