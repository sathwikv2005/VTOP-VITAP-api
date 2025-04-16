export default function parseTimeTable(document) {
	const table = document.querySelector('#timeTableStyle')
	const rows = Array.from(table.querySelectorAll('tr'))

	// Extract time slots from the 1st and 2nd rows
	const thTimeRow = rows[0]
	const thEndTimeRow = rows[1]
	const thTimeCells = Array.from(thTimeRow.querySelectorAll('td')).slice(2)
	const thEndTimeCells = Array.from(thEndTimeRow.querySelectorAll('td')).slice(2)
	const thTimeSlots = thTimeCells.map((cell, index) => {
		const start = cell.textContent.trim().split(' - ')[0]
		const end = thEndTimeCells[index]?.textContent.trim().split(' - ')[0]
		return { start, end }
	})

	// Extract time slots from the 3rd and 4th rows
	const labTimeRow = rows[2]
	const labEndTimeRow = rows[3]
	const labTimeCells = Array.from(labTimeRow.querySelectorAll('td')).slice(2)
	const labEndTimeCells = Array.from(labEndTimeRow.querySelectorAll('td')).slice(1)
	const labTimeSlots = labTimeCells.map((cell, index) => {
		const start = cell.textContent.trim().split(' - ')[0]
		const end = labEndTimeCells[index]?.textContent.trim().split(' - ')[0]
		return { start, end }
	})

	const timetable = []

	for (let i = 4; i < rows.length; i += 2) {
		const theoryRow = rows[i]
		const labRow = rows[i + 1]

		const dayName = theoryRow.querySelector('td:nth-child(1)').textContent.trim().toUpperCase()

		const theoryCells = Array.from(theoryRow.querySelectorAll('td')).slice(2)
		const labCells = Array.from(labRow?.querySelectorAll('td') || []).slice(2)

		const classes = []

		theoryCells.forEach((cell, index) => {
			const text = cell.textContent.trim()
			const bgcolor = cell.getAttribute('bgcolor')
			if (text && text !== '-' && text !== 'Lunch' && bgcolor === '#CCFF33') {
				// only push registered slots
				const textArray = text.split('-').slice(0, -1) //[slot, courseCode, ELA/ETH/TH/LA, roomno, block, blockno?]
				const venue = `${textArray[3]}, ${textArray[4]}${textArray[5] ? `-${textArray[5]}` : ''}`
				classes.push({
					type: 'theory',
					slot: textArray[0],
					courseCode: textArray[1],
					venue,
					class: text,
					timings: {
						...thTimeSlots[index],
					},
				})
			}
		})

		labCells.forEach((cell, index) => {
			const text = cell.textContent.trim()
			const bgcolor = cell.getAttribute('bgcolor')
			if (text && text !== '-' && text !== 'Lunch' && bgcolor === '#CCFF33') {
				// only push registered slots
				const textArray = text.split('-').slice(0, -1) //[slot, courseCode, ELA/ETH/TH/LA, roomno, block, blockno?]
				const venue = `${textArray[3]}, ${textArray[4]}${textArray[5] ? `-${textArray[5]}` : ''}`
				classes.push({
					type: 'lab',
					slot: textArray[0],
					courseCode: textArray[1],
					venue,
					class: text,
					timings: {
						...labTimeSlots[index + 1],
					},
				})
			}
		})

		timetable.push({
			day: dayName,
			classes,
		})
	}
	return timetable
}
