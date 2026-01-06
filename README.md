# CIGATY - India’s First B2B Liquor Exchange

![CIGATY](https://img.shields.io/badge/CIGATY-Premium%20B2B%20Platform-8B0000?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss)

A premium B2B marketplace platform connecting global drinks brands with distributors worldwide. Built with React, TypeScript, and TailwindCSS, featuring Supabase authentication and modern animations.

## 🚀 Features

### Core Functionality
- **Multi-step Registration** - Seamless onboarding with account details, company information, and document upload
- **Authentication** - Secure login/signup with Supabase integration
- **Document Upload** - Drag-and-drop file upload with progress tracking and preview
- **Responsive Design** - Optimized for mobile, tablet, and desktop devices
- **Smooth Animations** - Powered by Framer Motion for engaging user experience

### Platform Features
- 🎯 **Full Product Management** - Comprehensive catalog and inventory tracking
- 📊 **Price Comparison** - Real-time market insights and competitive analysis
- 🛡️ **Market Restrictions** - Automated compliance and regulation management
- 📢 **Brand Activation** - Marketing tools for brand amplification
- 🔔 **Alerts & Notifications** - Real-time updates on orders and opportunities
- 🌐 **Web Responsiveness** - Seamless cross-device experience

## 🎨 Design System

### Color Palette
- **Background**: `#121212` (Dark)
- **Primary Accent**: `#8B0000` (Rich Wine Red)
- **Secondary Accent**: `#D4AF37` (Luxury Gold)
- **Text Color**: `#F5F5F5` (Light)

### Typography
- **Sans-serif**: Inter
- **Serif**: Playfair Display

## 📦 Tech Stack

- **Frontend Framework**: React 18.2
- **Language**: TypeScript 5.0
- **Styling**: TailwindCSS 3.3
- **Routing**: React Router DOM 6.x
- **Animations**: Framer Motion 10.x
- **Backend**: Supabase (Auth, Database, Storage)
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Build Tool**: Vite 5.x

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (for backend services)

### 1. Clone the Repository
\`\`\`bash
cd cigaty-marketplace
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration

Create a \`.env\` file in the root directory:

\`\`\`env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

**Get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to Settings → API
4. Copy the URL and anon/public key

### 4. Supabase Database Setup

Run the following SQL in your Supabase SQL Editor:

\`\`\`sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);
\`\`\`

### 5. Supabase Storage Setup

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named \`company-docs\`
3. Set it as **private** or configure access policies as needed

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:5173\`

## 📁 Project Structure

\`\`\`
cigaty-marketplace/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, animations, fonts
│   ├── components/     # React components
│   │   ├── common/    # Header, Footer, Layout
│   │   ├── features/  # Feature-specific components
│   │   └── forms/     # Form components (Button, Input, etc.)
│   ├── lib/           # Supabase client and utilities
│   ├── pages/         # Page components
│   ├── styles/        # Additional styles
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component with routing
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles with Tailwind
├── .env.example       # Environment variables template
├── tailwind.config.js # Tailwind configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
\`\`\`

## 🌐 Pages

- **Home** (`/`) - Hero section with features and CTAs
- **About Us** (`/about`) - Brand story, mission, values, team
- **Platform** (`/platform`) - Detailed platform features
- **Media** (`/media`) - Press releases and media resources
- **FAQs** (`/faqs`) - Frequently asked questions
- **Contact** (`/contact`) - Contact form and information
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Multi-step registration
- **Confirmation** (`/confirmation`) - Post-registration success
- **Dashboard** (`/dashboard`) - User dashboard (placeholder)

## 🎯 TODO Items & Future Enhancements

The codebase includes clearly marked TODO comments for future improvements:

1. **Hero Animation** - Replace placeholder with 3D wine bottle or Lottie animation
2. **Product Grid** - Integrate actual product data from database
3. **Dashboard** - Complete dashboard implementation with analytics
4. **Platform Screenshots** - Replace placeholder images with actual screenshots
5. **Map Integration** - Add Google Maps or similar service to Contact page
6. **Social Auth** - Implement Google and Facebook OAuth
7. **Email Integration** - Connect contact form to email service

## 🔧 Scripts

\`\`\`bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
\`\`\`

## 🎨 Customization

### Update Brand Colors

Edit \`tailwind.config.js\`:

\`\`\`javascript
theme: {
  extend: {
    colors: {
      wine: '#8B0000',      // Change primary color
      gold: '#D4AF37',      // Change secondary color
      dark: '#121212',      // Change background
    }
  }
}
\`\`\`

### Modify Animations

Animations are handled by Framer Motion. Edit component files to customize:
- Page transitions in \`App.tsx\`
- Component animations in individual page files
- Hover effects in component files

## 🚢 Deployment

### Build for Production
\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist/\` directory.

### Deploy to Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Deploy to Netlify
\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod
\`\`\`

**Important**: Set environment variables in your deployment platform:
- \`VITE_SUPABASE_URL\`
- \`VITE_SUPABASE_ANON_KEY\`

## 🐛 Known Issues & Limitations

- Dashboard is currently a placeholder - full implementation pending
- Social authentication (Google, Facebook) is UI-only - backend integration needed
- Email notifications not yet implemented
- Product catalog requires backend data integration

## 🤝 Contributing

This is a template project. Feel free to customize and extend it for your needs.

## 📄 License

This project is based on a free Bootstrap template from ThemeWagon and has been completely rebuilt with React, TypeScript, and TailwindCSS.

## 💬 Support

For questions or issues:
- Email: support@cigaty.com
- Create an issue in the repository

## 🙏 Acknowledgments

- Original template inspiration: [ThemeWagon - LiquorStore](https://themewagon.com)
- Icons: [Lucide React](https://lucide.dev)
- Fonts: [Google Fonts](https://fonts.google.com)
- Images: [Unsplash](https://unsplash.com)

---

**Built with ❤️ for the global drinks industry**

CIGATY - India’s First B2B Liquor Exchange
