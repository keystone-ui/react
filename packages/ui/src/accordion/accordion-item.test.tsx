import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '.';

describe('AccordionItem', () => {
  it('renders with correct value', () => {
    render(
      <Accordion defaultValue={['test-item']}>
        <AccordionItem value="test-item" data-testid="accordion-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    // If the value is correct, the panel should be open by default
    const panel = screen.getByText('Test Content');
    expect(panel).toBeVisible();
    
    // The item should not have the data-closed attribute
    const item = screen.getByTestId('accordion-item');
    expect(item).not.toHaveAttribute('data-closed');
  });

  it('applies custom className', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item" className="custom-class">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen.getByRole('button', { name: 'Test Trigger' }).closest('.custom-class');
    expect(item).toBeInTheDocument();
  });

  it('renders with disabled state', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item" disabled>
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Test Trigger' });
    // Base UI uses aria-disabled instead of native disabled attribute
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies box variant styles correctly', () => {
    render(
      <Accordion variant="box">
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen.getByRole('button', { name: 'Test Trigger' }).closest('[class*="rounded-lg"]');
    expect(item).toBeInTheDocument();
  });

  it('applies underline variant styles correctly', () => {
    render(
      <Accordion variant="underline">
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen.getByRole('button', { name: 'Test Trigger' }).closest('[class*="border-b"]');
    expect(item).toBeInTheDocument();
  });
}); 