# 🛡️ Contract Sentinel

> AI-Powered Procurement Intelligence Platform for Construction Project Monitoring

Contract Sentinel is a full-stack AI application that helps project managers and procurement teams detect inconsistencies between construction contracts, contractor invoices, and project progress.

The platform analyzes uploaded documents, highlights procurement risks, generates actionable recommendations, and exports professional AI reports.

---

# ✨ Features

- 📄 Upload Construction Contract (PDF)
- 🧾 Upload Contractor Invoice
- 📷 Upload Site Progress Photo
- 🤖 AI Processing Workflow
- 📊 Procurement Intelligence Dashboard
- ⚠ Risk Assessment
- 📝 AI Procurement Recommendation
- 📥 Download AI Report (PDF)
- ⚡ FastAPI Backend
- 🎨 Modern React + Tailwind UI

---

# 🖥️ Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- jsPDF
- Lucide Icons

## Backend

- FastAPI
- Python
- pdfplumber
- Google Gemini API (Architecture Ready)

---

# 🏗️ Architecture

```text
                React Dashboard
                       │
                 Axios API Calls
                       │
                  FastAPI Backend
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
 PDF Extraction   Image Upload    AI Service
        │
        ▼
 Structured Procurement Analysis
        │
        ▼
 Dashboard + AI Report
```

---

# 📸 Application Workflow

1. Upload Contract PDF
2. Upload Invoice
3. Upload Site Photo
4. AI Processing
5. Procurement Dashboard
6. AI Recommendation
7. Download Report

---

# 📸 Screenshots

## Home

![Home](docs/screenshots/home.png)

---

## Upload Documents

![Upload](docs/screenshots/upload.png)

---

## AI Processing

![Processing](docs/screenshots/processing.png)

---

## Procurement Dashboard

![Dashboard](docs/screenshots/dashboard.png)

---

## AI Procurement Recommendation

![Recommendation](docs/screenshots/recommendation.png)

---

## Generated AI Report

![PDF Report](docs/screenshots/pdf_report.png)

# 🚀 Installation

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app:app --reload
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📁 Project Structure

```text
ContractSentinel
│
├── backend
│   ├── services
│   ├── uploads
│   ├── app.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── pages
│   │   └── services
│   │
│   └── package.json
│
├── docs
│
└── README.md
```

---

# 🔮 Future Improvements

- Live Gemini Multimodal Analysis
- OCR for Scanned Documents
- Contractor Risk History
- GIS Integration
- Drone Image Analysis
- ERP Integration
- Multi-user Authentication

---

# 👨‍💻 Author

**Harsh Kumar**

M.Tech, IIT Roorkee

---

# 📄 License

MIT License