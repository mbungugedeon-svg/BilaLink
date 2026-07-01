# 🌱 BilaLink

### Connecting Farmers. Empowering Markets.

BilaLink is a mobile-first agricultural marketplace designed to connect farmers directly with buyers across the Democratic Republic of the Congo (DRC). It helps reduce dependency on intermediaries by providing a digital platform where producers can publish their products, buyers can discover offers, negotiate, reserve products, and communicate directly.

> **Project Status:** MVP Prototype (Frontend Demo)

---

## 🚀 Vision

Agricultural trade in the DRC remains highly fragmented, with farmers relying on intermediaries and informal networks to sell their products.

BilaLink aims to digitize this ecosystem by providing a simple, accessible, and scalable marketplace that enables transparent, direct, and efficient trade between farmers and buyers.

Our long-term vision is to become the digital infrastructure powering agricultural commerce across the DRC and, eventually, other African markets.

---

## ✨ Features

### 👨‍🌾 For Farmers

- Publish agricultural products in minutes
- Manage listings from a dedicated dashboard
- Receive reservations from buyers
- Chat directly with buyers
- Increase visibility beyond local markets

### 🛒 For Buyers

- Browse products using advanced filters
- Search by province, city, product, price, and availability
- Interactive map (Leaflet + OpenStreetMap)
- Reserve products directly
- Integrated messaging system
- One-click WhatsApp contact
- Publish purchase requests when products are unavailable

### 🌍 Marketplace

- Live-style activity feed
- Market price tracking
- Real-time simulated notifications
- English / French interface
- Mobile-first user experience

---

## 📸 Screenshots

> Screenshots will be added soon.

- Home Page
- Marketplace
- Product Details
- Farmer Dashboard
- Buyer Dashboard
- Market Prices

---

## 🛠 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- Leaflet.js
- OpenStreetMap
- LocalStorage
- Responsive Design

---

## 🏗 Architecture

```
BilaLink/
├── index.html
├── css/
│   ├── style.css
│   ├── animation.css
│   └── responsive.css
└── js/
    ├── app.js
    ├── i18n.js
    ├── components/
    ├── pages/
    ├── services/
    ├── data/
    └── utils/
```

The project follows a modular architecture built with ES Modules.

Main modules include:

- UI Components
- Pages
- Business Logic (Marketplace, Authentication, Feed)
- Localization (English/French)
- Data Layer
- Utility Functions

---

## ⚙ Technical Highlights

- Pure Vanilla JavaScript (no framework)
- Client-side routing
- Interactive maps using Leaflet
- LocalStorage-based persistence
- Responsive design
- Modular ES Module architecture
- Simulated marketplace activity
- No backend dependency

---

## 🚀 Running the Project

Because the project uses ES Modules, it must be served through an HTTP server.

### Python

```bash
cd BilaLink
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

Or use the **Live Server** extension in Visual Studio Code.

---

## 📍 Demo Coverage

### Provinces

- Kinshasa
- Kongo Central
- Kwilu
- Kwango
- Tshopo
- Haut-Katanga
- Kasaï
- North Kivu

### Agricultural Products

- Cassava
- Maize
- Rice
- Sweet Potato
- Plantain
- Tomatoes
- Beans
- Peanuts
- Palm Oil
- Fish
- Fruits
- Vegetables

---

## 🚧 Current Limitations

This repository contains a **frontend prototype** intended for demonstration purposes.

Current limitations include:

- No backend server
- No shared database
- LocalStorage persistence only
- Simulated notifications
- Simulated marketplace feed
- No online payments
- No real image uploads

These limitations are expected for an MVP prototype.

---

## 🛣 Roadmap

### ✅ Completed

- Marketplace MVP
- Product publishing
- Buyer requests
- Interactive map
- Authentication
- Dashboards
- Notifications
- Market price tracking
- English / French localization

### 🚧 Next Steps

- Backend API
- PostgreSQL database
- Secure authentication
- File uploads
- Online payments
- Logistics integration
- Mobile application
- AI-powered price prediction

---

## 📈 Startup Status

- ✅ Customer interviews completed
- ✅ Problem validated
- ✅ MVP prototype completed
- 🚧 Pilot deployment preparation
- 🚧 Backend development
- 🚧 Seeking strategic partners and early adopters

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

Feel free to open an Issue or submit a Pull Request.

---

## 📬 Contact

**Bubu Mbungu Gedeon**

Founder & CEO — BilaLink

📧 contact@bilalink.com

🌐 https://www.bilalink.com

🔗 https://www.linkedin.com/in/bilalink

---

## 📄 License

This project is currently released for demonstration purposes.

**All Rights Reserved © BilaLink**