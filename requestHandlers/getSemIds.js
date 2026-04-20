import dotenv from 'dotenv'
import { parseHTML } from 'linkedom'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import Headers from '../headers.json' with { type: 'json' }
import parseSemIDs from '../util/parse/parseSemIDs.js'

dotenv.config()

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

		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.studentTimeTable, {
			method: 'POST',
			headers: {
				...Headers,
				Cookie: `JSESSIONID=${jsessionId}`,
			},
			body: params.toString(),
			dispatcher: undiciAgent,
		})

		// Session not found
		if (response.status === 404)
			return res.status(401).json({ error: 'Unauthorized. Invalid csrf or session ID' })

		if (!response.ok) return res.status(response.status).json({ error: response.statusText })

		const html = await response.text()
		var { document } = parseHTML(html)

		const semesters = parseSemIDs(document)

		return res.status(200).json(semesters)
	} catch (error) {
		console.error('Failed to fetch semIDs. Error:\n', error)
		res.status(500).json({ error: 'Failed to fetch semIDs.' })
	}
}
