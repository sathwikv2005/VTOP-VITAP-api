## 🏠 Home Page

After a successful [Login](./login.md), you will have a valid session with the VTOP server, authenticated using a `JSESSIONID` cookie.

### Endpoint

`GET /vtop/content`

This endpoint returns the VTOP homepage.

### Request Requirements

To access the homepage, simply make a `GET` request to the above endpoint while including the `JSESSIONID` cookie obtained during [Login](./login.md).

### Response

The server responds with an HTML file representing the homepage content.

---

### 🧪 Sample `curl` Request

```bash
curl 'https://vtop.vitap.ac.in/vtop/content' \
  -X GET \
  -H 'Cookie: JSESSIONID=yourSessionIdHere'
```

> 📌 Replace `yourSessionIdHere` with the actual session ID received after login.
