# Vistagram - Photo Sharing App

A modern photo sharing application built with React, TypeScript, and MongoDB.

## Features

- 📸 Photo upload and sharing
- 🔐 User authentication with Firebase
- 🎨 Modern UI with shadcn/ui components
- 📱 Responsive design
- 🗄️ MongoDB backend for data storage
- ⚡ Fast development with Vite

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Firebase
- **File Upload**: Multer

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b015dbe9-b4f3-49ca-92e3-f0b2ff1abf14) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables
cp env.example .env
# Edit .env with your MongoDB connection string and other credentials

# Step 5: Start the development server
npm run dev:full  # Starts both frontend and backend
# OR run separately:
# npm run server  # Backend only
# npm run dev     # Frontend only
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Quick Start

1. **Set up MongoDB**:
   - Create a free MongoDB Atlas account or install MongoDB locally
   - Follow the setup guide in `MONGODB_SETUP.md`

2. **Configure Environment**:
   - Copy `env.example` to `.env`
   - Add your MongoDB connection string and Firebase credentials

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development**:
   ```bash
   npm run dev:full
   ```

5. **Open Browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## API Endpoints

- `POST /api/photos/upload` - Upload a new photo
- `GET /api/photos/:id` - Get a photo by ID
- `GET /api/photos/user/:userId` - Get all photos for a user
- `DELETE /api/photos/:id` - Delete a photo
- `GET /api/health` - Health check

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b015dbe9-b4f3-49ca-92e3-f0b2ff1abf14) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
