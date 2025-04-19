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

Fetches the list of all subjects with their attendance summary and metadata.

#### 📥 Query Parameters

| Name         | Type   | Required | Description                                      |
| ------------ | ------ | -------- | ------------------------------------------------ |
| `csrf`       | string | ✅       | CSRF token obtained after login                  |
| `jsessionId` | string | ✅       | JSESSIONID cookie obtained after login           |
| `username`   | string | ❌       | Your VTOP ID (defaults to `USER_NAME` from .env) |
| `semID`      | string | ❌       | Semester ID (defaults to `SEM` from .env)        |

#### 📤 Response

```json
[
  {
    "courseDetails": "ABC1234 - Some Course - Embedded Theory",
    "classDetails": "AP2024000000123 - A1+A2 - 101",
    "faculty": "PROF. ABC XYZ - SCOPE",
    "attended": "32",
    "totalClasses": "41",
    "percentage": "79",
    "semesterId": "AP2024000",
    "courseID": "AM_ABC1234_00000",
    "classType": "ETH",
    "regNo": "21XXX9999"
  },
  ...
]
```

---

### 2. `GET /api/attendance/:courseID`

Fetches detailed attendance logs for a particular course.

> 📌 **Note:** `courseID` should be one of the `courseID` values returned by the `/api/attendance` endpoint.

#### 📥 Path Parameter

| Name       | Type   | Required | Description                                      |
| ---------- | ------ | -------- | ------------------------------------------------ |
| `courseID` | string | ✅       | The courseID returned from `/api/attendance` API |

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
	"courseDetails": "ABC1234 - Some Course - Embedded Theory",
	"classDetails": "AP2024000000123 - A1+A2 - 101",
	"faculty": "PROF. ABC XYZ - SCOPE",
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
				"date": "01-01-2025",
				"day": "MON",
				"time": "14:00-14:50",
				"slot": "A1",
				"reason": null
			},
			{
				"isPresent": false,
				"status": "Absent",
				"date": "02-01-2025",
				"day": "TUE",
				"time": "14:00-14:50",
				"slot": "A1",
				"reason": "Student Punched After Faculty End Punch"
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
- You can use `/api/getcaptcha` and `/api/login` to initialize sessions.

---
