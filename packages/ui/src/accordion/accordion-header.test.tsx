import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '.';

describe('AccordionHeader', () => {
  it('renders with children content', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByRole('button', { name: 'Test Trigger' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader className="custom-header-class">
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const header = screen.getByRole('button', { name: 'Test Trigger' }).closest('.custom-header-class');
    expect(header).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader data-testid="accordion-header">
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const header = screen.getByTestId('accordion-header');
    expect(header).toBeInTheDocument();
    
    // The header should contain the trigger
    const trigger = screen.getByRole('button', { name: 'Test Trigger' });
    expect(header).toContainElement(trigger);
  });

  it('contains the trigger element', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader data-testid="accordion-header">
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const header = screen.getByTestId('accordion-header');
    const trigger = screen.getByRole('button', { name: 'Test Trigger' });
    
    expect(header).toContainElement(trigger);
  });
}); 