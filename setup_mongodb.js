// MongoDB Setup Script
use moodtracker

// Create collections
db.createCollection('users')
db.createCollection('moods')
db.createCollection('tasks')
db.createCollection('analytics')

// Create indexes
db.users.createIndex({email: 1}, {unique: true})
db.moods.createIndex({userId: 1, timestamp: -1})
db.tasks.createIndex({userId: 1, status: 1})

// Insert an admin user
db.users.insertOne({
    username: 'admin', 
    email: 'admin@moodtracker.com', 
    role: 'ADMIN', 
    createdAt: new Date(),
    password: 'temporaryHashedPassword'
})

// Verify collections
show collections

// Verify admin user
db.users.find({username: 'admin'})
