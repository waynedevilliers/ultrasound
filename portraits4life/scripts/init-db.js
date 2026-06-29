require('dotenv').config({ path: '.env.development.local' });
const { neon } = require('@neondatabase/serverless');

async function initDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        product VARCHAR(50) NOT NULL,
        canvas_size VARCHAR(50),
        child_name VARCHAR(255),
        weeks_in_womb VARCHAR(50),
        special_requests TEXT,
        ultrasound_image_url TEXT,
        reference_image_url TEXT,
        shipping_address JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`;

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;

    console.log('✓ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
