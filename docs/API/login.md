# VTOP Authentication API

This API allows you to fetch a CAPTCHA image and log in to the VTOP system programmatically using session-managed requests.

---

## 📌 Base URL

```
http://<your-domain-or-localhost>:<port>/api
```

---

## 📂 Routes

### 1. `GET /getcaptcha`

Fetches the VTOP login page, retrieves a CSRF token and JSESSIONID cookie, performs a pre-login request, and then fetches the CAPTCHA image.

#### 📥 Request

No parameters.

#### 📤 Response

```json
{
	"captcha": "/vtop/captcha/image/123456789.png",
	"csrf": "ae98f65b-456d-42d2-a789-abc123",
	"jsessionId": {
		"key": "JSESSIONID",
		"value": "F9C3145BFC7F6C5472191AD1F9A10E5E",
		"domain": "vtop.vitap.ac.in"
	}
}
```

#### ⚠ Possible Errors

| Status | Message                 | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| 500    | Failed to fetch captcha | When CAPTCHA or session setup fails |

---

### 2. `GET /login`

Logs the user into VTOP using the credentials, captcha, and CSRF token from the `/getcaptcha` response.

#### 📥 Query Parameters

| Name         | Type   | Required | Description                                         |
| ------------ | ------ | -------- | --------------------------------------------------- |
| `username`   | string | No       | VTOP username (defaults to `USER_NAME` from `.env`) |
| `pwd`        | string | No       | VTOP password (defaults to `PASSWORD` from `.env`)  |
| `captchaStr` | string | Yes      | Captcha text (case-insensitive)                     |
| `csrf`       | string | Yes      | CSRF token from `/getcaptcha`                       |
| `jsessionId` | string | Yes      | JSESSIONID value from `/getcaptcha`                 |

#### ✅ Example

```
GET /login?username=22BCE1234&pwd=yourpass&captchaStr=AB12C&csrf=ae98f65b&jsessionId=ADF354FDG
```

#### 📤 Successful Response

```json
{
	"message": "Login successful",
	"cookies": [
		{
			"key": "JSESSIONID",
			"value": "F9C3145BFC7F6C5472191AD1F9A10E5E"
		}
	],
	"csrf": "new-csrf-token-after-login"
}
```

#### ⚠ Possible Errors

| Status | Message                                  | Description                           |
| ------ | ---------------------------------------- | ------------------------------------- |
| 400    | BAD REQUEST. Missing parameters.         | Required query parameters are missing |
| 401    | Unauthorized. Invalid csrf or session ID | Invalid CSRF token or session ID      |
| 401    | Invalid LoginId/Password                 | Incorrect username or password        |
| 401    | Invalid Captcha                          | Captcha was incorrect                 |
| 500    | Failed to login                          | Unexpected server-side error          |

---

## 🛠 Internal Flow

### `/getcaptcha`

- GET login page → extract CSRF token
- Extract `JSESSIONID` from `Set-Cookie`
- Call pre-login setup endpoint
- Call captcha generation endpoint

### `/login`

- POST login form with credentials and captcha
- HTML is parsed to detect login error spans
- Cookie jar maintains and forwards sessions
- New CSRF and session cookies are returned

---

## 🧪 Notes

- `fetch-cookie` is used to manage session cookies.
- Use the same `csrf` and `jsessionId` from `/getcaptcha` for login.
- Login validation is based on detecting error messages in the HTML.
- Realistic headers like `User-Agent`, `Referer`, and `Origin` are used to simulate browser behavior.
