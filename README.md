# ChatSense

Welcome to ChatSense! This is a smart chat application designed to make your conversations smoother and more insightful. It's not just about sending messages; it's about understanding them. With AI-powered features, ChatSense helps you get the gist of long conversations, suggests replies, and even helps you refine your own messages.

## ✨ Key Features

- **AI-Powered Chat Analysis:** Get a quick summary of your conversations, including key topics, decisions, and overall sentiment.
- **Smart Suggestions:**
  - **Reply Suggestions:** Get help with quick replies based on the last message.
  - **Follow-up Suggestions:** Keep the conversation going with relevant follow-up ideas.
  - **Message Refinement:** Polish your messages to be more friendly, professional, or clear.
- **Real-Time Chat:** Instantly send and receive messages with online status indicators.
- **User Authentication:** Secure signup and login functionality to keep your conversations private.
- **Profile Customization:** Personalize your profile with a name and a profile picture.

## 🛠️ Tech Stack

**Frontend:**
- React
- Vite
- Zustand
- Tailwind CSS with DaisyUI

**Backend:**
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT (JSON Web Tokens)
- Cloudinary
- Google Gemini API

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need to have Node.js and npm installed on your machine.

### Installation

1. **Clone the repo:**
    ```sh
    git clone https://github.com/your-username/chatsense.git
    ```
2. **Install backend dependencies:**
    ```sh
    cd backend
    npm install
    ```
3. **Install frontend dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```

### Environment Variables

You'll need to create a `.env` file in both the `backend` and `frontend` directories. Use the provided `.env.example` files as a template.

**Backend (`backend/.env`):**

```
PORT=...
MONGO_URL=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=...
GEMINI_API_KEY=...
```

**Frontend (`frontend/.env`):**

```
VITE_BACKEND_URL=...
```

### Running the Application

1. **Start the backend server:**
    ```sh
    cd backend
    npm run dev
    ```
2. **Start the frontend development server:**
    ```sh
    cd frontend
    npm run dev
    ```

Now, open your browser and navigate to the frontend URL to see the application in action!
