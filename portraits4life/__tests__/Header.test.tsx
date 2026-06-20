import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render logo', () => {
      usePathname.mockReturnValue('/en');
      render(<Header />);
      const logo = screen.getByAltText('Portraits 4 Life');
      expect(logo).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      usePathname.mockReturnValue('/en');
      render(<Header />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Order')).toBeInTheDocument();
      expect(screen.getByText('Formats')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('Language Switching - English Page', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/en');
      delete (window as any).location;
      (window as any).location = { href: '' };
    });

    it('should display English navigation on /en route', () => {
      render(<Header />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Order')).toBeInTheDocument();
    });

    it('should show DE button on English page', () => {
      render(<Header />);
      const langButton = screen.getByText('DE');
      expect(langButton).toBeInTheDocument();
    });

    it('should switch to German when DE button clicked', () => {
      render(<Header />);
      const deButton = screen.getByText('DE');
      fireEvent.click(deButton);
      expect((window as any).location.href).toContain('/de');
    });
  });

  describe('Language Switching - German Page', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/de');
      delete (window as any).location;
      (window as any).location = { href: '' };
    });

    it('should display German navigation on /de route', () => {
      render(<Header />);
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('Bestellen')).toBeInTheDocument();
    });

    it('should show EN button on German page', () => {
      render(<Header />);
      const langButton = screen.getByText('EN');
      expect(langButton).toBeInTheDocument();
    });

    it('should switch to English when EN button clicked', () => {
      render(<Header />);
      const enButton = screen.getByText('EN');
      fireEvent.click(enButton);
      expect((window as any).location.href).toContain('/en');
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for Order link on English page', () => {
      usePathname.mockReturnValue('/en');
      render(<Header />);
      const orderLink = screen.getByText('Order').closest('a');
      expect(orderLink).toHaveAttribute('href', '/en/order');
    });

    it('should have correct href for Order link on German page', () => {
      usePathname.mockReturnValue('/de');
      render(<Header />);
      const orderLink = screen.getByText('Bestellen').closest('a');
      expect(orderLink).toHaveAttribute('href', '/de/order');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render header with responsive classes', () => {
      usePathname.mockReturnValue('/en');
      const { container } = render(<Header />);
      expect(container.querySelector('nav')).toHaveClass('flex');
      expect(container.querySelector('nav')).toHaveClass('justify-between');
    });
  });
});
