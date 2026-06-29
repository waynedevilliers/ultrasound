-- Create orders table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
