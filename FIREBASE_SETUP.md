# Firebase Setup for Google OAuth Authentication

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "Vistagram")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)

## Step 2: Enable Authentication

1. In your Firebase project console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Enable it and configure:
   - Project support email: Your email
   - Authorized domains: Add your domain (for development, you can use localhost)

## Step 3: Get Firebase Configuration

1. In your Firebase project console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and choose "Web"
4. Register your app with a nickname (e.g., "Vistagram Web")
5. Copy the configuration object

## Step 4: Set Up Environment Variables

Create a `.env` file in your project root with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the values with the actual configuration from your Firebase project.

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Add your domains to "Authorized domains":
   - For development: `localhost`
   - For production: Your actual domain

## Step 6: Test the Authentication

1. Start your development server: `npm run dev`
2. Click the "Sign In" button in the top-right corner
3. Try signing in with Google
4. You should see a success message and your profile picture

## Security Notes

- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use different Firebase projects for development and production
- Regularly review your Firebase security rules

## Troubleshooting

- **"Firebase: Error (auth/popup-closed-by-user)"**: User closed the popup before completing sign-in
- **"Firebase: Error (auth/unauthorized-domain)"**: Domain not added to authorized domains
- **"Firebase: Error (auth/network-request-failed)"**: Check your internet connection

## Next Steps

- Set up Firebase Firestore for storing user data and posts
- Configure Firebase Storage for image uploads
- Set up Firebase Security Rules
- Implement user profile management
