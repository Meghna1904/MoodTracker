db = db.getSiblingDB("moodtracker");

// Remove ALL admin duplicates
db.users.deleteMany({ username: "admin" });

// Insert ONE clean admin with a valid BCrypt hash of "admin123"
db.users.insertOne({
    username: "admin",
    email: "admin@moodtracker.com",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
});

// Create unique index to prevent this in future
db.users.createIndex({ username: 1 }, { unique: true });

print("All users now:");
db.users.find({}, { username: 1, email: 1, _id: 0 }).forEach(printjson);
