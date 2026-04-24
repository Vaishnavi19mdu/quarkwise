# ⚛️ Quarkwise — Smart Household Energy Benchmarking

Quarkwise is an intelligent energy analysis platform that helps households understand, compare, and reduce their electricity usage through data-driven insights, simulation, and AI assistance.

> Turn your energy bill into actionable wisdom.

---

## 🚀 Features

### 📊 Energy Insights
- Energy Score (0–100 efficiency rating)
- Consumption Breakdown (Cooling, Appliances, Lighting)
- Explain My Bill (clear reasoning for high usage)

### 🏘️ Community Benchmarking
- Compare with similar households using pincode
- Efficiency ranking (e.g., Top 45%)
- Improvement suggestions

### ⚡ Predictive Simulator
- Adjust AC usage and appliance efficiency
- Instantly view:
  - Predicted usage (kWh)
  - Monthly bill
  - Savings / extra cost
  - Score change

### 🌦️ Seasonal Forecast
- Predict usage spikes (e.g., summer cooling demand)
- Monthly trend insights
- Future cost estimation

### 🤖 AI + Voice Assistant
- Ask:
  - "Why is my bill high?"
  - "How can I save more?"
- Get real-time, personalized insights

### 🎯 Gamified Goals
- Set savings targets
- Track progress
- Improve efficiency ranking

### 📄 Reports
- Downloadable PDF summary of usage, insights, and tips

---

## 🧠 How It Works

1. User inputs:
   - Monthly usage / bill
   - Pincode
   - Appliance habits

2. System processes:
   - Normalizes usage data
   - Compares with similar households
   - Calculates efficiency score
   - Generates insights & recommendations

3. Output:
   - Dashboard with analytics
   - Predictions & savings simulation
   - Personalized tips

---

## 🏗️ Tech Stack

### Frontend
- Next.js
- React
- Material UI

### Backend
- PocketBase (database, auth, API)

### Data & Visualization
- Recharts (charts)
- Custom simulation logic (JavaScript)

### AI / Logic
- Rule-based recommendation engine
- Context-aware assistant responses

---

## 📂 Project Structure

```
/src
  /components
    /dashboard
    /simulator
    /insights
    /ui
  /pages
    dashboard
    simulator
    insights
    reports
    settings
  /lib
    logic
    utils
```

---

## ⚙️ Core Logic Highlights

- Dynamic Energy Score calculation (based on usage vs baseline)
- Real-time simulator updates (usage → bill → savings → score)
- Context-aware recommendations (based on dominant usage)
- Percentile-based community comparison

---

## 🔐 Backend (PocketBase)

- Stores:
  - User data
  - Household configurations
  - Usage inputs
- Handles:
  - Authentication
  - Data persistence
  - API endpoints for dashboard

---

## 🌍 Impact

- Helps users reduce electricity bills
- Encourages energy-efficient habits
- Enables data-driven household decisions

---

## 🔮 Future Scope

- Smart meter integration
- Real-time usage tracking
- Utility company partnerships
- Mobile app support

---

## 👥 Team

- Your Name(s)

---

## 📌 License

This project was built for a hackathon and is for demonstration purposes.