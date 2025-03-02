import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  test('renders correctly', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Label className="custom-class">Custom Label</Label>);
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
  });

  test('forwards htmlFor attribute', () => {
    render(<Label htmlFor="test-input">For Input</Label>);
    const label = screen.getByText('For Input');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  test('applies correct base styles', () => {
    render(<Label>Styled Label</Label>);
    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('text-foreground');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });
}); 