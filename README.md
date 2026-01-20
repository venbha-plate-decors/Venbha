# Venbha Plate Decors

A modern, elegant website for Venbha Plate Decors built with React, Vite, and Supabase.

## Features

- 🎨 Beautiful, responsive design with smooth animations
- 🖼️ Dynamic gallery with image and video support
- 📱 Mobile-friendly interface
- 🔐 Secure admin authentication with Supabase
- 📊 Admin dashboard for content management
- 💌 Contact form for customer inquiries
- 🌸 Decorative rose petal animations

## Tech Stack

- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.12.0
- **Animations**: Framer Motion 12.26.1
- **Authentication & Database**: Supabase
- **Styling**: Vanilla CSS
- **Icons**: Radix UI Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd venbha-plate-decors
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the Supabase credentials in `.env`

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Supabase Integration

This project uses Supabase for authentication and database management. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

### Quick Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Copy your project URL and anon key to `.env`
4. Create an admin user in Supabase Authentication
5. Login at `/admin_login`

## Project Structure

```
venbha-plate-decors/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts (Auth)
│   ├── lib/            # Utilities and configurations
│   ├── assets/         # Images and static files
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Public assets
├── .env                # Environment variables (not in git)
├── .env.example        # Environment variables template
└── SUPABASE_SETUP.md   # Supabase setup guide
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Admin Dashboard

Access the admin dashboard at `/admin_login`. Features include:

- 📊 Dashboard overview
- 🖼️ Gallery management (images & videos)
- 🏠 Homepage gallery management
- 📂 Collections management (coming soon)
- ⚙️ Settings (profile & password management)
- 🚪 Secure logout

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

Make sure to add your environment variables in the Vercel dashboard.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For support, please contact the development team.
