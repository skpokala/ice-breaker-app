import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Home,
  Users,
  RotateCcw,
  TrendingUp,
  FileText
} from 'lucide-react';
import axios from 'axios';
import ReleaseNotes from './ReleaseNotes';

const AdminInterface = () => {
  const location = useLocation();

  const Navigation = () => (
    <nav className="admin-nav">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Home size={20} />
              Back to App
            </Link>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/admin/questions" 
              className={`btn ${location.pathname.includes('questions') ? 'btn-primary' : 'btn-secondary'}`}
            >
              <MessageSquare size={16} />
              Questions
            </Link>
            <Link 
              to="/admin/analytics" 
              className={`btn ${location.pathname.includes('analytics') ? 'btn-primary' : 'btn-secondary'}`}
            >
              <BarChart3 size={16} />
              Analytics
            </Link>
            <Link 
              to="/admin/teams" 
              className={`btn ${location.pathname.includes('teams') ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Users size={16} />
              Teams
            </Link>
            <Link 
              to="/admin/releases" 
              className={`btn ${location.pathname.includes('releases') ? 'btn-primary' : 'btn-secondary'}`}
            >
              <FileText size={16} />
              Release Notes
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/questions" element={<QuestionsManager />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/teams" element={<TeamsManager />} />
          <Route path="/releases" element={<ReleaseNotes />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/usage-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="loading mx-auto mb-4"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {stats && (
        <div className="grid grid-2 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="text-blue-500" size={24} />
              <h3 className="text-xl font-semibold">Questions</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.summary.totalQuestions}</p>
            <p className="text-gray-600">Total questions in bank</p>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-green-500" size={24} />
              <h3 className="text-xl font-semibold">Teams</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.summary.totalTeams}</p>
            <p className="text-gray-600">Active teams</p>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-purple-500" size={24} />
              <h3 className="text-xl font-semibold">Used Questions</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.summary.totalUsed}</p>
            <p className="text-gray-600">Questions used by teams</p>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="text-orange-500" size={24} />
              <h3 className="text-xl font-semibold">Skipped Questions</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.summary.totalSkipped}</p>
            <p className="text-gray-600">Questions skipped by teams</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-3 gap-4">
        <Link to="/admin/questions" className="card hover:shadow-lg transition-shadow">
          <div className="text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold text-lg mb-2">Manage Questions</h3>
            <p className="text-gray-600">Add, edit, or delete ice breaker questions</p>
          </div>
        </Link>
        
        <Link to="/admin/analytics" className="card hover:shadow-lg transition-shadow">
          <div className="text-center">
            <BarChart3 size={32} className="mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold text-lg mb-2">View Analytics</h3>
            <p className="text-gray-600">See usage statistics and team activity</p>
          </div>
        </Link>
        
        <Link to="/admin/teams" className="card hover:shadow-lg transition-shadow">
          <div className="text-center">
            <Users size={32} className="mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold text-lg mb-2">Manage Teams</h3>
            <p className="text-gray-600">Add teams and reset their progress</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

const QuestionsManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ question: '', category: 'general', difficulty: 'medium' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/admin/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/questions', newQuestion);
      setNewQuestion({ question: '', category: 'general', difficulty: 'medium' });
      setShowAddForm(false);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

         const handleEditQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/questions/${editingQuestion._id}`, editingQuestion);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`/api/admin/questions/${id}`);
        fetchQuestions();
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="loading mx-auto mb-4"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Questions</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4">Add New Question</h3>
          <form onSubmit={handleAddQuestion}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Question</label>
              <textarea
                className="input"
                rows={3}
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  className="select"
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="hypothetical">Hypothetical</option>
                  <option value="creative">Creative</option>
                  <option value="thoughtful">Thoughtful</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  className="select"
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary">Add Question</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
                         {questions.map((question) => (
               <tr key={question._id}>
                 <td>
                   {editingQuestion?._id === question._id ? (
                    <textarea
                      className="input"
                      rows={2}
                      value={editingQuestion.question}
                      onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                    />
                  ) : (
                    question.question
                  )}
                </td>
                <td>
                  {editingQuestion?._id === question._id ? (
                    <select
                      className="select"
                      value={editingQuestion.category}
                      onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value})}
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="hypothetical">Hypothetical</option>
                      <option value="creative">Creative</option>
                      <option value="thoughtful">Thoughtful</option>
                      <option value="general">General</option>
                    </select>
                  ) : (
                    <span className="badge badge-medium">{question.category}</span>
                  )}
                </td>
                <td>
                  {editingQuestion?._id === question._id ? (
                    <select
                      className="select"
                      value={editingQuestion.difficulty}
                      onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value})}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  ) : (
                    <span className={`badge badge-${question.difficulty}`}>{question.difficulty}</span>
                  )}
                </td>
                <td>
                  {editingQuestion?._id === question._id ? (
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-success" 
                        onClick={handleEditQuestion}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setEditingQuestion(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Edit size={14} />
                      </button>
                                             <button 
                         className="btn btn-danger"
                         onClick={() => handleDeleteQuestion(question._id)}
                       >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/usage-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="loading mx-auto mb-4"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>
      
      <div className="grid grid-2 mb-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Usage History</h3>
          <div className="max-h-96 overflow-y-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Question</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.usage?.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.teamName}</td>
                    <td className="text-sm">{entry.questionText.substring(0, 50)}...</td>
                    <td>{new Date(entry.usedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Skipped Questions</h3>
          <div className="max-h-96 overflow-y-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Question</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.skipped?.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.teamName}</td>
                    <td className="text-sm">{entry.questionText.substring(0, 50)}...</td>
                    <td>{new Date(entry.skippedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamsManager = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({ name: '', color: '#3B82F6' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/teams', newTeam);
      setNewTeam({ name: '', color: '#3B82F6' });
      setShowAddForm(false);
      fetchTeams();
    } catch (error) {
      console.error('Failed to add team:', error);
    }
  };

  const handleResetTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to reset all questions for this team?')) {
      try {
        await axios.post(`/api/admin/teams/${teamId}/reset`);
        alert('Team questions reset successfully!');
      } catch (error) {
        console.error('Failed to reset team:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="loading mx-auto mb-4"></div>
        <p>Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Teams</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          Add Team
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4">Add New Team</h3>
          <form onSubmit={handleAddTeam}>
            <div className="grid grid-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team Name</label>
                <input
                  type="text"
                  className="input"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team Color</label>
                <input
                  type="color"
                  className="input"
                  value={newTeam.color}
                  onChange={(e) => setNewTeam({...newTeam, color: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary">Add Team</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

             <div className="grid grid-2">
         {teams.map((team) => (
           <div key={team._id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: team.color }}
                ></div>
                <div>
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <p className="text-gray-600 text-sm">
                    Created: {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleResetTeam(team._id)}
              >
                <RotateCcw size={16} />
                Reset Questions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInterface; 