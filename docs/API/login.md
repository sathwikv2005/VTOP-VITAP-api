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
    "domain": "vtop.vitap.ac.in",
    ...
  }
}
```

---

### 2. `GET /login`

Logs the user into VTOP using the credentials, captcha, and CSRF token from the `/getcaptcha` response.

#### 📥 Query Parameters

| Name         | Type   | Required | Description                                        |
| ------------ | ------ | -------- | -------------------------------------------------- |
| `username`   | string | No       | VTOP username. Defaults to `USER_NAME` from `.env` |
| `pwd`        | string | No       | VTOP password. Defaults to `PASSWORD` from `.env`  |
| `captchaStr` | string | Yes      | Captcha text (case-insensitive)                    |
| `csrf`       | string | Yes      | CSRF token from `/getcaptcha`                      |
| `jsessionId` | string | Yes      | JSESSIONID cookie value from `/getcaptcha`         |

#### ✅ Example Request

```
GET /login?username=22BCE1234&pwd=yourpass&captchaStr=AB12C&csrf=ae98f65b-456d&jsessionId=ADF354FDG
```

#### 📤 Response

```json
{
  "message": "Login successful",
  "cookies": [
    {
      "key": "JSESSIONID",
      "value": "F9C3145BFC7F6C5472191AD1F9A10E5E",
      ...
    },
    ...
  ],
  "csrf": "new-csrf-token-after-login"
}
```

---

## 🛠 Internal Flow

1. `/getcaptcha`

   - GET login page → extract CSRF token
   - Extract `JSESSIONID` from `Set-Cookie`
   - Call pre-login endpoint
   - Call captcha generation endpoint

2. `/login`
   - POST login form with credentials and captcha
   - Reuse cookies from the jar (managed via `fetch-cookie`)

---

## 🧪 Notes

- `fetch-cookie` is used to persist session cookies across requests.
- Make sure the same `csrf` and `JSESSIONID` are used during login.
- Manual cookie setting is only done once; normally the cookie jar handles it.
- This route simulates a real browser using headers like `User-Agent`, `Origin`, and `Referer`.

---
