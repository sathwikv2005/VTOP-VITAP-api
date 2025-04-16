# Semester ID Retrieval API

There are two endpoints to get your enrolled semesters to date.

---

## Endpoint 1: Get Semester Data from TimeTable

### URL:

```
POST vtop/academics/common/StudentTimeTable
```

### Query Parameters:

- `verifyMenu`: `true`
- `authorizedID`: Your VTOP ID (e.g., `00XYZ000`)
- `_csrf`: CSRF token after login
- `nocache`: `@(new Date().getTime())`

### Cookie:

- `JSESSIONID`: JSESSIONID from after login

### Response HTML:

Look for a `<select>` tag with the ID `semesterSubId`. Example snippet:

```html
<select
	class="form-select"
	name="semesterSubId"
	id="semesterSubId"
	data-validation-engine="validate[required]"
	onchange="processViewTimeTable();"
>
	<option value="" selected="selected">--Choose Semester--</option>
	<option value="AP2024001">Winter Semester 2024-25</option>
	<option value="AP2024002">FALL SEM 2024-25</option>
	<option value="AP2023001">WIN SEM 2023-24</option>
	<option value="AP2023002">FALL SEM 2023-24</option>
</select>
```

---

## Endpoint 2: Get Semester Data from Attendance

### URL:

```
POST vtop/academics/common/StudentAttendance
```

### Query Parameters:

- `verifyMenu`: `true`
- `authorizedID`: Your VTOP ID (e.g., `00XYZ000`)
- `_csrf`: CSRF token after login
- `nocache`: `@(new Date().getTime())`

### Cookie:

- `JSESSIONID`: JSESSIONID from after login

### Response HTML:

Look for a `<select>` tag with the ID `semesterSubId`. Example snippet:

```html
<select
	class="form-select"
	name="semesterSubId"
	id="semesterSubId"
	onchange="processStudentAttendance()"
>
	<option value="" selected="selected">-- Choose Semester --</option>
	<option value="AP2024001">Winter Semester 2024-25</option>
	<option value="AP2024002">FALL SEM 2024-25</option>
	<option value="AP2023001">WIN SEM 2023-24</option>
	<option value="AP2023002">FALL SEM 2023-24</option>
</select>
```

---
