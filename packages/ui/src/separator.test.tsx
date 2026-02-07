import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Separator } from './separator';

describe('Separator', () => {
  test('renders correctly', () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  test('has horizontal orientation by default', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveClass('h-px');
    expect(separator).toHaveClass('w-full');
  });

  test('applies vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator).toHaveClass('h-full');
    expect(separator).toHaveClass('w-px');
  });

  test('has role="none" when decorative (default)', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'none');
  });

  test('has role="separator" when not decorative', () => {
    render(<Separator decorative={false} data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  test('has aria-orientation when not decorative and vertical', () => {
    render(<Separator decorative={false} orientation="vertical" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('applies custom className', () => {
    render(<Separator className="custom-class" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-class');
  });

  test('has data-slot attribute', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-slot', 'separator');
  });
});
