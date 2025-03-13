import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';
import { InputGroup, InputAdornment } from './input-group';

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

  it('renders correctly', () => {
    render(<Input placeholder="Test input" data-testid="input" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('passes props correctly', () => {
    render(<Input type="email" placeholder="Email" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Email');
  });

  it('works with InputAdornment', () => {
    render(
      <InputGroup>
        <InputAdornment position="start" data-testid="start-adornment">
          $
        </InputAdornment>
        <Input placeholder="0.00" data-testid="input" />
        <InputAdornment position="end" data-testid="end-adornment">
          USD
        </InputAdornment>
      </InputGroup>
    );
    
    expect(screen.getByTestId('start-adornment')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('end-adornment')).toBeInTheDocument();
  });
}); 