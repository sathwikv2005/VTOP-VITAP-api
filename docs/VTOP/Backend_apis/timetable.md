## 🗓️ Semester Time Table API

### Endpoint

```
POST /vtop/processViewTimeTable
```

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

### 📄 Response

- The server returns an **HTML** `<div>`.
- The time table is located inside the following table:

```html
<table id="timeTableStyle"></table>
```

---

### 🧪 Sample `curl` Request

```bash
curl 'https://vtop.vitap.ac.in/vtop/processViewTimeTable' \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: JSESSIONID=yourSessionIdHere' \
  --data-urlencode 'x=Sun, 13 Apr 2025 11:09:13 GMT' \
  --data-urlencode '_csrf=fromTheHtml' \
  --data-urlencode 'semesterSubId=AP20xxxxx' \
  --data-urlencode 'authorizedID=00XYZ0000'
```

> 📌 Replace all placeholder values (`_csrf`, `semesterSubId`, `authorizedID`, `JSESSIONID`) with actual values.
