# 📘 API Documentation: Get Semester IDs

**Endpoint:** `GET /api/semids`  
**Description:** Fetches the list of available semester IDs and names from VTOP for the given session.

---

## 🔐 Required Query Parameters

| Name         | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| `csrf`       | string | CSRF token from VTOP session           |
| `jsessionId` | string | Session ID (`JSESSIONID`) from VTOP    |
| `username`   | string | VTOP username (e.g., registration no.) |

> If `username` is not provided, it defaults to `.env` variable `USER_NAME`.

---

## ✅ Successful Response

**Status:** `200 OK`  
**Content-Type:** `application/json`

Returns an array of semester objects:

```json
[
	{
		"semId": "AP2024001",
		"semName": "Winter Semester 2024-25"
	},
	{
		"semId": "AP2024002",
		"semName": "FALL SEM 2024-25"
	},
	{
		"semId": "AP2023001",
		"semName": "WIN  SEM 2023-24"
	},
	{
		"semId": "AP2023002",
		"semName": "FALL SEM 2023-24"
	}
]
```

---

## ❌ Error Responses

### `400 Bad Request`

Returned when any required query parameter is missing.

```json
{
	"error": "BAD REQUEST. Missing parameters."
}
```

---

### `401 Unauthorized`

Returned when the provided CSRF token or session ID (`jsessionId`) is invalid.

```json
{
	"error": "Unauthorized. Invalid csrf or session ID"
}
```

---

### `500 Internal Server Error`

Returned when an unexpected error occurs during processing or while fetching/parsing HTML from VTOP.

```json
{
	"error": "Failed to fetch semIDs."
}
```

---

## 📌 Notes

- The endpoint **requires a valid session** with VTOP to function correctly.
- This API **parses HTML** content from VTOP's student timetable page to extract semester options.
- Make sure `csrf` and `jsessionId` are fresh — VTOP sessions expire quickly.
