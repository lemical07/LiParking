<h1 style="text-align: center; font-style: italic;">✨LiParking✨</h1>
<p align="center">
  <img src="IMG/lisel.png" alt="Dashboard LiParking" width="60">
</p>
<h2 align="center">Luxury Parking Management System</h2>
Welcome to LiParking! A premium, modern, and responsive web solution designed for the management and control of exclusive vehicle parking. This system combines an aesthetic interface with a robust client-side architecture using standard web technologies.

---

## ⚡Main Features

* **Interactive Dashboard (Premium UI/UX):** Interface designed with a "glassmorphism" style (glass effect) that showcases the elegance and modernity of the system.
* **100% Responsive Design:** Fully adapted for use on desktops, tablets, and mobile devices without losing visibility of dynamic backgrounds.
* **Real-Time Slot Map:** Graphical and interactive view of parking status (Available/Occupied) automatically categorized by vehicle type.
* **Automatic Ticket Generator:** Automatic assignment of unique IDs based on vehicle type, system date, and random values.

* **Automated Rate Calculation:** Exact processing of stay time by rounding hour fractions and applying the corresponding rate by vehicle type.
* **Local Data Persistence:** Use of `LocalStorage` to ensure that vehicle type settings and the current parking status are maintained after reloading the page.
* **Real-Time Clock and Date:** Exact synchronization with the operating system for precise recording of entries and exits.

---

## 🛠️ Technologies Used

* **HTML5:** Semantic structure for accessible and organized navigation.
* **CSS3:** Advanced styles using variables, Flexbox, CSS Grid, blur filters (`backdrop-filter`), and Media Queries for responsive design.
* **Vanilla JavaScript (ES6+):** Pure programming logic for DOM manipulation, form validation (Regex), calculation algorithms, and data persistence.

---

## 📂 Repository Structure

The project follows a clean, modular, and easy-to-navigate architecture, separating business logic, visual styling, and application views:

```text
LiParking/
│
├── dashboard.html    ---Main control panel, parking slots map, and check-in records
├── history.html      ---Comprehensive log and reports of processed vehicles
├── login.html        ---Secure entry screen for system operators
├── README.md         ---User guide and project documentation (This file)
│
├── asset/            ---Core resources of the system
│   ├── CSS/
│   │   ├── component.css   ---Tailored styles for buttons, inputs, tables, and modal overlays
│   │   ├── layout.css      ---Base application layout, positioning, and background rules
│   │   └── responsive.css  ---Layout adaptations and media queries for tablets and mobile devices
│   │
│   └── JS/
│       ├── history.js   ---Controls sorting, filtering, and rendering the parking log
│       ├── login.js     ---Handles credential validation and basic authentication logic
│       └── main.js      ---Core engine: clock synchronization, slots map, and LocalStorage data flow
│
└── IMG/             ---Visual identity and graphic assets
    ├── lisel.png    ---Official company logo for the transport service
    ├── parking.png  ---Premium background image used for the main workspace
    └── parking2.png ---Secondary visual asset for internal panels