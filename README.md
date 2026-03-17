# SecureMail 🔒

An AI-powered secure email client with phishing detection.

## Team
| Member   | Role                        |
|----------|-----------------------------|
| Harshini | Backend Lead (Node/Express/PostgreSQL) |
| Geetha   | ML + Risk Scoring Engine    |
| Likitha  | Frontend (React)            |
| Monika   | Cybersecurity APIs          |
| Varsha   | Testing + Deployment        |

## Tech Stack
React · Node.js · Express · Sequelize · PostgreSQL (Neon) · Python ML · VirusTotal · MXToolbox · Railway · Vercel

## Local Setup

### 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/SecureMail.git
cd SecureMail

### 2. Backend
cd backend
npm install
cp ../.env.example .env
# Fill in your values in .env
npm run dev

### 3. ML Service
cd ml_service
pip install -r requirements.txt
python app.py

### 4. Frontend
cd frontend
npm install
npm run dev

## Environment Variables
| Variable            | Description                        |
|---------------------|------------------------------------|
| DATABASE_URL        | Neon PostgreSQL connection string  |
| JWT_SECRET          | Secret key for JWT signing         |
| VIRUSTOTAL_API_KEY  | VirusTotal API key                 |
| MXTOOLBOX_API_KEY   | MXToolbox API key                  |
| ML_SERVICE_URL      | URL of the Python ML service       |
| PORT                | Backend port (default 5000)        |

## Demo Credentials
*(Add after seed script is run)*
- Email: demo@securemail.com
- Password: Demo@1234

## Live Demo
*(Add after deployment)*
