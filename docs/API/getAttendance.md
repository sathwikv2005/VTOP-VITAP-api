# 📊 VTOP Attendance API

This module provides access to VTOP attendance data via two endpoints:

- `GET /api/attendance`: Returns the overall attendance summary.
- `GET /api/attendance/:courseID`: Returns detailed attendance logs for a specific course.

---

## 🌐 Base URL

```
http://localhost:<port>/api
```

---

## 📂 Endpoints

### 1. `GET /api/attendance`

Fetches the list of all subjects with their attendance percentage and metadata.

#### 📥 Query Parameters

| Name         | Type   | Required | Description                                      |
| ------------ | ------ | -------- | ------------------------------------------------ |
| `csrf`       | string | ✅       | CSRF token obtained after login                  |
| `jsessionId` | string | ✅       | JSESSIONID cookie obtained after login           |
| `username`   | string | ❌       | Your VTOP ID (defaults to `USER_NAME` from .env) |
| `semID`      | string | ❌       | Semester ID (defaults to `SEM` from .env)        |

#### 📤 Response

Returns a list of attendance entries for each subject:

```json
[
  {
    "courseCode": "CSE3008",
    "courseName": "Machine Learning",
    "courseType": "ETH",
    "slot": "D2+TD2",
    "faculty": "Dr. XYZ",
    "venue": "104, AB2",
    "attended": 30,
    "total": 41,
    "percentage": 74
  },
  ...
]
```

---

### 2. `GET /api/attendance/:courseID`

Fetches detailed attendance logs for a particular course.

#### 📥 Query Parameters

| Name         | Type   | Required | Description                                      |
| ------------ | ------ | -------- | ------------------------------------------------ |
| `csrf`       | string | ✅       | CSRF token obtained after login                  |
| `jsessionId` | string | ✅       | JSESSIONID cookie obtained after login           |
| `username`   | string | ❌       | Your VTOP ID (defaults to `USER_NAME` from .env) |
| `semID`      | string | ❌       | Semester ID (defaults to `SEM` from .env)        |
| `courseType` | string | ✅       | Type of course (e.g., ETH, TH, ELA)              |

#### 📤 Response

```json
{
	"courseDetails": "CSE3008 - Introduction to ML - Embedded Theory",
	"classDetails": "AP2000000000000 - D2+TD2 - 104",
	"faculty": "PROF. XYZ - SCOPE",
	"attendance": {
		"present": 29,
		"absent": 11,
		"onduty": 1,
		"attended": 30,
		"total": 41,
		"percentage": 74,
		"log": [
			{
				"isPresent": true,
				"status": "Present",
				"date": "17-04-2025",
				"day": "FRI",
				"time": "14:00-14:50",
				"slot": "D2",
				"reason": null
			},
			{
				"isPresent": false,
				"status": "Absent",
				"date": "03-04-2025",
				"day": "THU",
				"time": "14:00-14:50",
				"slot": "D2",
				"reason": "Student Punched After Faculty End Punch"
			},
			{
				"isPresent": true,
				"status": "On Duty",
				"date": "02-04-2025",
				"day": "WED",
				"time": "14:00-14:50",
				"slot": "D2",
				"reason": null
			},
			{
				"isPresent": false,
				"status": "Not Posted",
				"date": "01-04-2025",
				"day": "TUE",
				"time": "14:00-14:50",
				"slot": "D2",
				"reason": null
			}
		]
	}
}
```

---

## 🚫 Possible Errors

| Code | Message                                  |
| ---- | ---------------------------------------- |
| 400  | BAD REQUEST. Missing parameters.         |
| 401  | Unauthorized. Invalid csrf or session ID |
| 500  | Failed to fetch attendance               |

---

## ✅ Notes

- Cookies and tokens are required and must match the session generated from login.
- You can use `/api/login` and `/api/getcaptcha` to initialize sessions.

---

```

```
