# 🚢 PortConnect

**PortConnect** is a modern port management platform that connects ship captains, service providers, and terminal operators in an integrated digital ecosystem.

![Built with Bolt.new](https://img.shields.io/badge/Built%20with-Bolt.new-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
[![CI/CD Pipeline](https://github.com/XSirch/port-connect/actions/workflows/ci.yml/badge.svg)](https://github.com/XSirch/port-connect/actions/workflows/ci.yml)

## 🌟 Key Features

### 🎯 **For Ship Captains**
- 📋 Port service reservations (tugboats, bunkering, cleaning)
- 📊 Dashboard with reservation overview
- 🔍 Service search and comparison
- 📱 Responsive interface for mobile devices

### 🏭 **For Service Providers**
- 🛠️ Complete management of offered services
- 📈 Availability and pricing control
- 📋 Received reservation management
- 💰 Financial reports

### 🏢 **For Terminal Operators**
- 🗺️ Port and infrastructure management
- 👥 User and permission control
- 📊 Port operations overview
- 🔧 System configuration

## 🚀 Technologies Used

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify ready

## 🎨 Design System

PortConnect uses a modern and consistent design system:

- **🎨 Color Palette**: Inspired by maritime environment
- **📝 Typography**: Inter font for maximum readability
- **🧩 Components**: Modular and reusable system
- **📱 Responsiveness**: Mobile-first design
- **♿ Accessibility**: WCAG 2.1 compliant

### Available UI Components
- `Button` - Multiple variants and sizes
- `Card` - Flexible containers with shadow system
- `Input` - Fields with validation and states
- `Modal` - Accessible modal system
- `Toast` - Non-intrusive notifications
- `Badge` - Status indicators
- `EmptyState` - Informative empty states

## 📦 Installation and Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the repository
```bash
git clone https://github.com/XSirch/port-connect.git
cd port-connect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the project
```bash
npm run dev
```

## 🗄️ Database Structure

The project uses the following main tables:

- **users** - System users (captains, providers, operators)
- **ports** - Port information
- **services** - Services offered by providers
- **reservations** - Service reservations

## 🚀 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Build preview
npm run lint         # Code linting
```

## 📱 Features

### ✅ Implemented
- [x] Complete authentication system
- [x] Responsive dashboard with statistics
- [x] Reservation management
- [x] Notification system
- [x] Modern design system
- [x] Responsive interface

### 🔄 In Development
- [ ] Payment system
- [ ] Real-time chat
- [ ] Push notifications
- [ ] Advanced reports
- [ ] Mobile API

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🏆 Bolt.new Hackathon

This project was developed for the Bolt.new hackathon, demonstrating the platform's capabilities for creating modern and functional web applications.

---

**Built using [Bolt.new](https://bolt.new)**
