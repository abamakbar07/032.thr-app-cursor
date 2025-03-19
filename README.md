# Family Gacha THR

A gamified web application for distributing THR (Tunjangan Hari Raya) during Eid celebrations. The app allows an admin to create trivia game rooms, add questions, set reward tiers, and generate unique user IDs for participants.

## Features

### Admin Panel

- **Authentication & Authorization**
  - Admin accounts with secure login
  - Role-based access control

- **Game Room Management**
  - Create game rooms with unique room IDs
  - Add multiple-choice and true/false questions 
  - Bulk upload questions from JSON
  - Generate unique QR codes for participants

- **Dynamic Gacha & THR Reward System**
  - Define custom reward tiers (e.g., Bronze, Silver, Gold)
  - Set probability percentages for each reward
  - Adjust THR amounts per tier
  - Total probability validated not to exceed 100%

### Game Mechanics

- **User Entry & Authentication**
  - Participants enter by scanning QR codes
  - Simple authentication without requiring account creation

- **Trivia Question Race**
  - First-come, first-serve question answering
  - Correct answers grant Spin Tokens
  - Incorrect answers lock questions for that user

- **Gacha THR Reward System**
  - Spin a Gacha Wheel using earned tokens
  - Random rewards based on admin-defined tiers
  - Record of all spins and total THR earnings

## Technology Stack

- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/family-gacha-thr.git
   cd family-gacha-thr
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/family-gacha-thr?retryWrites=true&w=majority

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to http://localhost:3000

### Setting Up the Admin Account

1. First, create an admin account through the signup page at `/signup`
   - Note: Only the first admin account can be created through this method
   - Additional admin accounts can only be created by existing admins

2. After creating your admin account, you can start setting up game rooms and questions

### Deployment

This application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
