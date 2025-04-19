export function parseAttendance(document) {
	const table = document.querySelector('#AttendanceDetailDataTable')
	const rows = Array.from(table.querySelectorAll('tr'))

	const attendance = []

	rows.forEach((row) => {
		const details = Array.from(row.querySelectorAll('td'))
		const onclick = details[10]?.querySelector('a')?.getAttribute('onclick')

		const match = onclick?.match(
			/callStudentAttendanceDetailDisplay\('([^']+)','([^']+)','([^']+)','([^']+)'\)/
		) // get class details from within the parameters of the onclick function

		const [_, semesterId, regNo, courseID, classType] = match || []

		const courseDetails = details[2]?.querySelector('span')?.textContent.trim()
		const classDetails = details[3]?.querySelector('span')?.textContent.trim()

		if (!courseDetails || !classDetails) return // skip if essential fields are missing
		attendance.push({
			courseDetails,
			classDetails,
			faculty: details[4]?.querySelector('span')?.textContent.trim(),
			attended: details[5]?.querySelector('span')?.textContent.trim(),
			totalClasses: details[6]?.querySelector('span')?.textContent.trim(),
			percentage: details[7]?.querySelector('span')?.textContent.trim().replace('%', ''),
			semesterId,
			courseID,
			classType,
			regNo,
		})
	})

	return attendance
}

export function parseAttendanceByID(document) {
	const summaryRow = document.querySelector('#StudentCourseDetailDataTable tbody tr')
	const cells = summaryRow.querySelectorAll('td')

	const getText = (el) => el?.textContent.trim() || ''

	const courseDetails = getText(cells[1])
	const classDetails = getText(cells[2])
	const faculty = getText(cells[3])

	const attendanceSummary = cells[6]
	const attendanceSpans = attendanceSummary.querySelectorAll('span')

	const attendance = {
		present: 0,
		absent: 0,
		onduty: 0,
		attended: 0,
		total: 0,
		percentage: 0,
		log: [],
	}

	attendanceSpans.forEach((span) => {
		const text = span.textContent.trim()
		if (text.includes('Present :')) attendance.present = parseInt(text.split(':')[1])
		else if (text.includes('Absent :')) attendance.absent = parseInt(text.split(':')[1])
		else if (text.includes('On Duty :')) attendance.onduty = parseInt(text.split(':')[1])
		else if (text.includes('Attended :')) attendance.attended = parseInt(text.split(':')[1])
		else if (text.includes('Total Class :')) attendance.total = parseInt(text.split(':')[1])
		else if (text.includes('Percentage :')) {
			const percent = span.querySelector('span')?.textContent.trim()
			attendance.percentage = parseFloat(percent?.replace('%', '') || '0')
		}
	})

	const detailRows = document.querySelectorAll('#StudentAttendanceDetailDataTable tbody tr')
	detailRows.forEach((row) => {
		const cols = row.querySelectorAll('td')
		if (cols.length === 0) return

		const date = getText(cols[1])
		const slot = getText(cols[2])
		const dayTime = getText(cols[3])
		const [day, time] = dayTime.split(' / ')
		const status = getText(cols[4])
		const reason = getText(cols[5]) || null

		attendance.log.push({
			isPresent: status.toLowerCase() === 'present' || status.toLowerCase() === 'on duty',
			status,
			date,
			day,
			time,
			slot,
			reason,
		})
	})

	return {
		courseDetails,
		classDetails,
		faculty,
		attendance,
	}
}
