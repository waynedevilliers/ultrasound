import { sql } from '@vercel/postgres';

export interface Order {
  id: number;
  name: string;
  email: string;
  product: 'digital' | 'canvas';
  canvas_size?: string;
  child_name?: string;
  weeks_in_womb?: string;
  special_requests?: string;
  ultrasound_image_url?: string;
  reference_image_url?: string;
  shipping_address?: any;
  status: string;
  created_at: string;
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        product VARCHAR(50) NOT NULL CHECK (product IN ('digital', 'canvas')),
        canvas_size VARCHAR(50),
        child_name VARCHAR(255),
        weeks_in_womb VARCHAR(50),
        special_requests TEXT,
        ultrasound_image_url TEXT,
        reference_image_url TEXT,
        shipping_address JSONB,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function getOrder(id: number): Promise<Order | null> {
  try {
    const result = await sql`SELECT * FROM orders WHERE id = ${id}`;
    return (result.rows[0] as Order) || null;
  } catch (error) {
    console.error('Get order error:', error);
    return null;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const result = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    return result.rows as Order[];
  } catch (error) {
    console.error('Get orders error:', error);
    return [];
  }
}

export async function updateOrderStatus(
  id: number,
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'
): Promise<boolean> {
  try {
    await sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Update order error:', error);
    return false;
  }
}
