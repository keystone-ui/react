import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  test('renders correctly', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  test('applies different variants', () => {
    const { rerender } = render(<Badge variant="red">Red</Badge>);
    const redBadge = screen.getByText('Red').closest('div');
    expect(redBadge).toHaveClass('bg-red-500/15');
    
    rerender(<Badge variant="blue">Blue</Badge>);
    const blueBadge = screen.getByText('Blue').closest('div');
    expect(blueBadge).toHaveClass('bg-blue-500/15');
    
    rerender(<Badge variant="green">Green</Badge>);
    const greenBadge = screen.getByText('Green').closest('div');
    expect(greenBadge).toHaveClass('bg-green-500/15');
    
    rerender(<Badge variant="default">Default</Badge>);
    const defaultBadge = screen.getByText('Default').closest('div');
    expect(defaultBadge).toHaveClass('bg-transparent');
  });

  test('applies different sizes', () => {
    const { rerender } = render(<Badge size="xs">Extra Small</Badge>);
    const xsBadge = screen.getByText('Extra Small').closest('div');
    expect(xsBadge).toHaveClass('text-[0.625rem]');
    
    rerender(<Badge size="sm">Small</Badge>);
    const smBadge = screen.getByText('Small').closest('div');
    expect(smBadge).toHaveClass('text-xs');
    
    rerender(<Badge size="default">Default</Badge>);
    const defaultBadge = screen.getByText('Default').closest('div');
    expect(defaultBadge).toHaveClass('text-xs');
  });

  test('supports custom status indicator with span', () => {
    render(
      <Badge>
        <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
        Status
      </Badge>
    );
    const badge = screen.getByText('Status');
    const statusDot = badge.previousSibling;
    expect(statusDot).toBeInTheDocument();
    expect(statusDot).toHaveClass('rounded-full');
    expect(statusDot).toHaveClass('bg-green-500');
  });

  test('applies custom className', () => {
    render(<Badge className="test-class">Custom Class</Badge>);
    const badge = screen.getByText('Custom Class').closest('div');
    expect(badge).toHaveClass('test-class');
  });

  test('wraps children in a span with proper classes', () => {
    render(<Badge>Test Content</Badge>);
    const badge = screen.getByText('Test Content');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('gap-1.5');
  });
}); 