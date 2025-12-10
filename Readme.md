# ☕ Gwangju Café Website

### Final Project — IT3101 / IT-314

> A modern, user-friendly online ordering platform for Gwangju Café - streamlining the ordering experience for customers and operations for staff.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen?style=for-the-badge&logo=vercel)](https://gwangju-cafe.vercel.app/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🌟 Overview

The Gwangju Café Website is a web-based application developed as the **Final Project for IT3101 (IT-314)**. It features an interactive café menu with categorized product pages, comprehensive user account management, and a complete online ordering system. The site is designed to be visually appealing, easy to navigate, and user-friendly—providing a realistic café-style browsing experience while replacing traditional ordering methods (social media messaging, text messages) with a standardized, efficient platform.

Built with modern web technologies and Firebase backend, it provides seamless ordering experiences for customers and powerful inventory management tools for café owners.

**🔗 Live Website:** [https://gwangju-cafe.vercel.app/](https://gwangju-cafe.vercel.app/)

---

## 📑 Table of Contents
- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
  - [👤 Customer Portal](#-customer-portal)
  - [🔐 Admin Portal](#-admin-portal)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Installation & Setup](#-installation--setup)
  - [Prerequisites](#prerequisites)
  - [Method 1: Download ZIP](#method-1-download-zip-recommended-for-quick-setup)
  - [Method 2: Clone Repository](#method-2-clone-repository-for-developers)
  - [Method 3: Live Deployment](#method-3-use-live-deployment)
  - [Local Development Setup](#local-development-setup-optional)
- [📂 Project Structure](#-project-structure)
- [📁 Detailed File Structure](#-detailed-file-structure)
- [👥 User Roles](#-user-roles)
- [🎨 Key Features Breakdown](#-key-features-breakdown)
- [🔄 Workflow](#-workflow)
- [📊 Database Schema](#-database-schema)
- [🐛 Known Issues & Limitations](#-known-issues--limitations)
- [🚧 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [👥 Contributors](#-contributors)
- [📝 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Support](#-support)
- [🌐 Links](#-links)

## ✨ Key Features

### 👤 Customer Portal

#### 1. **User Authentication**
- Secure signup and login system
- Password encryption and validation
- Email verification
- Profile management with account creation date

#### 2. **Menu System**
- Browse café menu by categories:
  - Coffee (Hot & Iced)
  - Non-Coffee (Lattes & Fruit Tea)
  - Secret Menu (Soda & Fusion Series)
  - Pastries (Cinnamon Rolls & Cakes)
  - Takoyaki (Original & Spicy)
  - Ramen (Chicken & Beef)
- View item details, prices, and available sizes
- Real-time stock availability

#### 3. **Cart System**
- Add items to cart with quantity selection (1-15)
- View cart contents with subtotals
- Remove individual items or clear entire cart
- Automatic price calculations
- Stock validation before checkout

#### 4. **Checkout System**
- Review order summary
- Input delivery address with barangay dropdown
- Order confirmation
- Shipping fee calculation

#### 5. **Order Management**
- **To Receive:** Track pending orders
- **Order History:** View past orders with ratings
- Confirm delivery
- Rate delivered items
- View order details and timestamps

### 🔐 Admin Portal

#### 1. **Admin Authentication**
- Secure admin login
- Role-based access control
- Auto-created admin account

#### 2. **Menu Access**
- View complete café menu
- Monitor item availability

#### 3. **Inventory Management**
- Add new inventory items with:
  - Category and subcategory selection
  - Item name, size, and price
  - Stock quantity (1-15)
  - Expiration date tracking
- Update existing items via popup editor
- Delete inventory items
- Real-time stock monitoring
- Color-coded expiration alerts:
  - 🔴 Red: Expired items
  - 🟡 Yellow: Expiring within 7 days
- Generate random inventory for testing
- Bulk operations (clear all inventory)

#### 4. **Analytics Dashboard**
- Sales data visualization
- Inventory tracking
- Order statistics
- Business insights for operations

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantic markup |
| **CSS3** | Styling with responsive design |
| **JavaScript (ES6+)** | Client-side logic and interactions |
| **Firebase Authentication** | User authentication and security |
| **Firebase Firestore** | Real-time NoSQL database |
| **Vercel** | Hosting and deployment |

---

## 🚀 Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Firebase project (optional for local development)
- No additional software required for basic usage

### Method 1: Download ZIP (Recommended for Quick Setup)

1. **Download the project**
   - Visit [GitHub Repository](https://github.com/Azeltdz/Gwangju-Cafe)
   - Click the green **"Code"** button
   - Select **"Download ZIP"**
   - Extract the ZIP file to your desired location

2. **Open the project**
   - Navigate to the extracted folder: `Gwangju-Cafe/`
   - Open `index.html` in your web browser
   - Or explore specific pages in `Resources/Webpage_Files/Section_Pages/`

3. **Start browsing**
   - The website will open directly in your browser
   - No server setup required for basic viewing

### Method 2: Clone Repository (For Developers)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Azeltdz/Gwangju-Cafe.git
   cd Gwangju-Cafe
   ```

2. **Open the project**
   - Navigate to the project root directory
   - Open `index.html` in your web browser
   - Or explore specific pages in `Resources/Webpage_Files/Section_Pages/`

### Method 3: Use Live Deployment

- Simply visit the live site at: [https://gwangju-cafe.vercel.app/](https://gwangju-cafe.vercel.app/)
- No installation needed!

---

### Local Development Setup (Optional)

If you want to modify the project or run it with full Firebase functionality:

1. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Update `Resources/Webpage_Files/Webpage_Functions/firebase-config.js` with your credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

3. **Open the project**
   - Navigate to the project root directory
   - Open `index.html` in your web browser
   - Or explore specific pages in `Resources/Webpage_Files/Section_Pages/`
   - Or Host it locally in your browser using Virtual Studio COde Live Server Extension
   ```
   [://localhost:8000](http://127.0.0.1:5500/index.html)
    ```

   **Why use a local server?**
   - Prevents CORS issues
   - Enables proper JavaScript module loading
   - Better simulates production environment

---

## 📂 Project Structure

### Main Page
- **index.html** — Landing page with user login/registration

### Product Categories & Pages

The website includes **six main categories**, each with detailed sub-pages:

#### **Category 1 — Coffee**
- ☕ Iced Coffee
- ☕ Hot Coffee
- 📋 Coffee Overview

#### **Category 2 — Non-Coffee Drinks**
- 🥤 Latte
- 🍵 Fruit Tea
- 📋 Non-Coffee Overview

#### **Category 3 — Secret Menu**
- 🥤 Soda Series
- 🍹 Fusion Series
- 🍪 Biscoff Series
- 📋 Secret Menu Overview

#### **Category 4 — Pastries**
- 🥐 Cinnamon Roll
- 🍰 Cake
- 📋 Pastries Overview

#### **Category 5 — Takoyaki**
- 🐙 Original Takoyaki
- 🌶️ Spicy Takoyaki

#### **Category 6 — Ramen**
- 🍜 Beef Ramen
- 🍜 Chicken Ramen

### Assets Organization
```
Resources/
├── Webpage_Files/
│   ├── Product_Pages/          # Category and product pages
│   └── Section_Pages/          # Main sections (Home, Cart, etc.)
├── Webpage_Images_&_Icons/     # UI elements, product images
│   ├── Product_Icons/          # Category thumbnails
│   └── Interface_Images/       # Brand logo, graphics
└── Webpage_Style_Sheet/        # CSS styling files
```

---

## 📁 Detailed File Structure

```
Gwangju-Cafe/
├── index.html                          # Main landing page with login/signup
├── Readme.md                           # Project documentation
└── Resources/
    ├── Webpage_Files/
    │   ├── Section_Pages/
    │   │   ├── Product_Pages/          # Category and individual product pages
    │   │   │   ├── Coffee/             # Coffee category pages
    │   │   │   ├── Non_Coffee/         # Non-coffee category pages
    │   │   │   ├── Secret_Menu/        # Secret menu category pages
    │   │   │   ├── Pastries/           # Pastries category pages
    │   │   │   ├── Takoyaki/           # Takoyaki pages
    │   │   │   └── Ramen/              # Ramen pages
    │   │   └── Webpage_Sections/       # Main application sections
    │   │       ├── Home.html           # Customer home page
    │   │       ├── Menu.html           # Menu browsing
    │   │       ├── Cart.html           # Shopping cart
    │   │       ├── Checkout.html       # Order checkout
    │   │       ├── Profile.html        # User profile
    │   │       ├── PendingOrders.html  # Track orders
    │   │       ├── OrderHistory.html   # Past orders
    │   │       └── Admin_Sections/     # Admin portal
    │   │           ├── AdminProfile.html
    │   │           ├── inventory.html
    │   │           └── dashboard.html
    │   └── Webpage_Functions/          # JavaScript functionality
    │       ├── firebase-config.js      # Firebase configuration
    │       ├── SignUp.js               # User registration
    │       ├── LogIn.js                # User authentication
    │       ├── Profile.js              # Profile management
    │       ├── Menu.js                 # Menu functionality
    │       ├── Cart.js                 # Cart operations
    │       ├── Checkout.js             # Checkout process
    │       └── inventory.js            # Inventory management
    ├── Webpage_Style_Sheet/            # CSS styling
    │   ├── Webpage_Style_Sheet.css     # Global styles
    │   ├── profile.css                 # Profile page styles
    │   ├── inventory.css               # Inventory styles
    │   └── [other category styles]     # Category-specific styles
    └── Webpage_Images_&_Icons/         # Visual assets
        ├── Interface_Images/           # UI elements, brand logo
        ├── Product_Icons/              # Category thumbnails
        └── [category folders]/         # Product-specific images
```

---

## 👥 User Roles

### Customer Account
**Default Role:** User  
**Capabilities:**
- Browse menu
- Add items to cart
- Place orders
- Track deliveries
- View order history
- Manage profile
- Rate delivered items

### Admin Account
**Default Credentials:**
- **Email:** admingwangju@gmail.com
- **Password:** admin123

**Capabilities:**
- All customer features
- Inventory management (CRUD operations)
- View analytics dashboard
- Monitor sales and stock
- Generate test data

---

## 🎨 Key Features Breakdown

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Breakpoints: 360px, 480px, 768px, 1024px+
- Touch-friendly interfaces

### Real-time Updates
- Live inventory stock tracking
- Instant cart updates
- Order status notifications
- Dynamic price calculations

### Data Validation
- Email format validation
- Password strength requirements (min 6 characters)
- Username uniqueness checking
- Stock quantity constraints (1-15)
- Address field validation
- Input length restrictions

### Security Features
- Firebase Authentication
- Password hashing
- Protected routes
- Role-based access control
- Session management
- Re-authentication for sensitive changes

### User Experience
- Intuitive navigation
- Loading states
- Error handling with user-friendly messages
- Confirmation dialogs
- Success notifications
- Smooth animations
- Keyboard navigation support

---

## 🔄 Workflow

### Customer Order Flow
```
Sign Up/Login → Browse Menu → Add to Cart → Checkout → 
Enter Address → Confirm Order → Track in "To Receive" → 
Confirm Delivery → Rate Items → View in Order History
```

### Admin Inventory Flow
```
Admin Login → Access Inventory → Add/Update/Delete Items → 
Monitor Stock Levels → Generate Reports → View Dashboard
```

---

## 📊 Database Schema

### Collections

#### **users**
```javascript
{
  uid: string,
  email: string,
  username: string,
  role: "user" | "admin",
  address: {
    firstName: string,
    lastName: string,
    houseNumber: string,
    street: string,
    barangay: string
  },
  orders: array,
  cart: array,
  createdAt: timestamp
}
```

#### **inventory**
```javascript
{
  id: number,
  name: string,
  category: string,
  subcategory: string (optional),
  size: string,
  price: number,
  stock: number (1-15),
  addedDate: date,
  expirationDate: date
}
```

#### **usernames**
```javascript
{
  username: string,
  uid: string
}
```

---

## 🐛 Known Issues & Limitations

- Stock quantity limited to 1-15 per item
- Single delivery address per order
- Admin account auto-created (security consideration for production)
- No payment gateway integration
- Limited to San Luis, Batangas barangays

---

## 🚧 Future Enhancements

- [ ] Payment gateway integration (PayPal, GCash)
- [ ] SMS/Email order notifications
- [ ] Advanced analytics and reporting
- [ ] Multi-address support
- [ ] Order scheduling
- [ ] Loyalty points system
- [ ] Product reviews and ratings
- [ ] Push notifications
- [ ] Dark mode
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Contributors

**Group 1 — IT3101 / IT-314**

| Name | Role |
|------|------|
| **Hornilla, Alexander** | Developer |
| **Gabayno, Viczon** | Developer |
| **Mendoza, Mavell** | Developer |
| **Melgarejo, Marlon** | Developer |
| **Endozo, Vincent** | Developer |
| **Dela Cruz, Chester** | Developer |

---

## 📝 License

This project is developed for **academic and educational purposes only** as part of the IT3101 (IT-314) course requirements and is **not intended for commercial use**.

---

## 🙏 Acknowledgments

- **IT3101 / IT-314 Course** for project guidance
- **Firebase** for backend infrastructure
- **Vercel** for hosting
- **Font Awesome** for icons
- **Google Fonts** for typography
- **The Gwangju Café team** for project requirements and support

---

## 📞 Support

For questions or support regarding this academic project, please contact any of the contributors listed above or create an issue in this repository.

---

## 🌐 Links

- **Live Demo:** [https://gwangju-cafe.vercel.app/](https://gwangju-cafe.vercel.app/)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

**Final Project — IT3101 / IT-314 | Group 1**

Made with ☕ by the Gwangju Café Development Team

</div>
