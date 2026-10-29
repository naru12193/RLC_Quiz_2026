# Google Anti-Gravity Quiz App (RLC 2026)

A lightweight, high-reliability live quiz platform built strictly per the [Product Requirement Document](product_requirement_document_prd.md).

---

## 🚀 Key Features

1. **Authentication & Access Control:**
   - **Admin Access:** Designated strictly to `naru12193@gmail.com`.
   - **Participants:** Restricted strictly to `@gmail.com` accounts via Firebase Authentication (Google OAuth 2.0).
   - **Unauthorized Users:** Non-`@gmail.com` accounts are immediately logged out with an alert message.
   - **Test Mode Toggle:** Admin can enable dev/testing mode in the Admin Console to test participant attempts with non-`@gmail.com` accounts before the live event.

2. **Strict Indian Standard Time (IST) Availability:**
   - Standardized strictly to `Asia/Kolkata` (UTC+05:30).
   - Clock skew correction with server/network time offset to prevent local client clock tampering.
   - **Pre-Quiz State (Current IST < Start IST):** Shows live countdown clock, rules, and waiting screen.
   - **Active Quiz State (Start IST ≤ Current IST ≤ End IST):** Interactive question card, question navigator palette, auto-save status, remaining time clock, and submit button.
   - **Post-Quiz State (Current IST > End IST):** Submissions locked; results, score breakdown, and global leaderboard unlocked.

3. **Resilience & `localStorage` Auto-Save:**
   - Every option selected is immediately saved to browser `localStorage` key `quiz_draft_state_<userId>`.
   - Survives accidental tab closures, page reloads, and temporary network dropouts.
   - Auto-submits answers if the participant is still taking the quiz when the IST End Time is reached.

4. **CSV Question Ingestion Module:**
   - **Default Server Fetch:** The app automatically fetches `/quizQuestion.csv` hosted in the `public/` directory when the Admin clicks **"Sync Questions from Server CSV"**.
   - **Schema Compatibility:** Seamlessly parses both the provided `quizQuestion.csv` schema (`sno,question,Option-A,Option-B,Option-C,Option-D,Answer`) and the PRD schema (`Question_ID,Question_Text,Option_A,Option_B,Option_C,Option_D,Correct_Option,Marks`).
   - Normalizes answers, sets marks, and publishes questions directly into Firestore collection `/questions`.

5. **Leaderboard & Ranking Logic:**
   - Locked until End Time IST (unless viewed by Admin).
   - **Primary Rank:** Highest Total Score.
   - **Tie-Breaker:** Earliest Submission Timestamp (IST).
   - **Export:** Admin can export the full leaderboard table to CSV (`google_quiz_leaderboard.csv`) with a single click.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons, Canvas Confetti
- **CSV Ingestion:** PapaParse
- **Backend / Database:** Firebase Authentication (Google OAuth), Cloud Firestore
- **Security:** Strict Firestore security rules in `firestore.rules`

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### 3. Build for Production
```bash
npm run build
```

---

## 🔥 Firebase Console Setup Checklist

Ensure the following are configured in your [Firebase Console](https://console.firebase.google.com/project/rlcquiz):

1. **Authentication:**
   - Go to **Build > Authentication > Sign-in method**.
   - Enable **Google** sign-in provider.
   - Add your host domain (e.g., `localhost`) under **Settings > Authorized domains** (enabled by default).

2. **Firestore Database:**
   - Go to **Build > Firestore Database**.
   - Create a database in your preferred region.
   - Copy the contents of `firestore.rules` into the **Rules** tab and click **Publish**.

---

## 📁 Project Structure

```
├── public/
│   └── quizQuestion.csv           # Default server-hosted CSV questions
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Top bar with live IST clock & user status
│   │   ├── PreQuizView.jsx        # Countdown timer & instructions (< Start IST)
│   │   ├── ActiveQuizView.jsx     # Live quiz interface (Start IST ≤ now ≤ End IST)
│   │   ├── PostQuizView.jsx       # Results, answer key & leaderboard (> End IST)
│   │   ├── AdminDashboard.jsx     # Time pickers, CSV sync & admin leaderboard
│   │   └── UnauthorizedModal.jsx  # Domain restriction alert modal
│   ├── context/
│   │   ├── AuthContext.jsx        # Google Auth & @gmail.com enforcement
│   │   └── QuizContext.jsx        # Firestore listeners, draft saving & timer
│   ├── utils/
│   │   ├── timeUtils.js           # Asia/Kolkata (IST) time calculations
│   │   └── csvParser.js           # PapaParse ingestion & CSV export
│   ├── firebase.js                # Firebase app, auth, and db initialization
│   ├── App.jsx                    # Root view routing
│   ├── main.jsx                   # React root entry
│   └── index.css                  # Tailwind styles & custom animations
├── firestore.rules                # Production Firestore security rules
├── package.json
└── vite.config.js
```
