# Mini CRM Platform

A simple customer relationship management system for managing customers and campaigns.

## ✨ Features

- **👥 Customer Management** - Add, edit, view customers
- **📧 Campaign Creation** - Create and send campaigns
- **🤖 AI Features** - Smart suggestions and natural language queries
- **🔐 Simple Authentication** - Secure login system
- **📱 Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React, Tailwind CSS
- **Database:** MongoDB
- **Authentication:** JWT tokens
- **AI:** OpenAI integration with fallbacks

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/your-username/mini-crm-platform.git
cd mini-crm-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
node seedData.js
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Login: `admin@minicrm.com` / `admin123`

### Environment Variables

Create `backend/.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mini-crm
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

## 🌐 Live Deployment

### Deploy to Railway + Vercel (Free)

1. **Backend (Railway)**
   - Connect GitHub repository
   - Add MongoDB database
   - Set environment variables
   - Auto-deploy on push

2. **Frontend (Vercel)**
   - Import GitHub repository
   - Configure build settings
   - Set API URL environment variable
   - Auto-deploy on push

### Production Environment Variables

**Railway Backend:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mini-crm
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-app.vercel.app
```

**Vercel Frontend:**
```env
VITE_API_URL=https://your-app.railway.app
```

## 📁 Project Structure

```
mini-crm-platform/
├── backend/              # Node.js API
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── server.js        # Main server
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── public/          # Static assets
├── railway.json         # Railway deployment config
├── vercel.json          # Vercel deployment config
└── README.md
```

## 📚 API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `POST /api/ai/message-suggestions` - AI message generation

## 🆘 Troubleshooting

### Common Issues

**Login not working:**
- Ensure MongoDB is running
- Run `node seedData.js` to create admin user
- Check JWT_SECRET is set

**Build failures:**
- Verify Node.js version (16+)
- Check all environment variables
- Clear node_modules and reinstall

**API connection issues:**
- Check CORS configuration
- Verify API URL in frontend
- Ensure backend is running

## 📄 License

ISC License

---

**Built with ❤️ for modern customer relationship management**
