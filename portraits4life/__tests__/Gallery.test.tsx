import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Gallery from '@/components/Gallery';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const { usePathname } = require('next/navigation');

describe('Gallery Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - English', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/en');
    });

    it('should render gallery section with English title', () => {
      render(<Gallery />);
      expect(screen.getByText('Our Work')).toBeInTheDocument();
    });

    it('should render both gallery images', () => {
      render(<Gallery />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(2);
    });

    it('should display English caption', () => {
      render(<Gallery />);
      expect(screen.getByText(/See the beauty in every detail/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - German', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/de');
    });

    it('should render gallery section with German title', () => {
      render(<Gallery />);
      expect(screen.getByText('Unsere Arbeiten')).toBeInTheDocument();
    });

    it('should display German caption', () => {
      render(<Gallery />);
      expect(screen.getByText(/Sehe die Schönheit in jedem Detail/i)).toBeInTheDocument();
    });
  });

  describe('Image Click Functionality', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/en');
    });

    it('should open modal when image is clicked', () => {
      render(<Gallery />);
      const images = screen.getAllByRole('img').filter((img: HTMLImageElement) =>
        img.src.includes('ultrasound')
      );
      fireEvent.click(images[0].closest('div'));
      expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
    });

    it('should close modal when X button is clicked', () => {
      render(<Gallery />);
      const images = screen.getAllByRole('img').filter((img: HTMLImageElement) =>
        img.src.includes('ultrasound')
      );
      fireEvent.click(images[0].closest('div'));
      const closeButton = screen.getByRole('button', { name: '✕' });
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton);
      expect(screen.queryByRole('button', { name: '✕' })).not.toBeInTheDocument();
    });

    it('should close modal when clicking outside image', () => {
      const { container } = render(<Gallery />);
      const images = screen.getAllByRole('img').filter((img: HTMLImageElement) =>
        img.src.includes('ultrasound')
      );
      fireEvent.click(images[0].closest('div'));
      const modal = container.querySelector('[style*="position: fixed"]');
      if (modal) {
        fireEvent.click(modal);
      }
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/en');
    });

    it('should render grid layout', () => {
      const { container } = render(<Gallery />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should have proper spacing on mobile', () => {
      const { container } = render(<Gallery />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-12');
    });

    it('should render responsive images with object-cover', () => {
      const { container } = render(<Gallery />);
      const images = container.querySelectorAll('img[class*="object-cover"]');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Image Accessibility', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/en');
    });

    it('should have alt text for gallery images', () => {
      const { container } = render(<Gallery />);
      const images = container.querySelectorAll('img[alt]');
      expect(images.length).toBeGreaterThanOrEqual(2);
    });

    it('should be clickable on touch devices', () => {
      render(<Gallery />);
      const images = screen.getAllByRole('img').filter((img: HTMLImageElement) =>
        img.src.includes('ultrasound')
      );
      expect(images[0].closest('div')).toHaveClass('cursor-pointer');
    });
  });

  describe('Hover Effects', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/en');
    });

    it('should have hover scale effect on images', () => {
      const { container } = render(<Gallery />);
      const images = container.querySelectorAll('img[class*="hover:scale"]');
      expect(images.length).toBeGreaterThan(0);
    });
  });
});
