# WealthTrack Pro

<div align="center">

![WealthTrack Pro](https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

**A modern, AI-powered personal finance management application**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Usage](#usage) • [Contributing](#contributing)

</div>

---

## Overview

WealthTrack Pro is a comprehensive personal finance management application that helps you take control of your financial life. With an intuitive interface, powerful analytics, and AI-powered insights, managing your money has never been easier.

## Features

### Core Functionality

- **Account Management** - Track multiple accounts including checking, savings, credit cards, and investments
- **Transaction Tracking** - Record and categorize all your income and expenses with ease
- **Budget Planning** - Set monthly budgets by category and monitor your spending in real-time
- **Visual Reports** - Beautiful charts and graphs to visualize your financial health
- **Smart Categories** - Organize transactions with customizable income and expense categories

### AI-Powered Intelligence

- **Conversational AI Assistant** - Ask questions about your finances in natural language
- **Personalized Insights** - Get intelligent recommendations based on your spending patterns
- **Real-time Analysis** - Analyze spending trends and receive actionable advice
- **Context-Aware Responses** - AI has full access to your financial data for accurate answers

### Security & Authentication

- **Secure Authentication** - Email/password authentication powered by Supabase
- **Row Level Security** - Your data is protected with database-level security policies
- **User Isolation** - Complete data separation between users
- **Encrypted Storage** - All sensitive data is securely encrypted

## Tech Stack

### Frontend

- **React 18** - Modern UI library for building interactive interfaces
- **TypeScript** - Type-safe JavaScript for robust code
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework for custom designs
- **Zustand** - Lightweight state management
- **Recharts** - Composable charting library for data visualization
- **Lucide React** - Beautiful icon library

### Backend & Infrastructure

- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security
  - Authentication & user management
  - Edge Functions for serverless compute
- **Google Gemini 2.0 Flash** - AI model for intelligent financial assistance

### DevOps

- **Netlify** - Hosting and continuous deployment
- **ESLint** - Code linting and quality checks
- **PostCSS** - CSS processing and optimization

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Supabase account (free tier available)
- A Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/huddylatimer/wealthtrackpro.git
cd wealthtrack-pro
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run database migrations

The database schema will be automatically set up through Supabase migrations.

5. Start the development server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Usage

### First Time Setup

1. **Sign Up** - Create your account using email and password
2. **Welcome Guide** - Follow the interactive welcome guide to set up your first account
3. **Add Transactions** - Start recording your income and expenses
4. **Set Budgets** - Create monthly budgets for different spending categories
5. **Ask the AI** - Navigate to the AI Assistant to get insights about your finances

### Key Workflows

#### Managing Accounts

Navigate to the Accounts page to:
- Add new accounts (checking, savings, credit cards, etc.)
- Update account balances
- View account summaries and trends
- Edit or delete accounts

#### Recording Transactions

On the Transactions page, you can:
- Add income or expense transactions
- Categorize transactions for better tracking
- Link transactions to specific accounts
- Search and filter your transaction history

#### Budget Planning

The Budgets page allows you to:
- Create monthly budgets by category
- Monitor spending against budget limits
- Receive alerts when approaching limits
- Adjust budgets as needed

#### Using the AI Assistant

Ask your AI financial assistant questions like:
- "How much did I spend on groceries this month?"
- "What's my biggest expense category?"
- "Am I staying within my budgets?"
- "Can I afford a $500 purchase this week?"
- "Show me my spending trends"

## Project Structure

```
wealthtrack-pro/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application pages/routes
│   ├── lib/             # Utilities and configurations
│   ├── store/           # State management
│   └── main.tsx         # Application entry point
├── supabase/
│   ├── functions/       # Edge Functions
│   └── migrations/      # Database migrations
└── package.json
```

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- **accounts** - User bank accounts and financial accounts
- **transactions** - Income and expense records
- **categories** - Transaction categories
- **budgets** - Monthly budget allocations

All tables include Row Level Security policies to ensure data privacy.

## API Documentation

### Edge Functions

#### AI Assistant Endpoint

```
POST /functions/v1/ai-assistant
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": "How much did I spend this month?"
}
```

Returns AI-generated insights based on the user's financial data.

## Contributing

We welcome contributions to WealthTrack Pro! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with proper type definitions
- Follow the existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## Security

If you discover a security vulnerability, please email hudsonlatimer4@gmail.com instead of using the issue tracker.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- AI by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Backend by [Supabase](https://supabase.com/)
- Stock photos from [Pexels](https://www.pexels.com/)

## Support

For support, please:
- Check the in-app Documentation page
- Open an issue on GitHub
- Email hudsonlatimer4@gmail.com

---

<div align="center">

**Made for better financial management**

[Website](https://wealthtrackpro.netlify.app/) 

</div>
