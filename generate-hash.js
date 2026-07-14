/**
 * Run this once to generate a bcrypt hash for your admin password.
 * Usage: node generate-hash.js
 */
const bcrypt = require('bcryptjs');

const password = 'admin123'; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) { console.error('Error:', err); return; }
  console.log('\n✅ Password hash generated successfully!\n');
  console.log('Password:', password);
  console.log('Hash:    ', hash);
  console.log('\nRun this SQL to update your admin password:');
  console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE username = 'admin';\n`);
});
