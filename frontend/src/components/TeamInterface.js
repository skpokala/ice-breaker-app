import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, SkipForward, CheckCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TeamInterface = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [userName, setUserName] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      setError('Failed to load teams');
    }
  };

  const fetchNewQuestion = async () => {
    if (!selectedTeam) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`/api/teams/${selectedTeam._id}/question`);
      setCurrentQuestion(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('No more questions available for this team! All questions have been used or skipped.');
      } else {
        setError('Failed to get a new question');
      }
      setCurrentQuestion(null);
    }
    
    setLoading(false);
  };

  const handleUseQuestion = async () => {
    if (!currentQuestion || !selectedTeam || !userName.trim()) return;
    
    try {
      await axios.post(`/api/teams/${selectedTeam._id}/use-question`, {
        questionId: currentQuestion._id,
        userName: userName.trim()
      });
      
      // Get next question
      fetchNewQuestion();
    } catch (error) {
      setError('Failed to mark question as used');
    }
  };

  const handleSkipQuestion = async () => {
    if (!currentQuestion || !selectedTeam || !userName.trim()) return;
    
    try {
      await axios.post(`/api/teams/${selectedTeam._id}/skip-question`, {
        questionId: currentQuestion._id,
        userName: userName.trim()
      });
      
      // Get next question
      fetchNewQuestion();
    } catch (error) {
      setError('Failed to skip question');
    }
  };

  const selectTeam = (team) => {
    setSelectedTeam(team);
    setUserName('');
    setCurrentQuestion(null);
    setError('');
    fetchUserSuggestions(team._id);
  };

  const fetchUserSuggestions = async (teamId) => {
    try {
      // Get suggestions from both team-specific and global users
      const [teamUsers, allUsers] = await Promise.all([
        axios.get(`/api/teams/${teamId}/users`),
        axios.get('/api/users')
      ]);
      
      // Combine suggestions, prioritizing team-specific users
      const suggestions = [...new Set([...teamUsers.data, ...allUsers.data])];
      setUserSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to fetch user suggestions:', error);
      setUserSuggestions([]);
    }
  };

  const handleUserNameChange = (value) => {
    setUserName(value);
    setShowSuggestions(value.length > 0);
  };

  const selectUserSuggestion = (suggestion) => {
    setUserName(suggestion);
    setShowSuggestions(false);
  };

  const handleUserNameSubmit = () => {
    if (userName.trim()) {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users size={32} className="text-white" />
          <h1 className="text-3xl font-bold text-white">Team Ice Breaker</h1>
        </div>
        <p className="text-white/80">Select your team and get random ice breaker questions</p>
        <Link to="/admin" className="btn btn-secondary mt-4">
          <Settings size={16} />
          Admin Panel
        </Link>
      </div>

      {/* Team Selection */}
      {!selectedTeam && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Team</h2>
          <div className="grid grid-3">
            {teams.map((team) => (
              <div
                key={team._id}
                className="team-card"
                style={{ backgroundColor: team.color + '20', borderColor: team.color }}
                onClick={() => selectTeam(team)}
              >
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-3"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Name Input */}
      {selectedTeam && !userName.trim() && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: selectedTeam.color }}
            ></div>
            <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
          </div>
          
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your name?
            </label>
            <div className="relative">
              <input
                type="text"
                value={userName}
                onChange={(e) => handleUserNameChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUserNameSubmit()}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              
              {/* Auto-suggestions dropdown */}
              {showSuggestions && userSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {userSuggestions
                    .filter(suggestion => 
                      suggestion.toLowerCase().includes(userName.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => selectUserSuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            
            <button
              className="btn btn-primary w-full mt-4"
              onClick={handleUserNameSubmit}
              disabled={!userName.trim()}
            >
              Continue
            </button>
            
            <button 
              className="btn btn-secondary w-full mt-2"
              onClick={() => setSelectedTeam(null)}
            >
              Change Team
            </button>
          </div>
        </div>
      )}

      {/* Question Interface */}
      {selectedTeam && userName.trim() && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: selectedTeam.color }}
              ></div>
              <div>
                <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                <p className="text-gray-600">Welcome, {userName}!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-outline text-sm"
                onClick={() => setUserName('')}
              >
                Change User
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedTeam(null)}
              >
                Change Team
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!currentQuestion && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">Ready to get your first ice breaker question?</p>
              <button 
                className="btn btn-primary"
                onClick={fetchNewQuestion}
              >
                <RefreshCw size={16} />
                Get Question
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="loading mx-auto mb-4"></div>
              <p className="text-gray-600">Getting your question...</p>
            </div>
          )}

          {currentQuestion && (
            <div className="question-card">
              <div className="mb-6">
                <span className={`badge badge-${currentQuestion.difficulty}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="badge badge-medium ml-2">
                  {currentQuestion.category}
                </span>
              </div>
              
              <h3 className="text-2xl font-semibold mb-8 leading-relaxed">
                {currentQuestion.question}
              </h3>
              
              <div className="flex gap-4 justify-center">
                <button 
                  className="btn btn-success"
                  onClick={handleUseQuestion}
                >
                  <CheckCircle size={16} />
                  Use This Question
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={handleSkipQuestion}
                >
                  <SkipForward size={16} />
                  Skip Question
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={fetchNewQuestion}
                >
                  <RefreshCw size={16} />
                  Get New Question
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamInterface; 