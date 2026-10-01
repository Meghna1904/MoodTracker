# Mood Tracker — Project Analysis & Next Steps

## What Was Built

| Layer | Status | Details |
|---|---|---|
| **Backend** | ✅ Structured | Spring Boot 3.2, MongoDB, JWT auth, WebSocket, Email, Firebase Push |
| **Frontend** | ⚠️ Scaffolded | React 18 + TypeScript + MUI. All pages exist but use **hardcoded/mock data** — no real API calls |
| **ML Layer** | ✅ Implemented | Smile RandomForest for mood prediction, Stanford CoreNLP for NLP, Weka included |
| **Analytics** | ✅ Implemented | Full Pearson correlation, mood-productivity analysis, peak-hour detection |
| **Auth** | ⚠️ Partial | JWT endpoints exist in backend; frontend `AuthService.ts` and `Login.tsx` exist but API wiring is unclear |
| **Database** | ✅ Setup scripts | MongoDB setup `.bat` files and `mongodb_setup.js` present |
| **Deployment** | ❌ Missing | No Docker, no CI/CD, no env file strategy |

---

## Critical Gaps (High Priority)

### 1. 🔴 Frontend is NOT connected to the backend

Every single component uses **hardcoded mock data**:

- `Dashboard.tsx` — current mood and tasks are hardcoded arrays
- `MoodTracking.tsx` — `handleSubmit` has a `// TODO: Implement mood submission` comment
- `TaskManagement.tsx` — likely the same
- `AuthService.ts` exists but it's unclear if it's wired up

**What to do:**
- Create an `api.ts` (Axios instance) that points to `http://localhost:8081`
- Wire `MoodTracking.tsx` → `POST /api/moods`
- Wire `Dashboard.tsx` to fetch real mood + task data
- Wire `TaskManagement.tsx` → `GET/POST/PUT/DELETE /api/tasks`

---

### 2. 🔴 Several API services exist in backend but have **no corresponding controller**

The following services are written with **no REST controller exposing them**:
- `MoodPredictionService` — predictions running but no `/api/predict` endpoint
- `AnalyticsService` — `AnalyticsController` exists but likely doesn't cover all endpoints
- `NotificationService`, `PushNotificationService`, `WeatherService` — no public API surface

**What to do:**
- Add `PredictionController` with `GET /api/predict/{userId}`
- Extend `AnalyticsController` to expose mood trends + task analytics

---

### 3. 🔴 Hardcoded secrets in `application.properties`

```properties
jwt.secret=moodtracker_super_secret_key...  # exposed!
spring.mail.username=your.email@gmail.com   # placeholder
weather.api.key=your_weather_api_key        # placeholder
firebase.credentials.path=...               # path to file not included
```

**What to do:**
- Create `.env` / `application-local.properties` with real keys
- Add `.env` and `application-local.properties` to `.gitignore`
- Use `${ENV_VAR}` syntax in `application.properties`

---

## Medium Priority

### 4. 🟡 Analytics UI is missing entirely

The backend `AnalyticsService` computes:
- Mood distribution, dominant mood, mood stability
- Mood–productivity Pearson correlation
- Peak productivity hours
- Task difficulty breakdown

But there is **no analytics/charts page** on the frontend.

**What to do:**
- Add an `Analytics.tsx` page with charts (use `recharts` or `@mui/x-charts`)
- Show mood trend over time (line chart)
- Show task completion rate (bar chart)
- Show mood distribution (pie chart)
- Add route `/analytics` to `App.tsx`

---

### 5. 🟡 ML Prediction is not surfaced to the user

`MoodPredictionService` trains a RandomForest and predicts mood — but the user never sees it.

**What to do:**
- Add a "Predicted Mood" widget to `Dashboard.tsx`
- Call the prediction endpoint and display confidence + contributing factors

---

### 6. 🟡 Settings and Profile pages likely non-functional

`Settings.tsx` (8KB) and `UserProfile.tsx` (11KB) exist but probably don't call real APIs.

**What to do:**
- Wire `Settings.tsx` → `UserPreferencesController`
- Wire `UserProfile.tsx` → `UserProfileController`

---

### 7. 🟡 `pom.xml` has a duplicate MongoDB dependency

Line 141–144 is a **duplicate** of the MongoDB starter already declared at line 32–34. This won't break the build but is sloppy.

---

## Lower Priority (Polish / Production-Readiness)

### 8. 🟢 No Docker setup

For portfolio quality and local demo-ability, add:
- `Dockerfile` for the Spring Boot backend
- `docker-compose.yml` spinning up MongoDB + backend + frontend

### 9. 🟢 No README instructions

The frontend has a stock CRA `README.md`. There are no instructions on how to:
- Run MongoDB locally
- Configure API keys
- Start backend + frontend

### 10. 🟢 No unit tests written

Backend has `spring-boot-starter-test` but no test files visible. Frontend has `App.test.tsx` which is the CRA default.

---

## Recommended Order of Work

```
Phase 1 — Make it work (1–2 days)
  ├── Fix secrets/env vars in application.properties
  ├── Create Axios api.ts on frontend
  ├── Wire MoodTracking.tsx → POST /api/moods
  ├── Wire Dashboard.tsx → real mood + task data
  └── Wire TaskManagement.tsx → CRUD tasks

Phase 2 — Complete the feature set (2–3 days)
  ├── Add PredictionController exposing /api/predict
  ├── Show predicted mood widget on Dashboard
  ├── Create Analytics.tsx with recharts/MUI charts
  └── Wire Settings + UserProfile to real APIs

Phase 3 — Production quality (1–2 days)
  ├── Add Docker + docker-compose
  ├── Write README with setup instructions
  ├── Add at least basic unit tests for services
  └── Fix duplicate MongoDB dependency in pom.xml
```

> [!IMPORTANT]
> **Start with Phase 1.** The app is currently a beautiful shell with no data flow. The backend services are impressively built — the biggest gap is the frontend–backend connection.
