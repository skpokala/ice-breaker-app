# Team Ice Breaker Questions App

A modern web application for randomly selecting ice breaker questions for teams, with comprehensive admin controls and analytics.

## Features

### For Teams
- **Team Selection**: Choose from different teams with color-coded interfaces
- **Random Questions**: Get randomly selected ice breaker questions from the question bank
- **Smart Filtering**: Used and skipped questions won't appear again for the same team
- **Question Actions**:
  - Use a question (marks as used, won't appear again)
  - Skip a question (moves to skipped bucket, won't appear again)
  - Get a new question without taking action

### For Admins
- **Question Management**: Add, edit, and delete ice breaker questions
- **Team Management**: Create new teams and reset their question progress
- **Analytics Dashboard**: View usage statistics and team activity
- **Usage Tracking**: See which questions were used by which teams and when
- **Skip Tracking**: Monitor which questions teams skipped
- **Categories & Difficulty**: Organize questions by category and difficulty level

## Tech Stack

- **Frontend**: React 18 with custom CSS (Tailwind-like utilities)
- **Backend**: Node.js with Express
- **Database**: JSON files (easily replaceable with a real database)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation

1. **Navigate to the project directory**
   ```bash
   cd /tmp/ice-breaker-app/ice-breaker-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   This will install dependencies for the root project, frontend, and backend.

3. **Start the development servers**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Alternative Setup (Manual)

If the combined script doesn't work, you can set up manually:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start backend server**
   ```bash
   cd ../backend
   npm run dev
   ```

5. **In a new terminal, start frontend**
   ```bash
   cd frontend
   npm start
   ```

## Usage

### Team Interface (Main App)
1. Open your browser to `http://localhost:3000`
2. Select your team from the available options
3. Click "Get Question" to receive a random ice breaker question
4. Choose to:
   - **Use This Question**: Mark it as used and get the next question
   - **Skip Question**: Move to skipped bucket and get the next question  
   - **Get New Question**: Get a different question without taking action

### Admin Interface
1. Navigate to `http://localhost:3000/admin`
2. Use the navigation to access different admin functions:
   - **Questions**: Add, edit, or delete questions from the bank
   - **Analytics**: View usage statistics and team activity
   - **Teams**: Add new teams or reset team progress

## Data Structure

The app uses JSON files for data storage:

- `backend/data/questions.json` - Ice breaker questions with categories and difficulty
- `backend/data/teams.json` - Team information with colors
- `backend/data/usage-history.json` - Track which questions were used by teams
- `backend/data/skipped-questions.json` - Track which questions were skipped

## API Endpoints

### Team Endpoints
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create a new team
- `GET /api/teams/:teamId/question` - Get random available question for team
- `POST /api/teams/:teamId/use-question` - Mark question as used
- `POST /api/teams/:teamId/skip-question` - Mark question as skipped

### Admin Endpoints
- `GET /api/admin/questions` - Get all questions
- `POST /api/admin/questions` - Add new question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/usage-stats` - Get comprehensive usage statistics
- `POST /api/admin/teams/:teamId/reset` - Reset all questions for a team

## Customization

### Adding Questions
1. Use the admin interface at `/admin/questions`
2. Click "Add Question" and fill in:
   - Question text
   - Category (personal, work, hypothetical, creative, thoughtful, general)
   - Difficulty (easy, medium, hard)

### Adding Teams
1. Go to `/admin/teams`
2. Click "Add Team" and provide:
   - Team name
   - Team color (color picker)

### Modifying Styling
- Edit `frontend/src/index.css` for global styles
- CSS uses utility classes similar to Tailwind CSS
- Responsive design included for mobile devices

## Production Deployment

For production deployment:

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure the backend to serve the built frontend**
3. **Replace JSON file storage with a proper database** (PostgreSQL, MongoDB, etc.)
4. **Add proper authentication for admin routes**
5. **Set up environment variables** for configuration

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your team building activities!

---

**Happy team building! 🎉** 