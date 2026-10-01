# AGENTS.md

## Project Structure

Two independent apps in a single repo (not a monorepo with shared tooling):

- **Backend** (`src/`): Spring Boot 3.2.0, Java 17, MongoDB. Entry: `com.moodtracker.MoodTrackerApplication`. Runs on port **8081**.
- **Frontend** (`frontend/`): React 18, TypeScript, Create React App. Runs on port **3000**. Connects to backend at `http://localhost:8081/api` (hardcoded in `frontend/src/services/AxiosInterceptor.ts`).
- **Database**: MongoDB on port **27017** (via Docker or local install).

## Prerequisites

- Java 17+
- Node.js (for frontend)
- MongoDB running on localhost:27017 (use `docker-compose up -d` or local install)
- Maven wrapper included (`mvnw.cmd` on Windows)

## Commands

### Backend

```bash
# Build
./mvnw.cmd clean install

# Run (from repo root)
./mvnw.cmd spring-boot:run

# Run tests (no test files currently exist in src/test/)
./mvnw.cmd test
```

### Frontend

```bash
cd frontend
npm install
npm start      # dev server on :3000
npm run build  # production build
npm test       # Jest
```

## Key Architecture Notes

- JWT auth: tokens stored client-side, sent via `Authorization: Bearer` header. Default secret is `moodtracker_dev_secret_change_me` (override with `JWT_SECRET` env var).
- Public endpoints: `/api/users/register`, `/api/auth/login`, `/error`. All others require auth.
- CORS: frontend origin `http://localhost:3000` is allowlisted in `SecurityConfig.java`.
- WebSocket endpoint: `/ws` with prefix `/topic` for real-time features.
- Email templates live in `src/main/resources/templates/` (Thymeleaf).
- ML dependencies included (Weka, Smile, Stanford CoreNLP) — used by `MoodPredictionService` and `TaskSuggestionService`.
- Firebase Admin SDK integrated for push notifications (`PushNotificationService`).

## Gotchas

- **No tests exist yet** in `src/test/`. Don't assume test infrastructure is set up.
- Backend port is **8081**, not the Spring Boot default 8080.
- Frontend API base URL is hardcoded, not configurable via env var.
- MongoDB `auto-index-creation` is enabled — schema changes may affect existing data.
- `@EnableScheduling` is active — scheduled tasks run on cron expressions in `application.properties`.
- The repo includes a bundled Maven distribution (`apache-maven-3.9.9/`) and MongoDB MSI installer — ignore these in code reviews.
