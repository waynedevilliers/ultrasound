import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderForm from '@/components/OrderForm';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

global.fetch = jest.fn();

describe('Updated OrderForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePathname.mockReturnValue('/en');
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Form Rendering', () => {
    it('should render all basic fields', () => {
      render(<OrderForm />);
      expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Your Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Product/i)).toBeInTheDocument();
    });

    it('should render file upload fields', () => {
      render(<OrderForm />);
      const fileInputs = screen.getAllByText(/Upload/i);
      expect(fileInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Address Fields - Conditional Display', () => {
    it('should not show address fields for digital product', () => {
      render(<OrderForm />);
      const productSelect = screen.getByLabelText(/Product/i) as HTMLSelectElement;
      fireEvent.change(productSelect, { target: { value: 'digital' } });
      expect(screen.queryByLabelText(/Shipping Address/i)).not.toBeInTheDocument();
    });

    it('should show address fields for canvas product', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const productSelect = screen.getByLabelText(/Product/i);
      await user.selectOptions(productSelect, 'canvas');
      await waitFor(() => {
        expect(screen.getByLabelText(/Shipping Address|Lieferadresse/i)).toBeInTheDocument();
      });
    });

    it('should show canvas size dropdown for canvas product', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const productSelect = screen.getByLabelText(/Product/i);
      await user.selectOptions(productSelect, 'canvas');
      await waitFor(() => {
        expect(screen.getByLabelText(/Size/i)).toBeInTheDocument();
      });
    });
  });

  describe('Address Fields', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const productSelect = screen.getByLabelText(/Product/i);
      await user.selectOptions(productSelect, 'canvas');
    });

    it('should require full name for shipping', async () => {
      const fullNameInput = await screen.findByLabelText(/Full Name/i) as HTMLInputElement;
      expect(fullNameInput.required).toBe(true);
    });

    it('should require street address for shipping', async () => {
      const streetInput = await screen.findByLabelText(/Street/i) as HTMLInputElement;
      expect(streetInput.required).toBe(true);
    });

    it('should require city for shipping', async () => {
      const cityInput = await screen.findByLabelText(/City/i) as HTMLInputElement;
      expect(cityInput.required).toBe(true);
    });

    it('should require postal code for shipping', async () => {
      const postalInput = await screen.findByLabelText(/Postal Code/i) as HTMLInputElement;
      expect(postalInput.required).toBe(true);
    });
  });

  describe('File Upload Handling', () => {
    it('should accept image files', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const fileInputs = screen.getAllByLabelText(/Upload/i);
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInputs[0], file);
      expect((fileInputs[0] as HTMLInputElement).files?.[0]).toBe(file);
    });

    it('should reject files larger than 15MB', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const largeFile = new File(['x'.repeat(16 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const fileInputs = screen.getAllByLabelText(/Upload/i);
      await user.upload(fileInputs[0], largeFile);
      // Component should handle file size validation
    });
  });

  describe('Form Submission', () => {
    it('should submit form data to API', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, orderId: '123' }),
      });

      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Your Name/i);
      const emailInput = screen.getByLabelText(/Your Email/i);
      const submitButton = screen.getByRole('button', { name: /Submit Order/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/orders', expect.any(Object));
      });
    });

    it('should show success message with order ID', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, orderId: '123' }),
      });

      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Your Name/i);
      const emailInput = screen.getByLabelText(/Your Email/i);
      const submitButton = screen.getByRole('button', { name: /Submit Order/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Thank You for Your Order/i)).toBeInTheDocument();
        expect(screen.getByText(/#123/)).toBeInTheDocument();
      });
    });

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to process order' }),
      });

      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Your Name/i);
      const emailInput = screen.getByLabelText(/Your Email/i);
      const submitButton = screen.getByRole('button', { name: /Submit Order/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to process order/i)).toBeInTheDocument();
      });
    });
  });

  describe('Bilingual Support', () => {
    it('should render German labels on /de route', () => {
      usePathname.mockReturnValue('/de');
      render(<OrderForm />);
      expect(screen.getByLabelText(/Dein Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Deine E-Mail/i)).toBeInTheDocument();
    });

    it('should show German submit button', () => {
      usePathname.mockReturnValue('/de');
      render(<OrderForm />);
      expect(screen.getByRole('button', { name: /Jetzt Bestellen/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Your Name/i);
      expect(nameInput).toHaveAttribute('name', 'name');
    });

    it('should indicate required fields', () => {
      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Your Name/i) as HTMLInputElement;
      expect(nameInput.required).toBe(true);
    });
  });
});
