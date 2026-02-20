import dotenv from 'dotenv'
import fetchCookie from 'fetch-cookie'
import { parseHTML } from 'linkedom'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import Headers from '../headers.json' with { type: 'json' }
import { CookieJar } from 'tough-cookie'
import { solveCaptcha } from '../util/captcha/captchaSolver.js'
import fs from 'fs'
import path from 'path'
import { Agent as UndiciAgent } from 'undici'

dotenv.config()

const vtopIntermediate = fs.readFileSync(path.resolve('certs/vtop_ca.pem'))

const sectigoRoot = fs.readFileSync(path.resolve('certs/sectigo_root_r46.pem'))

const undiciAgent = new UndiciAgent({
	connect: {
		ca: [vtopIntermediate, sectigoRoot],
		rejectUnauthorized: true,
	},
})

const fetch = fetchCookie(globalThis.fetch)

export async function getCaptcha(req, res) {
	const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)

	try {
		let response = await fetchWithCookies(VtopConfig.domain + VtopConfig.backEndApi.prelogin, {
			headers: { ...Headers },
			dispatcher: undiciAgent,
		})

		let html = await response.text()
		let { document } = parseHTML(html)
		const csrf = document.querySelector('input[name="_csrf"]').value

		// Session setup
		response = await fetchWithCookies(
			`${VtopConfig.domain}${VtopConfig.backEndApi.prelogin}?_csrf=${csrf}&flag=VTOP`,
			{
				headers: { ...Headers },
				dispatcher: undiciAgent,
			},
		)

		// Get session cookie
		const cookies = await jar.getCookies(VtopConfig.domain + '/vtop')
		const jsessionId = cookies.find((c) => c.key === 'JSESSIONID')

		// Get captcha
		response = await fetchWithCookies(VtopConfig.domain + VtopConfig.backEndApi.newCaptcha, {
			dispatcher: undiciAgent,
		})

		html = await response.text()
		;({ document } = parseHTML(html))
		const img = document.querySelector('img')
		const captchaUrl = img?.getAttribute('src')

		res.json({
			captcha: captchaUrl,
			csrf,
			jsessionId,
			next: `http://127.0.0.1:6700/api/login?csrf=${csrf}&jsessionId=${jsessionId.value}&captchaStr=`,
		})
	} catch (err) {
		console.error('Error fetching captcha:', err)
		res.status(500).json({ error: 'Failed to fetch captcha' })
	}
}

export async function vtopLogin(req, res) {
	let { username, pwd, captchaStr, csrf, jsessionId } = req.query

	const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)

	if (!username) username = process.env.USER_NAME
	if (!pwd) pwd = process.env.PASSWORD

	try {
		if (!username || !pwd || !captchaStr || !csrf || !jsessionId) {
			return res.status(400).json({ error: 'Missing parameters' })
		}

		const form = new URLSearchParams({
			username: username.toUpperCase(),
			password: pwd,
			captchaStr: captchaStr.toUpperCase(),
			_csrf: csrf,
		})

		const response = await fetchWithCookies(VtopConfig.domain + VtopConfig.vtopUrls.login, {
			method: 'POST',
			headers: {
				...Headers,
				Cookie: `JSESSIONID=${jsessionId}`,
			},
			body: form.toString(),
			dispatcher: undiciAgent,
		})

		const html = await response.text()
		const { document } = parseHTML(html)

		const errorSpan = document.querySelector('span.text-danger.text-center[role="alert"]')
		const errorText = errorSpan?.textContent.trim()

		if (errorText) {
			return res.status(401).json({ error: errorText })
		}

		const newCsrf = document.querySelector('input[name="_csrf"]')?.value
		const cookies = await jar.getCookies(VtopConfig.domain + '/vtop')

		res.json({
			message: 'Login successful',
			csrf: newCsrf,
			cookies,
		})
	} catch (err) {
		console.error('Login error:', err)
		res.status(500).json({ error: 'Login failed' })
	}
}

export async function loginAutoCaptcha(req, res) {
	let { username, pwd } = req.body

	const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)

	if (!username) username = process.env.USER_NAME
	if (!pwd) pwd = process.env.PASSWORD

	try {
		// Prelogin
		let response = await fetchWithCookies(VtopConfig.domain + VtopConfig.backEndApi.prelogin, {
			headers: { ...Headers },
			dispatcher: undiciAgent,
		})

		let html = await response.text()
		let { document } = parseHTML(html)
		let csrf = document.querySelector('input[name="_csrf"]').value

		response = await fetchWithCookies(
			`${VtopConfig.domain}${VtopConfig.backEndApi.prelogin}?_csrf=${csrf}&flag=VTOP`,
			{
				headers: { ...Headers },
				dispatcher: undiciAgent,
			},
		)

		const cookies = await jar.getCookies(VtopConfig.domain + '/vtop')
		const jsessionId = cookies.find((c) => c.key === 'JSESSIONID')?.value

		// Captcha
		response = await fetchWithCookies(VtopConfig.domain + VtopConfig.backEndApi.newCaptcha, {
			dispatcher: undiciAgent,
		})

		html = await response.text()
		;({ document } = parseHTML(html))
		const img = document.querySelector('img')
		const captchaUrl = img?.getAttribute('src')

		const captchaStr = await solveCaptcha(captchaUrl)

		const form = new URLSearchParams({
			username: username.toUpperCase(),
			password: pwd,
			captchaStr: captchaStr.toUpperCase(),
			_csrf: csrf,
		})

		response = await fetchWithCookies(VtopConfig.domain + VtopConfig.vtopUrls.login, {
			method: 'POST',
			headers: {
				...Headers,
				Cookie: `JSESSIONID=${jsessionId}`,
			},
			body: form.toString(),
			dispatcher: undiciAgent,
		})

		html = await response.text()
		;({ document } = parseHTML(html))

		const errorSpan = document.querySelector('span.text-danger.text-center[role="alert"]')
		const errorText = errorSpan?.textContent.trim()

		if (errorText) {
			return res.status(401).json({ error: errorText })
		}

		csrf = document.querySelector('input[name="_csrf"]')?.value
		const finalCookies = await jar.getCookies(VtopConfig.domain + '/vtop')

		res.json({
			message: 'Login successful',
			csrf,
			cookies: finalCookies,
		})
	} catch (err) {
		console.error('Auto login error:', err)
		res.status(500).json({ error: 'Auto login failed' })
	}
}
