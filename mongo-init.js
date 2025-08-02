// MongoDB initialization script
db = db.getSiblingDB('icebreaker');

// Create collections with validation
db.createCollection('questions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['question', 'category', 'difficulty'],
      properties: {
        question: {
          bsonType: 'string',
          description: 'Question text is required'
        },
        category: {
          bsonType: 'string',
          enum: ['personal', 'work', 'hypothetical', 'creative', 'thoughtful', 'general'],
          description: 'Category must be one of the allowed values'
        },
        difficulty: {
          bsonType: 'string',
          enum: ['easy', 'medium', 'hard'],
          description: 'Difficulty must be one of the allowed values'
        }
      }
    }
  }
});

db.createCollection('teams', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'color'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Team name is required'
        },
        color: {
          bsonType: 'string',
          description: 'Team color is required'
        }
      }
    }
  }
});

// Create indexes
db.questions.createIndex({ "category": 1 });
db.questions.createIndex({ "difficulty": 1 });
db.teams.createIndex({ "name": 1 }, { unique: true });
db.usagehistories.createIndex({ "teamId": 1, "questionId": 1 }, { unique: true });
db.skippedquestions.createIndex({ "teamId": 1, "questionId": 1 }, { unique: true });

print('Database initialized successfully!'); 