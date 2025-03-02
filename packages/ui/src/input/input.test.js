import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  test('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom Input" />);
    const input = screen.getByPlaceholderText('Custom Input');
    expect(input).toHaveClass('custom-class');
  });

  test('handles user input', async () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    await userEvent.type(input, 'Hello, world!');
    expect(input).toHaveValue('Hello, world!');
  });

  test('applies disabled state', () => {
    render(<Input disabled placeholder="Disabled Input" />);
    const input = screen.getByPlaceholderText('Disabled Input');
    expect(input).toBeDisabled();
  });

  test('applies correct type attribute', () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('applies focus ring styles', () => {
    render(<Input placeholder="Focus Ring Test" />);
    const input = screen.getByPlaceholderText('Focus Ring Test');
    expect(input).toHaveClass('focus-visible:ring-2');
    expect(input).toHaveClass('focus-visible:ring-inset');
    expect(input).toHaveClass('focus-visible:ring-ring');
    expect(input).toHaveClass('focus-visible:outline-none');
  });

  test('applies search-specific styles for search type', () => {
    render(<Input type="search" placeholder="Search" />);
    const input = screen.getByPlaceholderText('Search');
    expect(input).toHaveClass('[&::-webkit-search-cancel-button]:appearance-none');
  });

  test('applies file-specific styles for file type', () => {
    render(<Input type="file" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('file:border-r');
    expect(input).toHaveClass('file:not-italic');
  });
}); 