# 💰 FinFlow — บัญชีรายรับรายจ่ายส่วนตัว

ระบบจัดการรายรับรายจ่ายส่วนตัว สร้างด้วย React + Vite + Supabase  
Deploy บน Vercel ได้ทันที ข้อมูลแยกตาม user อย่างปลอดภัย

## ✨ ฟีเจอร์
- 🔐 สมัครสมาชิก / เข้าสู่ระบบ ด้วย Email + Password
- ➕ เพิ่ม / แก้ไข / ลบ รายการรายรับ-รายจ่าย
- 📂 หมวดหมู่ (เงินเดือน, อาหาร, เดินทาง, ฯลฯ)
- 📅 กรองตามเดือน + ประเภท
- 📊 กราฟแสดงรายรับรายจ่าย 6 เดือนย้อนหลัง
- 🔒 ข้อมูลแยกต่อ user ด้วย Supabase Row Level Security

---

## 🛠️ วิธีติดตั้ง

### 1. สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com) → New Project
2. ไปที่ **SQL Editor** → วาง SQL จากไฟล์ `supabase-schema.sql` แล้ว Run
3. ไปที่ **Project Settings → API** คัดลอก:
   - `Project URL`
   - `anon public` key

### 2. ตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` → `.env`:

```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:5173

---

## 🚀 Deploy บน Vercel

### วิธีที่ 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### วิธีที่ 2: Vercel Dashboard
1. Push โค้ดขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → Import Project
3. เชื่อม GitHub repo
4. ตั้งค่า **Environment Variables** ใน Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

---

## 📁 โครงสร้างไฟล์

```
finance-tracker/
├── src/
│   ├── lib/
│   │   └── supabase.js          # Supabase client
│   ├── hooks/
│   │   ├── useAuth.js           # Authentication hook
│   │   └── useTransactions.js   # CRUD transactions hook
│   ├── pages/
│   │   ├── AuthPage.jsx         # หน้า Login/Register
│   │   └── Dashboard.jsx        # หน้าหลัก
│   ├── components/
│   │   └── TransactionModal.jsx # Modal เพิ่ม/แก้ไขรายการ
│   ├── App.jsx                  # Routing
│   ├── main.jsx                 # Entry point
│   └── styles.css               # Global styles
├── public/
│   └── favicon.svg
├── supabase-schema.sql          # SQL สำหรับ setup database
├── .env.example
├── vercel.json
├── vite.config.js
└── package.json
```

## 🗄️ Supabase Schema

```sql
transactions (
  id         UUID PRIMARY KEY
  user_id    UUID → auth.users
  type       'income' | 'expense'
  amount     NUMERIC
  category   TEXT
  note       TEXT
  date       DATE
  created_at TIMESTAMPTZ
)
```

Row Level Security เปิดอยู่ — user เห็นแค่ข้อมูลของตัวเอง
