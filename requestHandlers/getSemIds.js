import dotenv from 'dotenv'
import { parseHTML } from 'linkedom'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import Headers from '../headers.json' with { type: 'json' }

dotenv.config()

export async function getSemIds(req, res) {
	var { csrf, jsessionId, username } = req.query
	if (!username) username = process.env.USER_NAME
	if (!csrf || !jsessionId || !username)
		return res.status(400).json({ error: 'BAD REQUEST. Missing parameters.' })

	try {
		const params = new URLSearchParams()
		params.append('authorizedID', username)
		params.append('verifyMenu', 'true')
		params.append('_csrf', csrf)
		params.append('nocache', '@(new Date().getTime())')

		const response = await fetch(VtopConfig.domain+VtopConfig.backEndApi.studentTimeTable, {
			method: 'POST',
			headers: {
				...Headers,
                Cookie: `JSESSIONID=${jsessionId}`
			},
			body: params.toString(),
		})

		// Session not found
		if (response.status === 404)
			return res.status(401).json({ error: 'Unauthorized. Invalid csrf or session ID' })

		if (!response.ok) return res.status(response.status).json({ error: response.statusText })

		const html = await response.text()
		var { document } = parseHTML(html)

		const select = document.querySelector('#semesterSubId')
		const options = Array.from(select.querySelectorAll('option'))

		const semesters = options
			.filter((opt) => opt.value && opt.value !== '')
			.map((opt) => ({
				semId: opt.value,
				semName: opt.textContent.trim(),
			}))

        return res.status(200).json(semesters)
	} catch (error) {
		console.error('Failed to fetch semIDs. Error:\n', error)
		res.status(500).json({ error: 'Failed to fetch semIDs.' })
	}
}
