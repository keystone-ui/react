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
    expect(screen.getByText('Red')).toHaveClass('bg-red-500/15');
    
    rerender(<Badge variant="blue">Blue</Badge>);
    expect(screen.getByText('Blue')).toHaveClass('bg-blue-500/15');
    
    rerender(<Badge variant="green">Green</Badge>);
    expect(screen.getByText('Green')).toHaveClass('bg-green-500/15');
    
    rerender(<Badge variant="transparent">Transparent</Badge>);
    expect(screen.getByText('Transparent')).toHaveClass('bg-transparent');
  });

  test('applies different sizes', () => {
    const { rerender } = render(<Badge size="xs">Extra Small</Badge>);
    expect(screen.getByText('Extra Small')).toHaveClass('text-[0.625rem]');
    
    rerender(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('text-xs');
    
    rerender(<Badge size="default">Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('text-xs');
  });

  test('supports custom status indicator with span', () => {
    render(
      <Badge className="gap-1.5">
        <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
        Status
      </Badge>
    );
    const badge = screen.getByText('Status');
    const span = badge.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveClass('rounded-full');
    expect(span).toHaveClass('bg-green-500');
  });

  test('applies custom className', () => {
    render(<Badge className="test-class">Custom Class</Badge>);
    expect(screen.getByText('Custom Class')).toHaveClass('test-class');
  });
}); 