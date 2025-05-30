import dotenv from 'dotenv'
import { parseHTML } from 'linkedom'
import parseTimeTable from '../util/parse/parseTimeTable.js'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import Headers from '../headers.json' with { type: 'json' }

dotenv.config()

export async function timeTable(req, res) {
	var { csrf, jsessionId, username, semID } = req.query
	if (!username) username = process.env.USER_NAME
	if (!semID) semID = process.env.SEM

	if (!csrf || !jsessionId || !username || !semID)
		return res.status(400).json({ error: 'BAD REQUEST. Missing parameters.' })

	try {
		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('semesterSubId', semID)
		params.append('authorizedID', username)
		params.append('x', new Date().toUTCString())

		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.viewTimeTable, {
			method: 'POST',
			headers: {
				...Headers,
				Cookie: `JSESSIONID=${jsessionId}`,
			},
			body: params.toString(),
		})

		// Session not found
		if (response.status === 404)
			return res.status(401).json({ error: 'Unauthorized. Invalid csrf or session ID' })

		if (!response.ok) return res.status(response.status).json({ error: response.statusText })

		const html = await response.text()
		var { document } = parseHTML(html)

		const timeTable = parseTimeTable(document)

		return res.json( timeTable )
	} catch (error) {
		console.error('Error fetching time table:', error)
		res.status(500).json({ error: 'Failed to fetch time table' })
	}
}
