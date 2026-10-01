@echo off
echo Starting MongoDB server...
start "MongoDB Server" mongod.exe --dbpath "d:\Mood_tracker\data"

timeout /t 5

echo Connecting to MongoDB...
mongosh --eval "
use moodtracker
db.createCollection('users')
db.createCollection('moods')
db.createCollection('tasks')
db.createCollection('analytics')
db.users.createIndex({email: 1}, {unique: true})
db.moods.createIndex({userId: 1, timestamp: -1})
db.tasks.createIndex({userId: 1, status: 1})
db.users.insertOne({
    username: 'admin', 
    email: 'admin@moodtracker.com', 
    role: 'ADMIN', 
    createdAt: new Date()
})"
pause
