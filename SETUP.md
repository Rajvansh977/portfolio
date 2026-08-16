# Portfolio Setup Guide

## Structure
```
portfolio/
├── frontend/    ← Vite + React
├── backend/     ← Node.js + Express + MongoDB + Nodemailer
└── index.html   ← Old single-file version (keep as backup)
```

---

## 1. Backend Setup

### A. MongoDB Atlas
1. Go to https://cloud.mongodb.com and create a free account
2. Create a new cluster (free tier is fine)
3. Go to **Database Access** → Add a user with read/write permissions
4. Go to **Network Access** → Allow access from anywhere (0.0.0.0/0)
5. Go to **Connect** → Drivers → Copy the connection string
6. Replace `<username>` and `<password>` in the string

### B. Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already on
3. Go to https://myaccount.google.com/apppasswords
4. Create a new app password for "Mail"
5. Copy the 16-character password

### C. Fill in .env
Edit `backend/.env`:
```
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/portfolio
EMAIL_USER=rajvanshr95@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   ← your 16-char App Password
EMAIL_TO=rajvanshr95@gmail.com
CLIENT_URL=http://localhost:5173
```

### D. Run backend
```bash
cd backend
npm run dev
```
Server starts at http://localhost:5000

---

## 2. Frontend Setup

```bash
cd frontend
npm run dev
```
App starts at http://localhost:5173

---

## 3. Test Contact Form
1. Open http://localhost:5173
2. Fill the contact form and submit
3. You should receive an email at rajvanshr95@gmail.com
4. The sender gets an auto-reply

---

## 4. Deploy (later)
- **Frontend**: Deploy `frontend/` to Vercel or Netlify
- **Backend**: Deploy `backend/` to Railway or Render
- Update `CLIENT_URL` in backend `.env` to your live frontend URL
- Update `og:url` in `frontend/index.html` to your live URL
