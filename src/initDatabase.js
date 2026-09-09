const db = require("./database");

const insertQuery = `
INSERT INTO tasks (user_id, title, description, status)
VALUES

-- Rakesh - user_id 1
(1, 'Learn Node.js',
 'Complete Node.js fundamentals and understand modules',
 'completed'),

(1, 'Build Task Manager API',
 'Create authentication and CRUD APIs using Express',
 'completed'),

(1, 'Learn JWT Authentication',
 'Understand JWT creation, verification and middleware',
 'pending'),

(1, 'Build React Frontend',
 'Create the frontend for the Task Manager application',
 'pending'),

-- Ravi Kumar - user_id 2
(2, 'Learn JavaScript',
 'Practice ES6 features and asynchronous JavaScript',
 'completed'),

(2, 'Learn Express.js',
 'Build REST APIs using Express',
 'pending'),

(2, 'Create Portfolio',
 'Build a personal developer portfolio',
 'pending'),

-- Suresh Reddy - user_id 3
(3, 'Learn React',
 'Learn components, props, state and hooks',
 'completed'),

(3, 'Build Login Page',
 'Create responsive login and registration pages',
 'pending'),

(3, 'Connect Frontend API',
 'Connect React frontend with the backend APIs',
 'pending'),

(3, 'Deploy Application',
 'Deploy the application to production',
 'pending'),

-- Anil Sharma - user_id 4
(4, 'Learn SQL',
 'Practice SELECT, INSERT, UPDATE and DELETE queries',
 'completed'),

(4, 'Learn SQLite',
 'Understand SQLite database operations with Node.js',
 'completed'),

(4, 'Build Database Schema',
 'Create users and tasks database tables',
 'pending'),

-- Priya Singh - user_id 5
(5, 'Learn HTML',
 'Practice semantic HTML and forms',
 'completed'),

(5, 'Learn CSS',
 'Practice Flexbox, Grid and responsive design',
 'completed'),

(5, 'Build Landing Page',
 'Create a responsive landing page',
 'pending'),

(5, 'Learn Bootstrap',
 'Practice Bootstrap components and utilities',
 'pending'),

-- Kiran Kumar - user_id 6
(6, 'Learn Git',
 'Learn Git commands and version control',
 'completed'),

(6, 'Create GitHub Repository',
 'Create repository and push project code',
 'completed'),

(6, 'Learn CI/CD',
 'Understand GitHub Actions and deployment pipelines',
 'pending'),

-- Arjun Reddy - user_id 7
(7, 'Learn TypeScript',
 'Understand TypeScript types and interfaces',
 'pending'),

(7, 'Build REST API',
 'Create a REST API using Node.js and Express',
 'completed'),

(7, 'Add Authentication',
 'Implement JWT based authentication',
 'pending'),

(7, 'Write API Documentation',
 'Document API endpoints and request responses',
 'pending'),

-- Admin User - user_id 8
(8, 'Review Users',
 'Review registered users in the system',
 'pending'),

(8, 'Review Tasks',
 'Review task activity across users',
 'completed');
`;

db.run(insertQuery, function (error) {

    if (error) {

        console.error("Error inserting tasks:", error.message);

    } else {

        console.log(`${this.changes} tasks inserted successfully`);

    }

    db.close();

});