const pool = require('./db');

async function seedRealData() {
  try {
    console.log('Seeding real portfolio data...');

    // 1. Clear old data
    await pool.query('TRUNCATE TABLE projects;');
    await pool.query('TRUNCATE TABLE skills;');
    await pool.query('TRUNCATE TABLE experience;');

    // 2. Insert Experience
    const exp1Bullets = JSON.stringify([
      "Engineered and launched a comprehensive Customer Business Unit (CBU) platform with unified Admin/Employee and Client panels, featuring task lifecycle management, calendar scheduling, daily trackers, and robust Role-Based Access Control (RBAC).",
      "Developed an enterprise-level Learning Management System (LMS) for PBGI, including complex course bundles, coupon management, question banks, instructor/membership management, and support for multi-learning modes.",
      "Designed a Room Booking Engine (Rambihariplace) with real-time availability, an administrative booking panel, offline reservation support, and successful integration of the Razorpay payment gateway.",
      "Built and optimized a School ERP (Sunhill Academy) covering inquiries, career applications, grievances, and digital TC records with student-side verification.",
      "Improved API response time and system scalability by optimizing MySQL queries through advanced indexing and structured database relationship design.",
      "Significantly enhanced code quality and maintainability by implementing a modular architecture, robust input validation, and secure middleware flows."
    ]);
    
    const exp2Bullets = JSON.stringify([
      "Contributed to foundational backend module development, including CRUD operations and secure authentication systems, utilizing Node.js, Express, and MySQL.",
      "Assisted in the design of the early backend modules and database schema for Noline (Salon-User Appointment System).",
      "Collaborated with senior developers on debugging, API integrations, and performance tuning for existing systems."
    ]);

    await pool.query(
      `INSERT INTO experience (role, company, duration, type, bullets, sort_order) VALUES 
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?)`,
      [
        'BACKEND DEVELOPER', 'ZULU IT SOLUTIONS', 'Jan 2024 – Present', 'FULL_TIME', exp1Bullets, 1,
        'BACKEND DEVELOPER INTERN', 'ZULU IT SOLUTIONS', 'Aug 2023 – Dec 2023', 'INTERNSHIP', exp2Bullets, 2
      ]
    );

    // 3. Insert Skills
    const skills = [
      ['Node.js', 'BACKEND', 95, 1],
      ['Express.js', 'BACKEND', 90, 2],
      ['RESTful APIs', 'BACKEND', 95, 3],
      ['MVC Architecture', 'BACKEND', 85, 4],
      ['JWT & bcrypt', 'SECURITY', 90, 5],
      ['RBAC', 'SECURITY', 85, 6],
      ['Razorpay Integration', 'TOOLS', 85, 7],
      ['MySQL', 'DATABASE', 90, 8],
      ['MongoDB', 'DATABASE', 60, 9],
      ['JavaScript (ES6+)', 'FRONTEND', 90, 10],
      ['Tailwind CSS', 'FRONTEND', 85, 11],
      ['Git & GitHub', 'TOOLS', 85, 12],
      ['Railway/Render Deployment', 'TOOLS', 80, 13]
    ];

    for (const s of skills) {
      await pool.query(
        'INSERT INTO skills (name, category, level, sort_order) VALUES (?, ?, ?, ?)',
        [s[0], s[1], s[2], s[3]]
      );
    }

    // 4. Insert Projects (derived from experience)
    const projects = [
      [
        'CBU Platform', 
        'Comprehensive Customer Business Unit platform with unified Admin/Employee and Client panels, featuring task lifecycle management, calendar scheduling, daily trackers, and RBAC.',
        JSON.stringify(['Node.js', 'Express', 'MySQL', 'RBAC']),
        'LIVE', null, null, 1, 1
      ],
      [
        'Enterprise LMS (PBGI)', 
        'Learning Management System featuring complex course bundles, coupon management, question banks, instructor/membership management, and support for multi-learning modes.',
        JSON.stringify(['Node.js', 'Express', 'MySQL']),
        'LIVE', null, null, 1, 2
      ],
      [
        'Room Booking Engine (Rambihariplace)', 
        'Real-time availability engine, an administrative booking panel, offline reservation support, and Razorpay payment gateway integration.',
        JSON.stringify(['Node.js', 'Express', 'Razorpay', 'MySQL']),
        'LIVE', null, null, 1, 3
      ],
      [
        'School ERP (Sunhill Academy)', 
        'ERP covering inquiries, career applications, grievances, and digital TC records with student-side verification.',
        JSON.stringify(['Node.js', 'Express', 'MySQL']),
        'LIVE', null, null, 0, 4
      ]
    ];

    for (const p of projects) {
      await pool.query(
        'INSERT INTO projects (title, description, tech_stack, status, github_url, live_url, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        p
      );
    }

    console.log('✅ Portfolio data successfully populated!');
    process.exit(0);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seedRealData();
