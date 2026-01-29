import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  test('renders correctly', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  test('applies different variants', () => {
    const { rerender } = render(<Badge variant="red">Red</Badge>);
    const redBadge = screen.getByText('Red').closest('span');
    expect(redBadge).toHaveClass('bg-red-500/15');
    
    rerender(<Badge variant="blue">Blue</Badge>);
    const blueBadge = screen.getByText('Blue').closest('span');
    expect(blueBadge).toHaveClass('bg-blue-500/15');
    
    rerender(<Badge variant="green">Green</Badge>);
    const greenBadge = screen.getByText('Green').closest('span');
    expect(greenBadge).toHaveClass('bg-green-500/15');
    
    rerender(<Badge variant="default">Default</Badge>);
    const defaultBadge = screen.getByText('Default').closest('span');
    expect(defaultBadge).toHaveClass('bg-transparent');
  });

  test('applies different sizes', () => {
    const { rerender } = render(<Badge size="xs">Extra Small</Badge>);
    const xsBadge = screen.getByText('Extra Small').closest('span');
    expect(xsBadge).toHaveClass('text-[0.625rem]');
    
    rerender(<Badge size="sm">Small</Badge>);
    const smBadge = screen.getByText('Small').closest('span');
    expect(smBadge).toHaveClass('text-xs');
    
    rerender(<Badge size="default">Default</Badge>);
    const defaultBadge = screen.getByText('Default').closest('span');
    expect(defaultBadge).toHaveClass('text-xs');
  });

  test('supports custom status indicator with span', () => {
    render(
      <Badge data-testid="badge">
        <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" data-testid="status-dot"></span>
        Status
      </Badge>
    );
    const badge = screen.getByTestId('badge');
    const statusDot = screen.getByTestId('status-dot');
    expect(badge).toBeInTheDocument();
    expect(statusDot).toBeInTheDocument();
    expect(statusDot).toHaveClass('rounded-full');
    expect(statusDot).toHaveClass('bg-green-500');
  });

  test('applies custom className', () => {
    render(<Badge className="test-class">Custom Class</Badge>);
    const badge = screen.getByText('Custom Class').closest('span');
    expect(badge).toHaveClass('test-class');
  });

  test('renders as a button when asButton is true', () => {
    render(<Badge asButton>Button Badge</Badge>);
    const button = screen.getByRole('button', { name: 'Button Badge' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('cursor-pointer');
  });

  test('calls onClick when clicked as a button', () => {
    const handleClick = vi.fn();
    render(<Badge asButton onClick={handleClick}>Clickable Badge</Badge>);
    const button = screen.getByRole('button', { name: 'Clickable Badge' });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('calls onClick when clicked as a span', () => {
    const handleClick = vi.fn();
    render(<Badge onClick={handleClick}>Clickable Span</Badge>);
    const span = screen.getByText('Clickable Span');
    fireEvent.click(span);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant and size to button badge', () => {
    render(
      <Badge asButton variant="blue" size="sm">
        Blue Button
      </Badge>
    );
    const button = screen.getByRole('button', { name: 'Blue Button' });
    expect(button).toHaveClass('bg-blue-500/15');
    expect(button).toHaveClass('text-xs');
  });

  test('button has type="button" by default', () => {
    render(<Badge asButton>Default Button</Badge>);
    const button = screen.getByRole('button', { name: 'Default Button' });
    expect(button).toHaveAttribute('type', 'button');
  });

  test('renders clickable badges correctly', () => {
    const { rerender } = render(<Badge asButton>Button Badge</Badge>);
    const button = screen.getByRole('button', { name: 'Button Badge' });
    expect(button).toBeInTheDocument();
    
    rerender(<Badge onClick={() => {}}>Clickable Span</Badge>);
    const span = screen.getByText('Clickable Span');
    expect(span).toBeInTheDocument();
  });

  test('does not apply cursor-pointer class when no onClick handler', () => {
    render(<Badge>Regular Badge</Badge>);
    const span = screen.getByText('Regular Badge');
    expect(span).not.toHaveClass('cursor-pointer');
  });
}); 