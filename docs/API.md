# API Documentation

Base URL: `http://localhost:3000` (development)

All API endpoints support CORS and return JSON responses.

---

## Health Check

Check if the application is running.

```
GET /api/health
```

**Response** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-04-17T23:30:00.000Z",
  "version": "0.1.0"
}
```

---

## Configuration

Get client-side configuration (demo mode status, etc).

```
GET /api/config
```

**Response** `200 OK`

```json
{
  "demoMode": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `demoMode` | boolean | `true` if using mock AI responses (no OpenAI key configured) |

---

## Tasks

### List all tasks

```
GET /api/tasks
```

**Response** `200 OK`

```json
[
  {
    "id": "abc123",
    "userId": "user1",
    "title": "Research AI frameworks",
    "description": "Find the top 5 AI frameworks for 2026",
    "status": "pending",
    "resultText": null,
    "createdAt": 1713408000000,
    "updatedAt": 1713408000000
  }
]
```

### Create a task

```
POST /api/tasks
```

**Body**

```json
{
  "title": "Research AI frameworks",
  "description": "Find the top 5 AI frameworks for 2026"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Task title (1-200 chars) |
| `description` | string | No | Task details |

**Response** `201 Created`

Returns the created task object.

### Get a task

```
GET /api/tasks/:id
```

**Response** `200 OK`

Returns a single task object.

**Error** `404` — Task not found

### Delete a task

```
DELETE /api/tasks/:id
```

**Response** `200 OK`

```json
{ "message": "Task deleted" }
```

---

## AI Processing

Process a task with AI.

```
POST /api/tasks/:id/process
```

- **maxDuration**: 30 seconds (for OpenAI API call timeout)
- Requires `OPENAI_API_KEY` environment variable (unless in demo mode)
- In demo mode (no API key), returns mock AI responses

**Response** `200 OK`

Returns the updated task with `status: "completed"` and `resultText` populated.

```json
{
  "id": "abc123",
  "status": "completed",
  "resultText": "## Research Results\n\n...",
  ...
}
```

**Error Responses**

| Status | Condition |
|--------|-----------|
| `404` | Task not found |
| `409` | Task already completed |
| `422` | OPENAI_API_KEY not configured (when demo mode is off) |
| `429` | Rate limited (placeholder for MVP) |
| `500` | Internal server error |

---

## Waitlist

Join the TaskDrip waitlist.

```
POST /api/waitlist
```

**Body**

```json
{
  "email": "user@example.com"
}
```

**Response** `201 Created`

```json
{
  "id": "wl_abc123",
  "email": "user@example.com",
  "createdAt": 1713408000000
}
```

**Error Responses**

| Status | Condition |
|--------|-----------|
| `400` | Invalid email or missing field |
| `409` | Email already registered |