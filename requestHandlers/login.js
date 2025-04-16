import dotenv from 'dotenv'
import fetch from 'node-fetch'
import fetchCookie from 'fetch-cookie'
import { parseHTML } from 'linkedom'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import { CookieJar } from 'tough-cookie'

dotenv.config()

export async function getCaptcha(req, res) {
	const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)
	try {
		//Get csrf token
		var response = await fetchWithCookies(VtopConfig.domain + VtopConfig.vtopUrls.login, {
			headers: {
				Accept:
					'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
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
					Accept:
						'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
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
		res.json({ captcha: src, csrf, jsessionId })
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
				'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
				Referer: 'https://vtop.vitap.ac.in/vtop/open/page',
				Origin: 'https://vtop.vitap.ac.in',
				'Content-Type': 'application/x-www-form-urlencoded',
				Cookie: `JSESSIONID=${jsessionId}`,
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
