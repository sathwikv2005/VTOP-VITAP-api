## 📘 About

This is an **unofficial API** for VIT AP's student portal, **VTOP**.

> **Note:** Most of the documentation for this project was written by ChatGPT.

- 📄 API Documentation: [`./docs/api`](./docs/api)
- 🔧 VTOP Internal Working: [`./docs/VTOP`](./docs/VTOP)

## ⚙️ Setup

To configure VTOP-related links such as the login page, home page, and backend API endpoints, modify:

- ⚙️ [`./vtop_config.json`](./vtop_config.json)

### Requirements

- [Node.js](https://nodejs.org/) must be installed.

### Installation

Install dependencies by running:

```bash
npm install
```

### Running the Server

Start the server with:

```bash
node index.js
```

By default, the server starts on port `6700`.

To change the port, add a `PORT` variable to your environment:

```env
PORT=your_desired_port
```

### Environment Variables for Authentication

To use a default username and password for every API request (instead of specifying them each time), add the following to your environment variables:

```env
USER_NAME=your_username
PASSWORD=your_password
```

To use a default `semesterSubId` for every API request (instead of specifying each time), add the following to your environment variables:

> **Note:** `semesterSubId` is the first 10 characters of your class ID. Same for all courses in a semester (e.g., `AP20xxxxx`).

```env
SEM=your_semester_sub_id
```
