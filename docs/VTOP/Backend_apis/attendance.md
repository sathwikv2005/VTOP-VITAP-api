## 📊 Student Attendance API

### Endpoint for Attendance Overview

`POST /vtop/processViewStudentAttendance`

This endpoint is used to fetch a student's attendance details for all courses in a semester.

---

### 🧾 Required Parameters

| Parameter       | Source                               | Description                                                                    |
| --------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `_csrf`         | From HTML after [Login](../login.md) | CSRF token required for the request.                                           |
| `semesterSubId` | Static (e.g., `AP20xxxxx`)           | The first 10 characters of your class ID. Same for all courses in a semester.  |
| `authorizedID`  | Your registration number             | Format: `00XYZ0000`                                                            |
| `x`             | Current date/time                    | Format: `Sun, 13 Apr 2025 11:09:13 GMT`. Use `new Date().toUTCString()` in JS. |

---

### 🍪 Required Cookie

- `JSESSIONID` – Obtained after [Login](../login.md). Must be included in the request header as a cookie.

---

### ✅ Successful Response

- The server responds with an **HTML** page.
- Your attendance data will be inside the `<table>` element with the ID:

```html
<table id="AttendanceDetailDataTable"></table>
```

You can parse this table to extract detailed attendance information.

---

### 🧪 Sample `curl` Request

```bash
curl 'https://vtop.vitap.ac.in/vtop/processViewStudentAttendance' \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: JSESSIONID=yourSessionIdHere' \
  --data-urlencode 'x= date/time' \
  --data-urlencode '_csrf=fromTheHtml' \
  --data-urlencode 'semesterSubId=AP20xxxxx' \
  --data-urlencode 'authorizedID=00XYZ0000'
```

> 📌 Replace all placeholder values (`_csrf`, `semesterSubId`, `authorizedID`, `JSESSIONID`) with actual values.

---

### Endpoint for Attendance Details Per Course

`POST /vtop/processViewAttendanceDetail`

This endpoint is used to fetch attendance details for a specific course.

---

### 🧾 Required Parameters

| Parameter        | Source                               | Description                                                                                          |
| ---------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `_csrf`          | From HTML after [Login](../login.md) | CSRF token required for the request.                                                                 |
| `semesterSubId`  | Static (e.g., `AP20xxxxx`)           | The first 10 characters of your class ID. Same for all courses in a semester.                        |
| `registerNumber` | Your registration number             | Format: `00XYZ0000`                                                                                  |
| `courseId`       | Found in the `onclick` attribute     | Example: `AM_CSE1005_00100`. [More info on finding courseId](#where-to-find-courseid-and-coursetype) |
| `courseType`     | Found in the `onclick` attribute     | Example: `ETH` or `ELA`. [More info on finding courseType](#where-to-find-courseid-and-coursetype)   |
| `authorizedID`   | Your registration number             | Format: `00XYZ0000`                                                                                  |
| `x`              | Current date/time                    | Format: `Sun, 13 Apr 2025 11:09:13 GMT`. Use `new Date().toUTCString()` in JS.                       |

---

### 🍪 Required Cookie

- `JSESSIONID` – Obtained after [Login](../login.md). Must be included in the request header as a cookie.

---

### 🔍 Where to Find `courseId` and `courseType`

To find the `courseId` and `courseType`, inspect the `onclick` function in the HTML of the **Attendance Overview** page. Here’s an example:

```html
<a
	id="studentAttendanceDetilShow_0"
	onclick="javascript: callStudentAttendanceDetailDisplay('AP20xxxxx','00XYZ0000','AM_CSE1005_00100','ETH');"
	href="javascript:void(0);"
	>...</a
>
```

- **courseId**: `AM_CSE1005_00100`
- **courseType**: `ETH`

Both values are passed as arguments to the `callStudentAttendanceDetailDisplay()` function in the `onclick` attribute.

---

The response sent by the server will be an HTML `<div>` containing two tables with the IDs `StudentCourseDetailDataTable` and `StudentAttendanceDetailDataTable`:

- **StudentCourseDetailDataTable**: This table contains the course details and attendance information, such as:

  - Total number of classes
  - Present count
  - Absent count
  - Attendance percentage

- **StudentAttendanceDetailDataTable**: This table contains your attendance log for every class of the course.

### 🧪 Sample `curl` Request

```bash
curl 'https://vtop.vitap.ac.in/vtop/processViewAttendanceDetail' \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: JSESSIONID=yourSessionIdHere' \
  --data-urlencode 'x= date/time' \
  --data-urlencode '_csrf=fromTheHtml' \
  --data-urlencode 'semesterSubId=AP20xxxxx' \
  --data-urlencode 'registerNumber=00XYZ0000' \
  --data-urlencode 'authorizedID=00XYZ0000' \
  --data-urlencode 'courseId=AM_CSE1005_00100' \
  --data-urlencode 'courseType=ETH'
```

> 📌 Replace all placeholder values (`_csrf`, `semesterSubId`, `registerNumber`, `authorizedID`, `courseId`, `courseType`, `JSESSIONID`) with actual values.

---
