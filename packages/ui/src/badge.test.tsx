import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  test('renders correctly with default props', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('SPAN');
  });

  test('has data-slot="badge"', () => {
    render(<Badge>Slotted</Badge>);
    const badge = screen.getByText('Slotted');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  // ---------------------------------------------------------------------------
  // Variants
  // ---------------------------------------------------------------------------

  test('applies default variant classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  test('applies secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-secondary');
    expect(badge).toHaveClass('text-secondary-foreground');
  });

  test('applies destructive variant classes', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText('Destructive');
    expect(badge).toHaveClass('text-destructive');
  });

  test('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('border-border');
    expect(badge).toHaveClass('text-foreground');
  });

  test('applies ghost variant classes', () => {
    render(<Badge variant="ghost">Ghost</Badge>);
    const badge = screen.getByText('Ghost');
    expect(badge).toBeInTheDocument();
  });

  test('applies link variant classes', () => {
    render(<Badge variant="link">Link</Badge>);
    const badge = screen.getByText('Link');
    expect(badge).toHaveClass('text-primary');
  });

  // ---------------------------------------------------------------------------
  // Sizes
  // ---------------------------------------------------------------------------

  test('applies default size', () => {
    render(<Badge size="default">Default Size</Badge>);
    const badge = screen.getByText('Default Size');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('h-5');
  });

  test('applies sm size', () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText('Small');
    expect(badge).toHaveClass('text-[10px]');
    expect(badge).toHaveClass('h-4');
  });

  // ---------------------------------------------------------------------------
  // Custom className
  // ---------------------------------------------------------------------------

  test('applies custom className', () => {
    render(<Badge className="test-class">Custom Class</Badge>);
    const badge = screen.getByText('Custom Class');
    expect(badge).toHaveClass('test-class');
  });

  // ---------------------------------------------------------------------------
  // Render prop
  // ---------------------------------------------------------------------------

  test('renders as an anchor when render prop is an <a>', () => {
    render(
      <Badge render={<a href="/link" />}>Link Badge</Badge>
    );
    const link = screen.getByText('Link Badge');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/link');
    expect(link).toHaveAttribute('data-slot', 'badge');
  });

  test('renders as a button when render prop is a <button>', () => {
    render(
      <Badge render={<button type="button" />}>Button Badge</Badge>
    );
    const button = screen.getByRole('button', { name: 'Button Badge' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-slot', 'badge');
  });

  test('merges variant classes onto rendered element', () => {
    render(
      <Badge variant="secondary" render={<a href="#" />}>
        Styled Link
      </Badge>
    );
    const link = screen.getByText('Styled Link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('bg-secondary');
    expect(link).toHaveClass('text-secondary-foreground');
  });
});
