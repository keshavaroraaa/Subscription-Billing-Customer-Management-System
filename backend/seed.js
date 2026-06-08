const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      ['admin@example.com', hashedPassword, 'Admin User']
    );

    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
