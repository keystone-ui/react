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
    expect(checkbox).not.toBeChecked();
  });

  test('can be checked by default', () => {
    render(<Checkbox defaultChecked data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('toggles on click', async () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('calls onChange handler', async () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    
    await userEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('applies disabled state', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  test('does not toggle when disabled', async () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
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

  test('supports id attribute for label association', () => {
    render(<Checkbox id="my-checkbox" data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('id', 'my-checkbox');
  });
});
