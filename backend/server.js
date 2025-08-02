const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Question = require('./models/Question');
const Team = require('./models/Team');
const UsageHistory = require('./models/UsageHistory');
const SkippedQuestion = require('./models/SkippedQuestion');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/icebreaker';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  initializeData();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Initialize sample data if collections are empty
async function initializeData() {
  try {
    // Initialize sample questions if none exist
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      const sampleQuestions = [
        {
          question: "If you could have dinner with anyone, living or dead, who would it be and why?",
          category: "personal",
          difficulty: "easy"
        },
        {
          question: "What's the most unusual talent or skill you have?",
          category: "personal",
          difficulty: "easy"
        },
        {
          question: "If you could live in any time period, which would you choose and why?",
          category: "hypothetical",
          difficulty: "medium"
        },
        {
          question: "What's the best piece of advice you've ever received?",
          category: "personal",
          difficulty: "medium"
        },
        {
          question: "If you could instantly become an expert in any field, what would it be?",
          category: "hypothetical",
          difficulty: "easy"
        },
        {
          question: "What's a goal you have that you've never told anyone about?",
          category: "personal",
          difficulty: "hard"
        },
        {
          question: "If you could switch lives with someone for a day, who would it be?",
          category: "hypothetical",
          difficulty: "medium"
        },
        {
          question: "What's something you believed as a child that you later found out wasn't true?",
          category: "personal",
          difficulty: "easy"
        },
        {
          question: "If you could create a new holiday, what would it celebrate?",
          category: "creative",
          difficulty: "medium"
        },
        {
          question: "What's the most spontaneous thing you've ever done?",
          category: "personal",
          difficulty: "medium"
        },
        {
          question: "If you could have any superpower for just one day, what would it be?",
          category: "hypothetical",
          difficulty: "easy"
        },
        {
          question: "What's a skill you wish everyone had to learn in school?",
          category: "thoughtful",
          difficulty: "medium"
        },
        {
          question: "If you could redesign your workspace, what would it look like?",
          category: "work",
          difficulty: "easy"
        },
        {
          question: "What's the most interesting documentary or book you've consumed recently?",
          category: "personal",
          difficulty: "medium"
        },
        {
          question: "If you could start a business tomorrow, what would it be?",
          category: "work",
          difficulty: "medium"
        }
      ];
      
      await Question.insertMany(sampleQuestions);
      console.log('✅ Sample questions initialized');
    }

    // Initialize sample teams if none exist
    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      const sampleTeams = [
        { name: "Engineering Team", color: "#3B82F6" },
        { name: "Design Team", color: "#EF4444" },
        { name: "Marketing Team", color: "#10B981" },
        { name: "Sales Team", color: "#F59E0B" }
      ];
      
      await Team.insertMany(sampleTeams);
      console.log('✅ Sample teams initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
}

// Get available questions for a team (excluding used and skipped)
async function getAvailableQuestions(teamId) {
  try {
    const usedQuestionIds = await UsageHistory.distinct('questionId', { teamId });
    const skippedQuestionIds = await SkippedQuestion.distinct('questionId', { teamId });
    
    const unavailableIds = [...usedQuestionIds, ...skippedQuestionIds];
    
    return await Question.find({ _id: { $nin: unavailableIds } });
  } catch (error) {
    console.error('Error getting available questions:', error);
    return [];
  }
}

// API Routes

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: 1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Create a new team
app.post('/api/teams', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = new Team({
      name,
      color: color || '#3B82F6'
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get a random question for a team
app.get('/api/teams/:teamId/question', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Validate team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const availableQuestions = await getAvailableQuestions(teamId);

    if (availableQuestions.length === 0) {
      return res.status(404).json({ error: 'No more questions available for this team' });
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    res.json(selectedQuestion);
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({ error: 'Failed to get question' });
  }
});

// Mark a question as used
app.post('/api/teams/:teamId/use-question', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { questionId, userName } = req.body;

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    if (!userName || !userName.trim()) {
      return res.status(400).json({ error: 'User name is required' });
    }

    // Validate team and question exist
    const team = await Team.findById(teamId);
    const question = await Question.findById(questionId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if already used
    const existingUsage = await UsageHistory.findOne({ teamId, questionId });
    if (existingUsage) {
      return res.status(400).json({ error: 'Question already marked as used' });
    }

    const usageEntry = new UsageHistory({ teamId, questionId, userName: userName.trim() });
    await usageEntry.save();

    res.json({ success: true, message: 'Question marked as used' });
  } catch (error) {
    console.error('Error marking question as used:', error);
    res.status(500).json({ error: 'Failed to mark question as used' });
  }
});

// Mark a question as skipped
app.post('/api/teams/:teamId/skip-question', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { questionId, userName } = req.body;

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    if (!userName || !userName.trim()) {
      return res.status(400).json({ error: 'User name is required' });
    }

    // Validate team and question exist
    const team = await Team.findById(teamId);
    const question = await Question.findById(questionId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if already skipped
    const existingSkip = await SkippedQuestion.findOne({ teamId, questionId });
    if (existingSkip) {
      return res.status(400).json({ error: 'Question already marked as skipped' });
    }

    const skipEntry = new SkippedQuestion({ teamId, questionId, userName: userName.trim() });
    await skipEntry.save();

    res.json({ success: true, message: 'Question marked as skipped' });
  } catch (error) {
    console.error('Error marking question as skipped:', error);
    res.status(500).json({ error: 'Failed to mark question as skipped' });
  }
});

// Get user name suggestions for auto-complete
app.get('/api/teams/:teamId/users', async (req, res) => {
  try {
    const { teamId } = req.params;

    // Get unique user names from both usage history and skipped questions for this team
    const [usageUsers, skippedUsers] = await Promise.all([
      UsageHistory.distinct('userName', { teamId }),
      SkippedQuestion.distinct('userName', { teamId })
    ]);

    // Combine and deduplicate user names
    const allUsers = [...new Set([...usageUsers, ...skippedUsers])];
    
    res.json(allUsers.sort());
  } catch (error) {
    console.error('Error fetching user suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch user suggestions' });
  }
});

// Get all user name suggestions across all teams (for broader suggestions)
app.get('/api/users', async (req, res) => {
  try {
    // Get unique user names from both collections across all teams
    const [usageUsers, skippedUsers] = await Promise.all([
      UsageHistory.distinct('userName'),
      SkippedQuestion.distinct('userName')
    ]);

    // Combine and deduplicate user names
    const allUsers = [...new Set([...usageUsers, ...skippedUsers])];
    
    res.json(allUsers.sort());
  } catch (error) {
    console.error('Error fetching all user suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch user suggestions' });
  }
});

// Admin routes

// Get all questions
app.get('/api/admin/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Add a new question
app.post('/api/admin/questions', async (req, res) => {
  try {
    const { question, category, difficulty } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    const newQuestion = new Question({
      question,
      category: category || 'general',
      difficulty: difficulty || 'medium'
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Update a question
app.put('/api/admin/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, category, difficulty } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { question, category, difficulty },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a question
app.delete('/api/admin/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Also delete related usage history and skipped records
    await UsageHistory.deleteMany({ questionId: id });
    await SkippedQuestion.deleteMany({ questionId: id });

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Get usage statistics
app.get('/api/admin/usage-stats', async (req, res) => {
  try {
    const [usageHistory, skippedQuestions, teams, questions] = await Promise.all([
      UsageHistory.find().populate('teamId', 'name').populate('questionId', 'question'),
      SkippedQuestion.find().populate('teamId', 'name').populate('questionId', 'question'),
      Team.find(),
      Question.find()
    ]);

    // Process usage history
    const usageWithDetails = usageHistory.map(entry => ({
      id: entry._id,
      teamId: entry.teamId._id,
      teamName: entry.teamId.name,
      questionId: entry.questionId._id,
      questionText: entry.questionId.question,
      userName: entry.userName,
      usedAt: entry.createdAt
    }));

    // Process skipped questions
    const skippedWithDetails = skippedQuestions.map(entry => ({
      id: entry._id,
      teamId: entry.teamId._id,
      teamName: entry.teamId.name,
      questionId: entry.questionId._id,
      questionText: entry.questionId.question,
      userName: entry.userName,
      skippedAt: entry.createdAt
    }));

    res.json({
      usage: usageWithDetails,
      skipped: skippedWithDetails,
      summary: {
        totalUsed: usageHistory.length,
        totalSkipped: skippedQuestions.length,
        totalQuestions: questions.length,
        totalTeams: teams.length
      }
    });
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

// Reset questions for a team (admin function)
app.post('/api/admin/teams/:teamId/reset', async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Remove all usage history and skipped questions for this team
    await Promise.all([
      UsageHistory.deleteMany({ teamId }),
      SkippedQuestion.deleteMany({ teamId })
    ]);

    res.json({ success: true, message: 'Team questions reset successfully' });
  } catch (error) {
    console.error('Error resetting team questions:', error);
    res.status(500).json({ error: 'Failed to reset team questions' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Admin panel available at http://localhost:3000/admin`);
  console.log(`🔗 Database: ${MONGODB_URI}`);
}); 