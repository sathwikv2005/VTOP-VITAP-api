import dotenv from 'dotenv'
import { parseHTML } from 'linkedom'
import { parseAttendance, parseAttendanceByID } from '../util/parse/parseAttendance.js'
import VtopConfig from '../vtop_config.json' with { type: 'json' }
import Headers from '../headers.json' with { type: 'json' }

import fs from 'fs'

dotenv.config()

export async function getAttendance(req, res) {
	var { csrf, jsessionId, username, semID } = req.query
	if (!username) username = process.env.USER_NAME
	if (!semID) semID = process.env.SEM

	if (!csrf || !jsessionId || !username || !semID)
		return res.status(400).json({ error: 'BAD REQUEST. Missing parameters. Failed to login' })

	try {
		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('semesterSubId', semID)
		params.append('authorizedID', username)
		params.append('x', new Date().toUTCString())

		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.ViewStudentAttendance, {
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

		const attendance = parseAttendance(document)

		res.json(attendance)
	} catch (error) {
		console.error('Error fetching attendance:', error)
		res.status(500).json({ error: 'Failed to fetch attendance' })
	}
}

export async function getAttendanceByID(req, res) {
	var { csrf, jsessionId, username, semID, courseType } = req.query
	const courseID = req.params.courseID
	if (!username) username = process.env.USER_NAME
	if (!semID) semID = process.env.SEM
	if (!csrf || !jsessionId || !username || !semID || !courseType)
		return res.status(400).json({ error: 'BAD REQUEST. Missing parameters.' })
	if (!courseID) return res.status(400).json({ error: 'BAD REQUEST. Missing courseID.' })

	try {
		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('semesterSubId', semID)
		params.append('courseId', courseID)
		params.append('courseType', courseType)
		params.append('authorizedID', username)
		params.append('registerNumber', username)
		params.append('x', new Date().toUTCString())

		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.ViewAttendanceDetail, {
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

		// const html = fs.readFileSync('./samples/attendance/sampleAttendanceDetail.html', 'utf-8')
		// var { document } = parseHTML(html)

		const attendanceByID = parseAttendanceByID(document)

		res.json(attendanceByID)
	} catch (error) {
		console.error('Error fetching attendance by id:', error)
		res.status(500).json({ error: 'Failed to fetch attendance by id' })
	}
}
