# WebJor SaaS E-commerce Platform

## Overview
WebJor is a full-featured SaaS e-commerce platform built for small businesses in Jordan. It provides a complete storefront solution with integrated AI features for marketing, product management, and customer engagement.

**Status**: ✓ Configured for Replit environment - Requires Firebase setup  
**Last Updated**: November 16, 2025

## Tech Stack
- **Frontend**: React 19 + Vite 7
- **UI Framework**: Tailwind CSS 3
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **AI Integration**: Google Gemini API
- **Routing**: React Router v7
- **State Management**: Context API
- **Internationalization**: i18next (English/Arabic)
- **Charts**: Chart.js + react-chartjs-2
- **Email**: Nodemailer

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages & features
│   │   ├── layout/         # Layout components
│   │   ├── shared/         # Shared/reusable components
│   │   └── store/          # Public storefront components
│   ├── contexts/           # React Context providers
│   ├── services/           # Firebase and API services
│   ├── assets/             # Static assets
│   └── *.jsx               # Page components
├── public/
│   └── locales/           # Translation files (en/ar)
├── functions/             # Firebase Cloud Functions (not in use in Replit)
├── dist/                  # Production build output
└── package.json           # Dependencies and scripts
```

## Recent Changes (Import Setup)
- **Nov 16, 2025**: Successfully imported from GitHub
  - Installed all frontend dependencies (React, Firebase, i18next, Chart.js, etc.)
  - Configured Vite to run on port 5000 with 0.0.0.0 host for Replit proxy
  - Downgraded Tailwind CSS to v3 for compatibility
  - Created translation file structure for i18next
  - Set up workflow for development server
  - Added .gitignore for Node.js projects
  - Configured deployment for production
  - Added .env.example for configuration guidance

## Getting Started

### Prerequisites
You need to set up Firebase before running this application:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Cloud Functions

### Environment Configuration
Create a `.env` file in the root directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For Cloud Functions (optional):
```env
GEMINI_KEY=your_gemini_api_key_here
MAIL_HOST=smtp.example.com
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password
```

### Running the Application

The development server is already configured to run automatically. If you need to restart it:
- The app runs on port 5000
- Vite dev server with hot module replacement (HMR)
- Accessible via the Replit webview

### Available Scripts

```bash
npm run dev              # Start Vite dev server (port 5000)
npm run build            # Build for production
npm run preview          # Preview production build
npm run build:functions  # Compile TypeScript functions
npm run serve:functions  # Run Firebase emulators
```

## Key Features

### Subscription Tiers
1. **Free Plan**: 
   - 3 products limit
   - Public storefront
   - Order management
   
2. **Basic Plan** (5 JOD/month):
   - 20 products
   - No "Powered by" badge
   - Product categories & brands
   - AI background remover
   - AI Instagram captions
   - Social proof features

3. **Pro Plan** (15 JOD/month):
   - Unlimited products
   - AI product descriptions
   - Bulk import
   - Advanced analytics
   - Discount codes
   - WhatsApp/Telegram alerts
   - Marketing automation

### Firebase Cloud Functions
Located in `src/index.ts` (TypeScript):
1. `sendEmailNotification` - Email sending service
2. `onProductUpdate` - Back-in-stock alerts
3. `generateInstagramCaptions` - AI-powered captions
4. `analyzeProduct` - Sales leak diagnostics
5. `getStoreEvents` - Simulated social proof events

## Important Notes

### Replit Configuration
- **Port**: Must use port 5000 for frontend (configured)
- **Host**: Set to 0.0.0.0 to allow external connections
- **HMR**: Hot Module Replacement configured for Replit proxy

### Firebase Functions & AI Features
The Firebase Functions in this project are designed to run on Firebase's infrastructure, not locally in Replit. 

**AI Features (Instagram Captions, Product Analysis)**:
- These require the GEMINI_KEY secret to be configured in Firebase Functions
- To use AI features, you must deploy functions to Firebase or run emulators locally

**To Deploy Functions**:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Build functions: `npm run build:functions`
4. Deploy: `npm run deploy:functions`
5. Add GEMINI_KEY as a Firebase secret: `firebase functions:secrets:set GEMINI_KEY`

**To Use Emulators Locally** (for development):
- Run: `npm run serve:functions` (port 5001)
- This allows testing AI features without deploying to production

### Known Issues
- **White screen on first load**: App requires Firebase configuration to initialize
- **React 19**: Using latest React which may have compatibility issues with some libraries
- **Node version**: Project specifies Node 22, but Replit uses Node 20 (minor warnings expected)

## Deployment

The project is configured for Replit deployment:
- **Build command**: `npm run build`
- **Run command**: `npm run preview`
- **Output directory**: `dist/`
- **Deployment type**: Autoscale (stateless)

Before deploying:
1. Ensure all environment variables are set in Replit Secrets
2. Test the build locally: `npm run build`
3. Preview production build: `npm run preview`
4. Use Replit's deployment feature to publish

## Troubleshooting

### App shows white screen
- Check that Firebase environment variables are set
- Verify Firebase project is properly configured
- Check browser console for errors

### Translation errors
- Ensure `public/locales/en/common.json` and `public/locales/ar/common.json` exist
- Check i18next configuration in `src/i18n.js`

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version compatibility
- Verify Tailwind CSS v3 is installed (not v4)

## User Preferences
- Primary language: English
- Secondary language: Arabic (RTL support)
- Currency: JOD (Jordanian Dinar)
- Theme: Purple primary color (#6D28D9)

## Architecture Decisions

### Why React 19?
Latest version with improved performance and features, but be aware of potential compatibility issues with older libraries.

### Why Vite?
Fast development experience with instant HMR and optimized builds. Better than Create React App for modern React development.

### Why Firebase?
Serverless backend with built-in authentication, database, storage, and cloud functions. Reduces infrastructure management overhead.

### Why Tailwind CSS v3?
Compatibility with existing CSS structure using `@import` directives. v4 uses different syntax.

## Contributing
This is a SaaS product. Maintain code quality and ensure all features align with subscription tier limitations.

## License
Proprietary - WebJor SaaS Platform
