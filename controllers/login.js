import dotenv from 'dotenv'
import fetch from 'node-fetch'
import fetchCookie from 'fetch-cookie'
import { parseHTML } from 'linkedom'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import { CookieJar } from 'tough-cookie'

dotenv.config()

export async function getCaptcha() {
	const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)

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
	return { captcha: src, csrf, jsessionId }
}

export async function vtopLogin(username, pwd, captchaStr, csrf, jsessionId) {
    const jar = new CookieJar()
	const fetchWithCookies = fetchCookie(fetch, jar)
	if (!username) username = process.env.USER_NAME //use default creds from .env
	if (!pwd) pwd = process.env.PASSWORD //use default creds from .env

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

	const html = await response.text()

	var { document } = parseHTML(html)

	//Get new csrf Token
	var csrf = document.querySelector('input[name="_csrf"]')?.value

	var cookies = await jar.getCookies(VtopConfig.domain + '/vtop') //Contains new session cookie

	return { message: 'Login successful', cookies, csrf }
}
