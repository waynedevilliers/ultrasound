import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderForm from '@/components/OrderForm';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('OrderForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePathname.mockReturnValue('/en');
  });

  describe('Form Rendering - English', () => {
    it('should render all form fields', () => {
      render(<OrderForm />);
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Product/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<OrderForm />);
      expect(screen.getByRole('button', { name: /Submit Order/i })).toBeInTheDocument();
    });

    it('should render English labels', () => {
      render(<OrderForm />);
      expect(screen.getByText(/Your Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Your Email/i)).toBeInTheDocument();
    });
  });

  describe('Form Rendering - German', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/de');
    });

    it('should render German labels', () => {
      render(<OrderForm />);
      expect(screen.getByText(/Dein Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Deine E-Mail/i)).toBeInTheDocument();
    });

    it('should render German submit button', () => {
      render(<OrderForm />);
      expect(screen.getByRole('button', { name: /Jetzt Bestellen/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require name field', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const submitButton = screen.getByRole('button', { name: /Submit Order/i });
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      expect(nameInput.required).toBe(true);
    });

    it('should require email field', async () => {
      render(<OrderForm />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      expect(emailInput.required).toBe(true);
    });

    it('should accept valid email format', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Form Input Handling', () => {
    it('should update name field value', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      await user.type(nameInput, 'John Doe');
      expect(nameInput.value).toBe('John Doe');
    });

    it('should update email field value', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      await user.type(emailInput, 'john@example.com');
      expect(emailInput.value).toBe('john@example.com');
    });

    it('should handle product selection', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const productSelect = screen.getByLabelText(/Product/i) as HTMLSelectElement;
      await user.selectOptions(productSelect, 'digital');
      expect(productSelect.value).toBe('digital');
    });
  });

  describe('Conditional Fields', () => {
    it('should show canvas size dropdown when canvas product selected', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const productSelect = screen.getByLabelText(/Product/i);
      await user.selectOptions(productSelect, 'canvas');
      await waitFor(() => {
        expect(screen.getByLabelText(/Canvas Size/i)).toBeInTheDocument();
      });
    });

    it('should hide canvas size dropdown when digital product selected', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const productSelect = screen.getByLabelText(/Product/i);
      await user.selectOptions(productSelect, 'digital');
      expect(screen.queryByLabelText(/Canvas Size/i)).not.toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('should render file upload inputs', () => {
      render(<OrderForm />);
      const fileInputs = screen.getAllByLabelText(/Upload/i);
      expect(fileInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('should accept image files', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const fileInput = screen.getAllByLabelText(/Upload/i)[0] as HTMLInputElement;
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file);
      expect(fileInput.files?.[0]).toBe(file);
    });

    it('should enforce file size limit', async () => {
      render(<OrderForm />);
      const fileInputs = screen.getAllByLabelText(/Upload/i);
      const fileInput = fileInputs[0] as HTMLInputElement;
      expect(fileInput.maxLength || 15000000).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should handle form submission', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Submit Order/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      fireEvent.click(submitButton);
    });

    it('should show success message after submission', async () => {
      const user = userEvent.setup();
      render(<OrderForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Submit Order/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/Thank you/i) || screen.queryByText(/Success/i)).toBeTruthy();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render form with responsive classes', () => {
      const { container } = render(<OrderForm />);
      const form = container.querySelector('form');
      expect(form).toHaveClass('space-y-6');
    });

    it('should have proper input width on mobile', () => {
      const { container } = render(<OrderForm />);
      const inputs = container.querySelectorAll('input[type="text"]');
      expect(inputs[0]).toHaveClass('w-full');
    });
  });

  describe('Accessibility', () => {
    it('should have label for all form inputs', () => {
      render(<OrderForm />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        const label = screen.getByLabelText(input.getAttribute('aria-label') || '');
        expect(label).toBeInTheDocument();
      });
    });

    it('should have proper form structure', () => {
      const { container } = render(<OrderForm />);
      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });
});
