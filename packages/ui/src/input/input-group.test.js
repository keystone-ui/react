import React from 'react';
import { render, screen } from '@testing-library/react';
import { InputGroup, InputAdornment } from './input-group';
import { Input } from './input';

describe('InputGroup', () => {
  test('renders correctly with input', () => {
    render(
      <InputGroup>
        <Input placeholder="Test input" />
      </InputGroup>
    );
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test input')).toHaveAttribute('data-slot', 'input');
  });

  test('renders with start adornment', () => {
    render(
      <InputGroup>
        <InputAdornment position="start">https://</InputAdornment>
        <Input placeholder="example.com" />
      </InputGroup>
    );
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('https://').parentElement).toHaveAttribute('data-slot', 'prefix');
    expect(screen.getByPlaceholderText('example.com')).toHaveAttribute('data-slot', 'input');
  });

  test('renders with end adornment', () => {
    render(
      <InputGroup>
        <Input placeholder="example" />
        <InputAdornment position="end">.com</InputAdornment>
      </InputGroup>
    );
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByText('.com').parentElement).toHaveAttribute('data-slot', 'suffix');
    expect(screen.getByPlaceholderText('example')).toHaveAttribute('data-slot', 'input');
  });

  test('renders with both start and end adornments', () => {
    render(
      <InputGroup>
        <InputAdornment position="start">$</InputAdornment>
        <Input placeholder="0.00" />
        <InputAdornment position="end">USD</InputAdornment>
      </InputGroup>
    );
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('$').parentElement).toHaveAttribute('data-slot', 'prefix');
    expect(screen.getByPlaceholderText('0.00')).toHaveAttribute('data-slot', 'input');
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('USD').parentElement).toHaveAttribute('data-slot', 'suffix');
  });

  test('applies custom className to InputGroup', () => {
    render(
      <InputGroup className="custom-class">
        <Input placeholder="Test input" />
      </InputGroup>
    );
    const inputGroup = screen.getByPlaceholderText('Test input').parentElement;
    expect(inputGroup).toHaveClass('custom-class');
  });

  test('applies custom className to InputAdornment', () => {
    render(
      <InputGroup>
        <InputAdornment position="start" className="adornment-class">https://</InputAdornment>
        <Input placeholder="example.com" />
      </InputGroup>
    );
    const adornment = screen.getByText('https://').parentElement;
    expect(adornment).toHaveClass('adornment-class');
    expect(adornment).toHaveAttribute('data-slot', 'prefix');
  });
});

describe('InputAdornment', () => {
  it('renders with start position', () => {
    render(
      <InputGroup>
        <InputAdornment position="start" data-testid="adornment">
          https://
        </InputAdornment>
        <Input placeholder="example.com" />
      </InputGroup>
    );
    
    const adornment = screen.getByTestId('adornment');
    expect(adornment).toHaveAttribute('data-slot', 'prefix');
  });

  it('renders with end position', () => {
    render(
      <InputGroup>
        <Input placeholder="example" />
        <InputAdornment position="end" data-testid="adornment">
          .com
        </InputAdornment>
      </InputGroup>
    );
    
    const adornment = screen.getByTestId('adornment');
    expect(adornment).toHaveAttribute('data-slot', 'suffix');
  });

  it('applies correct classes based on position', () => {
    render(
      <InputGroup>
        <InputAdornment position="start" data-testid="start-adornment">
          $
        </InputAdornment>
        <Input placeholder="0.00" />
        <InputAdornment position="end" data-testid="end-adornment">
          USD
        </InputAdornment>
      </InputGroup>
    );
    
    const startAdornment = screen.getByTestId('start-adornment');
    const endAdornment = screen.getByTestId('end-adornment');
    
    expect(startAdornment.className).toContain('rounded-s-md');
    expect(endAdornment.className).toContain('rounded-e-md');
  });
}); 