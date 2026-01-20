# Reddit Demand Radar

A premium AI-powered market research tool for analyzing Reddit discussions and identifying demand signals.

## 🏗️ Architecture

- **Monorepo Structure**: `/backend` (NestJS) + `/frontend` (Next.js 14+ App Router)
- **Backend**: NestJS, Prisma ORM, Supabase PostgreSQL
- **Frontend**: Next.js, Tailwind CSS, Shadcn UI components, Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase)

### Installation

1. **Install root dependencies**:
```bash
npm install
```

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

3. **Install frontend dependencies**:
```bash
cd frontend
npm install
```

### Running the Application

**Run both frontend and backend simultaneously**:
```bash
npm run dev
```

**Or run separately**:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 📁 Project Structure

### Backend (`/backend`)

```
src/
├── common/          # Guards, pipes, interceptors, decorators
├── config/          # Configuration modules
├── modules/
│   ├── ai/          # AI provider-agnostic module (OpenAI/Gemini)
│   ├── analysis/    # Analysis service and controller
│   └── prisma/      # Prisma service
└── main.ts          # Application entry point

prisma/
├── schema.prisma    # Prisma schema definition
└── migrations/      # SQL migration files (manual)
```

### Frontend (`/frontend`)

```
src/
├── app/             # Next.js App Router pages
├── components/
│   ├── ui/          # Reusable UI components (Button, Input, Card, Badge)
│   └── dashboard/   # Dashboard-specific components
└── lib/             # Utility functions
```

## 🎨 UI Features

- **Premium Design**: Minimalistic, modern aesthetic with white and deep purple (violet) color palette
- **Smooth Animations**: Framer Motion for subtle, expensive-feeling transitions
- **Responsive**: Extremely responsive UI with feedback on every interaction
- **Component Library**: Shadcn UI-inspired reusable components

## 🔌 API Endpoints

### POST `/analysis/search`

Analyze Reddit posts based on subreddits and keywords.

**Request Body**:
```json
{
  "subreddits": ["startups", "entrepreneur"],
  "keywords": "SaaS, AI tools, productivity"
}
```

**Response**:
```json
[
  {
    "id": "1",
    "subreddit": "startups",
    "title": "Building a SaaS product...",
    "score": 245,
    "comments": 89,
    "url": "#",
    "keyword": "SaaS",
    "relevance": 95
  }
]
```

## 🗄️ Database Schema

- **Subreddit**: Stores subreddit information
- **Keyword**: Stores search keywords
- **Match**: Stores analysis results matching keywords to Reddit posts

See `backend/prisma/schema.prisma` for full schema definition.

## 🔧 Development

### Backend Commands

```bash
cd backend

# Generate Prisma client
npx prisma generate

# View database (Prisma Studio)
npx prisma studio

# Build
npm run build

# Start production
npm run start:prod
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Start production
npm run start
```

## 📝 Notes

- **Database Migrations**: Do NOT run Prisma migrations directly. Use the SQL file in `backend/prisma/migrations/` and apply manually due to connection pooler restrictions.
- **AI Integration**: Currently uses mock responses. OpenAI and Gemini providers are set up but need API keys to be configured.
- **Reddit API**: Not yet integrated. The analysis service returns mock data for MVP.

## 🎯 MVP Status

✅ Monorepo structure  
✅ Backend modules (AI, Analysis, Prisma)  
✅ Database schema and migration  
✅ Premium UI dashboard  
✅ Mock analysis flow  
⏳ Reddit API integration (pending)  
⏳ Real AI analysis (pending)
