const pool = require('./db');

async function createGearTable() {
  try {
    console.log('Creating gear table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gear (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        affiliate_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Seeding gear table...');
    await pool.query(`
      INSERT IGNORE INTO gear (id, title, category, description, image_url, affiliate_url, sort_order) VALUES
      (1, 'MacBook Pro 16" (M3 Max)', 'HARDWARE', 'My primary workhorse for full-stack development and heavy lifting.', 'https://m.media-amazon.com/images/I/61bwiPRcv2L._AC_SL1500_.jpg', 'https://amazon.com', 1),
      (2, 'Keychron K2 Wireless Mechanical Keyboard', 'ACCESSORIES', 'Tactile, satisfying, and essential for long coding sessions.', 'https://m.media-amazon.com/images/I/61D4Z3yN8aL._AC_SL1500_.jpg', 'https://amazon.com', 2),
      (3, 'Clean Code by Robert C. Martin', 'BOOKS', 'The must-read handbook for writing elegant, maintainable code.', 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg', 'https://amazon.com', 3);
    `);
    
    console.log('Gear table created and seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createGearTable();
