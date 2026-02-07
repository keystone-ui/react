import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  test('renders correctly', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  test('has checkbox role', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('is unchecked by default', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  test('can be checked by default', () => {
    render(<Checkbox defaultChecked data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  test('toggles on click', async () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    
    await userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    
    await userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  test('calls onCheckedChange handler', async () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    
    await userEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    // Base UI passes (checked, event) to onCheckedChange
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  test('applies disabled state', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-disabled', '');
  });

  test('does not toggle when disabled', async () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    
    await userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  test('applies custom className', () => {
    render(<Checkbox className="custom-class" data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });

  test('has data-slot attribute', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
  });

  test('supports controlled checked state', async () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Checkbox checked={false} onCheckedChange={handleChange} data-testid="checkbox" />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Clicking should call onCheckedChange but not change the visual state
    // since it's controlled
    await userEvent.click(checkbox);
    // Base UI passes (checked, event) to onCheckedChange
    expect(handleChange.mock.calls[0][0]).toBe(true);

    // Rerender with checked=true to simulate controlled update
    rerender(
      <Checkbox checked={true} onCheckedChange={handleChange} data-testid="checkbox" />
    );
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  test('supports name attribute for form submission', () => {
    render(<Checkbox name="my-checkbox" data-testid="checkbox" />);
    // Base UI renders a hidden input for form submission
    const hiddenInput = document.querySelector('input[name="my-checkbox"]');
    expect(hiddenInput).toBeInTheDocument();
  });
});
