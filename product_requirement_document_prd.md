# Product Requirement Document (PRD)

## Project Overview
**Product Name:** Google Anti-Gravity Quiz App  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Primary Tech Stack:** Firebase (Authentication, Firestore Database), HTML/JS or React Frontend, CSV Ingestion Module.  
**Admin Access:** `naru12193@gmail.com`

---

## 1. Product Objectives & Vision
To build a lightweight, high-reliability live quiz platform where:
1. Questions are managed via a simple server-hosted CSV file.
2. User authentication is strictly constrained to Google domain (`@google.com`) users via Firebase Authentication.
3. Quizzes operate within strict Indian Standard Time (IST) start and end time windows.
4. Live progress is protected against dropouts using browser `localStorage`.
5. Results and leaderboards remain locked until the quiz period officially ends to ensure test integrity.

---

## 2. User Roles & Access Control

| Role | Access Level | Responsibilities / Permissions |
| :--- | :--- | :--- |
| **Admin** | `naru12193@gmail.com` | Access Admin Dashboard, set start/end IST times, trigger CSV question syncs, view top-score admin leaderboard. |
| **User (Participant)** | Authenticated (`*@google.com`) | Login, view live countdown, attempt quiz during active window, store draft responses locally, submit final score to Firebase. |
| **Unauthorized** | Non-`@google.com` | Blocked from logging in or viewing questions. |

---

## 3. Data Specs & Ingestion Pipelines

### 3.1 CSV Structure (`quizQuestion.csv`)
The CSV file hosted on the server follows the schema matching the provided attachment:

| Header Column | Data Type | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `Question_ID` | String / Int | `Q001` | Unique ID for the question |
| `Question_Text` | Text | `What is the gravity acceleration on Earth?` | Question content |
| `Option_A` | Text | `9.8 m/s²` | First choice |
| `Option_B` | Text | `10.5 m/s²` | Second choice |
| `Option_C` | Text | `8.2 m/s²` | Third choice |
| `Option_D` | Text | `12.0 m/s²` | Fourth choice |
| `Correct_Option` | String | `A` | Winning key (`A`, `B`, `C`, or `D`) |
| `Marks` | Number | `1` or `2` | Points awarded for correct answer |

### 3.2 CSV Ingestion Logic
- Admin clicks **"Sync Questions from CSV"** on Admin Panel.
- Server reads `quizQuestion.csv` and parses rows into Firestore collection `/questions`.
- Only questions with valid columns are published to active quiz state.

---

## 4. Key Features & Workflows

### 4.1 Authentication Workflow
- **Provider:** Firebase Auth (Google OAuth 2.0).
- **Domain Restriction:** Code validates `user.email.endsWith('@google.com')`. Non-google.com emails are immediately logged out with an alert message: *"Access restricted to @google.com domain accounts."*

### 4.2 Time Window & Quiz Availability (IST)
- **Timezone:** Standardized strictly to `Asia/Kolkata` (IST).
- **States:**
  1. **Pre-Quiz State:** Current IST < Start IST. Show countdown clock & "Quiz has not started yet".
  2. **Active Quiz State:** Start IST $\le$ Current IST $\le$ End IST. Enable quiz screen.
  3. **Post-Quiz State:** Current IST > End IST. Disable quiz submissions. Display results & leaderboard.

### 4.3 Quiz Execution & Local Storage
- **State Preservation:** Every option selected by the user is immediately auto-saved to `localStorage` key `quiz_draft_state_<userId>`.
- **Page Refresh/Disconnect Recovery:** On reload, the app restores selected answers from `localStorage`.
- **Submission:**
  - Upon user click on **"Submit Quiz"** or when End Time (IST) is reached, score is calculated.
  - Final score payload is written directly to Firestore `/submissions/{userId}`.
  - Local state is cleared or marked as `submitted: true`.

### 4.4 Leaderboard & Results Logic
- **Lock Rules:** Scores, answer reviews, and rank boards are **hidden** until Current IST exceeds End IST.
- **Participant View (Post-Quiz):** Total score earned, rank, correct answers breakdown.
- **Admin Leaderboard:** Admin can view top scores sorted by:
  1. Highest Total Score.
  2. Earliest Submission Timestamp (Tie-breaker).

---

## 5. Technical Architecture & Database Schema

### 5.1 Firestore Data Schema

```json
// Collection: /config/quiz_settings
{
  "startTime": "2026-10-30T10:00:00+05:30",
  "endTime": "2026-10-30T11:00:00+05:30",
  "quizTitle": "Google Anti-gravity Challenge",
  "lastSyncedAt": "2026-10-29T17:30:00+05:30"
}

// Collection: /questions/{questionId}
{
  "questionId": "Q001",
  "questionText": "What is gravity?",
  "options": {
    "A": "9.8 m/s²",
    "B": "10 m/s²",
    "C": "5 m/s²",
    "D": "0 m/s²"
  },
  "correctOption": "A",
  "marks": 1
}

// Collection: /submissions/{userId}
{
  "userId": "firebase_uid_123",
  "userEmail": "example@google.com",
  "displayName": "Jane Doe",
  "answers": {
    "Q001": "A",
    "Q002": "C"
  },
  "totalScore": 15,
  "submittedAt": "2026-10-30T10:45:12+05:30"
}
```

---

## 6. Admin Panel UI & Capabilities

Accessible only if `user.email === 'naru12193@gmail.com'`.

1. **Time Management Controls:**
   - Date-Time Pickers for **Quiz Start Time (IST)** and **Quiz End Time (IST)**.
   - Button: `Save Time Settings`.
2. **CSV Sync Controls:**
   - Button: `Sync Questions from Server CSV`.
   - Sync Status Log (e.g., *"Successfully loaded 20 questions from quizQuestion.csv"*).
3. **Admin Leaderboard:**
   - Tabulated view listing: `Rank`, `User Email`, `Score`, `Submission Time`.
   - Export Leaderboard to CSV button.

---

## 7. Non-Functional Requirements (NFRs)

- **Security:** Firestore security rules enforce that user submissions can only be created during the active window, and results can only be read after `endTime`.
- **Reliability:** `localStorage` protects against accidental tab closures or intermittent internet loss.
- **Time Integrity:** Time calculations must fetch server timestamp or trusted network time (NTP) to prevent local machine clock tampering by users.

---

## 8. Success Metrics
- 0% loss of user attempt data due to tab closure/reloads.
- 100% enforcement of Google domain authentication restrictions.
- Zero premature leakage of answers/leaderboards prior to end time IST.