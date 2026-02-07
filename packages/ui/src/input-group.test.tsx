import { render, screen } from '@testing-library/react';
import { describe, expect, it, test } from 'vitest';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, InputGroupButton } from './input-group';
import { Input } from './input';

describe('InputGroup', () => {
  test('renders correctly with InputGroupInput', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Test input" />
      </InputGroup>
    );
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test input')).toHaveAttribute('data-slot', 'input-group-control');
  });

  test('renders correctly with regular Input', () => {
    render(
      <InputGroup>
        <Input placeholder="Test input" />
      </InputGroup>
    );
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  test('renders with inline-start addon', () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-start">https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    );
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('https://').closest('[data-slot="input-group-addon"]')).toHaveAttribute('data-align', 'inline-start');
  });

  test('renders with inline-end addon', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="example" />
        <InputGroupAddon align="inline-end">.com</InputGroupAddon>
      </InputGroup>
    );
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByText('.com').closest('[data-slot="input-group-addon"]')).toHaveAttribute('data-align', 'inline-end');
  });

  test('renders with both inline-start and inline-end addons', () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-start">$</InputGroupAddon>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end">USD</InputGroupAddon>
      </InputGroup>
    );
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('$').closest('[data-slot="input-group-addon"]')).toHaveAttribute('data-align', 'inline-start');
    expect(screen.getByPlaceholderText('0.00')).toHaveAttribute('data-slot', 'input-group-control');
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('USD').closest('[data-slot="input-group-addon"]')).toHaveAttribute('data-align', 'inline-end');
  });

  test('applies custom className to InputGroup', () => {
    render(
      <InputGroup className="custom-class" data-testid="input-group">
        <InputGroupInput placeholder="Test input" />
      </InputGroup>
    );
    const inputGroup = screen.getByTestId('input-group');
    expect(inputGroup).toHaveClass('custom-class');
  });

  test('applies custom className to InputGroupAddon', () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-start" className="adornment-class">https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    );
    const addon = screen.getByText('https://').closest('[data-slot="input-group-addon"]');
    expect(addon).toHaveClass('adornment-class');
  });

  test('renders with block-start addon (vertical layout)', () => {
    render(
      <InputGroup>
        <InputGroupAddon align="block-start">Label</InputGroupAddon>
        <InputGroupInput placeholder="Enter value" />
      </InputGroup>
    );
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Label').closest('[data-slot="input-group-addon"]')).toHaveAttribute('data-align', 'block-start');
  });

  test('renders with block-end addon (vertical layout)', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Enter value" />
        <InputGroupAddon align="block-end">Helper text</InputGroupAddon>
      </InputGroup>
    );
    expect(screen.getByText('Helper text')).toBeInTheDocument();
    expect(screen.getByText('Helper text').closest('[data-slot="input-group-addon"]')).toHaveAttribute('data-align', 'block-end');
  });
});

describe('InputGroupAddon', () => {
  it('renders with inline-start alignment by default', () => {
    render(
      <InputGroup>
        <InputGroupAddon data-testid="addon">
          https://
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    );
    
    const addon = screen.getByTestId('addon');
    expect(addon).toHaveAttribute('data-slot', 'input-group-addon');
    expect(addon).toHaveAttribute('data-align', 'inline-start');
  });

  it('renders with inline-end alignment', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="example" />
        <InputGroupAddon align="inline-end" data-testid="addon">
          .com
        </InputGroupAddon>
      </InputGroup>
    );
    
    const addon = screen.getByTestId('addon');
    expect(addon).toHaveAttribute('data-align', 'inline-end');
  });

  it('applies correct order classes based on alignment', () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-start" data-testid="start-addon">
          $
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end" data-testid="end-addon">
          USD
        </InputGroupAddon>
      </InputGroup>
    );
    
    const startAddon = screen.getByTestId('start-addon');
    const endAddon = screen.getByTestId('end-addon');
    
    expect(startAddon.className).toContain('order-first');
    expect(endAddon.className).toContain('order-last');
  });
});

describe('InputGroupText', () => {
  it('renders text content', () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    );
    
    expect(screen.getByText('https://')).toBeInTheDocument();
  });
});

describe('InputGroupButton', () => {
  it('renders button inside addon', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Enter code" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton data-testid="copy-btn">Copy</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
    
    expect(screen.getByTestId('copy-btn')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('applies size variant classes', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Enter code" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="sm" data-testid="btn">Copy</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
    
    const btn = screen.getByTestId('btn');
    expect(btn).toHaveAttribute('data-size', 'sm');
  });
});
