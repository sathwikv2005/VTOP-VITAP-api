# 📘 VTOP API - Get Timetable

This endpoint retrieves the full semester timetable for a student from VTOP.

---

## 📌 Endpoint

```
GET /api/timetable
```

---

## 📥 Query Parameters

| Name         | Type   | Required | Description                                                       |
| ------------ | ------ | -------- | ----------------------------------------------------------------- |
| `username`   | string | No       | VTOP username. Defaults to `USER_NAME` from `.env`                |
| `semID`      | string | No       | Semester ID. Defaults to `SEM` from `.env`                        |
| `csrf`       | string | Yes      | CSRF token obtained after login (from `/api/login` response)      |
| `jsessionId` | string | Yes      | JSESSIONID cookie from login session (from `/api/login` response) |

---

## ✅ Example Request

```http
GET /api/timetable?username=22BCE1234&semID=AP2024001&csrf=abc123&jsessionId=XYZ456
```

---

## 📤 Example Response

```json
[
	{
		"day": "MON",
		"classes": [
			{
				"type": "theory",
				"slot": "A1",
				"courseCode": "MAT1011",
				"venue": "101, AB",
				"class": "A1-MAT1011-ETH-101-AB-ALL",
				"timings": {
					"start": "10:00",
					"end": "10:50"
				}
			}
		]
	},
	{
		"day": "TUE",
		"classes": [
			{
				"type": "lab",
				"slot": "L1",
				"courseCode": "CSE1001",
				"venue": "302, CB-2",
				"class": "L1-CSE1001-ELA-302-CB-2-ALL",
				"timings": {
					"start": "11:00",
					"end": "11:50"
				}
			}
		]
	}
]
```

---

## ❌ Possible Errors

| HTTP Status | Message                                    | Reason                              |
| ----------- | ------------------------------------------ | ----------------------------------- |
| `400`       | `BAD REQUEST. Missing parameters.`         | Required query parameters not found |
| `401`       | `Unauthorized. Invalid csrf or session ID` | Invalid or expired session          |
| `500`       | `Failed to fetch time table`               | Internal server error or VTOP issue |

---

## 📝 Notes

- Requires successful login via `/api/login` before calling this endpoint.
- Make sure to pass the same `csrf` and `jsessionId` received during login.
- Timetable data is parsed from the VTOP response HTML using `linkedom`.
