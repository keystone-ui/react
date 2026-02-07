import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  test('renders correctly', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Textarea className="custom-class" placeholder="Custom Textarea" />);
    const textarea = screen.getByPlaceholderText('Custom Textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  test('handles user input', async () => {
    render(<Textarea placeholder="Type here" />);
    const textarea = screen.getByPlaceholderText('Type here');
    await userEvent.type(textarea, 'Hello, world!');
    expect(textarea).toHaveValue('Hello, world!');
  });

  test('handles multiline input', async () => {
    render(<Textarea placeholder="Type here" />);
    const textarea = screen.getByPlaceholderText('Type here');
    await userEvent.type(textarea, 'Line 1{enter}Line 2');
    expect(textarea).toHaveValue('Line 1\nLine 2');
  });

  test('applies disabled state', () => {
    render(<Textarea disabled placeholder="Disabled Textarea" />);
    const textarea = screen.getByPlaceholderText('Disabled Textarea');
    expect(textarea).toBeDisabled();
  });

  test('applies rows attribute', () => {
    render(<Textarea rows={5} placeholder="With rows" />);
    const textarea = screen.getByPlaceholderText('With rows');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  test('applies aria-invalid for error state', () => {
    render(<Textarea aria-invalid placeholder="Invalid Textarea" />);
    const textarea = screen.getByPlaceholderText('Invalid Textarea');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  test('has data-slot attribute', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
  });

  test('applies focus ring styles', () => {
    render(<Textarea placeholder="Focus Ring Test" />);
    const textarea = screen.getByPlaceholderText('Focus Ring Test');
    expect(textarea).toHaveClass('focus:ring-1');
    expect(textarea).toHaveClass('focus:ring-inset');
    expect(textarea).toHaveClass('focus:ring-ring');
  });
});
