# Staff Management System

A modern, full-featured staff and appointment management system built with Next.js and TypeScript.

**Live Demo**: [https://staff-management-client.vercel.app/](https://staff-management-client.vercel.app/)

## Features

- 📅 **Appointment Management** - Schedule, track, and manage customer appointments
- 👥 **Staff Management** - Organize staff members, schedules, and availability
- 📊 **Dashboard Analytics** - Real-time insights and performance metrics
- 🔐 **Authentication** - Secure user registration, login, and email verification
- 📱 **Responsive Design** - Seamless experience across all devices
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 🌓 **Dark Mode** - Light and dark theme support
- 📝 **Activity Logging** - Comprehensive audit trail of all system actions

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, pnpm, or bun

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd staff_management_client

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── store/           # State management
```

## License

MIT
