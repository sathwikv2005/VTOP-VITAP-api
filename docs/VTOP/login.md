## 🔐 Login Page

### Endpoint

`GET /vtop/login`

This endpoint returns an HTML page containing a login form. The form of interest has the ID: `vtopLoginForm`.

### Form Details

The form includes **4 input fields**:

| Input Name | Visibility | Purpose                                                                |
| ---------- | ---------- | ---------------------------------------------------------------------- |
| `_csrf`    | Hidden     | CSRF token set by the server; required for future requests.            |
| `username` | Visible    | Your VIT registration number.                                          |
| `password` | Visible    | Your VTOP password.                                                    |
| `captcha`  | Visible    | CAPTCHA text shown on the page; must be entered correctly by the user. |

### Submit Behavior

Submitting the form sends a `POST` request to:

```
POST /vtop/login
```

with the values from the input fields listed above.

### Authentication Response

On **successful authentication**, the server responds with a `JSESSIONID` cookie. This cookie must be used in future requests to maintain the session and access authenticated pages like the homepage.

**Note:** The server also responds with a new HTML page containing a new `_csrf` token. The old token becomes invalid and should not be reused.

---

### 🧪 Sample `curl` Request

```bash
curl 'https://vtop.vitap.ac.in/vtop/login' \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode '_csrf=fromTheHtml' \
  --data-urlencode 'username=00XYZ0000' \
  --data-urlencode 'password=urlEncodedPassword' \
  --data-urlencode 'captchaStr=captcha'
```

> 📌 Replace `username`, `password`, `captchaStr`, and `_csrf` with actual values.

---

➡️ Once authenticated, continue to the [Home Page](./homePage.md) to access VTOP features.
