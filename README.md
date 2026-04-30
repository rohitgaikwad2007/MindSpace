# MindSpace — MySQL Backend Setup

MindSpace is now backed by a MySQL database served through a Node.js/Express API.  
All frontend functionality remains identical; data is persisted in MySQL instead of `localStorage`.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | ≥ 18    |
| MySQL       | ≥ 8.0   |

---

## 1 — Create the database

Log into MySQL and run the schema script:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `mindspace` database and all required tables.

---

## 2 — Configure environment variables

Copy the example file and fill in your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=mindspace
PORT=3000
```

---

## 3 — Install dependencies

```bash
cd backend
npm install
```

---

## 4 — Start the server

```bash
cd backend
npm start
```

Then open **http://localhost:3000** in your browser.

The server:
- Serves the frontend (`index.html`, `styles.css`, `script.js`) as static files
- Exposes REST endpoints under `/api/`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/moods` | Fetch all mood entries |
| `POST` | `/api/moods` | Save a new mood entry |
| `GET`  | `/api/journals` | Fetch all journal entries |
| `POST` | `/api/journals` | Save a new journal entry |
| `DELETE` | `/api/journals/:id` | Delete a journal entry |
| `GET`  | `/api/profile` | Fetch user profile |
| `PUT`  | `/api/profile` | Update user profile |
| `GET`  | `/api/habits/:year/:month` | Fetch habits for a month |
| `PUT`  | `/api/habits/:year/:month` | Save habits for a month |
| `DELETE` | `/api/data` | Clear all user data |
