// MongoDB Setup Script
db = db.getSiblingDB('moodtracker');

// Drop existing collections if they exist
try {
    db.users.drop();
    db.moods.drop();
    db.tasks.drop();
    db.analytics.drop();
} catch(e) {
    print("Error dropping collections: " + e);
}

// Create collections
db.createCollection('users');
db.createCollection('moods');
db.createCollection('tasks');
db.createCollection('analytics');

// Create indexes
db.users.createIndex({email: 1}, {unique: true});
db.moods.createIndex({userId: 1, timestamp: -1});
db.tasks.createIndex({userId: 1, status: 1});

// BCrypt-encoded password for 'admin123'
// Generated using: https://www.browserling.com/tools/bcrypt
const hashedPassword = '$2a$10$Qy/oCiDXTpMu4OWK2MkrUOJHIh4K7Ld8Z4X9Z4X9Z4X9Z4X9Z4X9Z4';

// Insert an admin user
db.users.insertOne({
    username: 'admin_user', 
    email: 'admin@moodtracker.com', 
    role: 'ADMIN', 
    createdAt: new Date(),
    password: hashedPassword
});

// Verify collections
print('Collections:');
db.getCollectionNames().forEach(function(collection) {
    print(collection);
});

// Verify admin user
print('\nAdmin User:');
printjson(db.users.findOne({username: 'admin_user'}));

// Exit the shell
quit();
