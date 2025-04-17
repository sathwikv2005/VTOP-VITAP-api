export default function parseSemIDs(document) {
	const select = document.querySelector('#semesterSubId')
	const options = Array.from(select.querySelectorAll('option'))

	const semesters = options
		.filter((opt) => opt.value && opt.value !== '')
		.map((opt) => ({
			semId: opt.value,
			semName: opt.textContent.trim(),
		}))

	return semesters
}
