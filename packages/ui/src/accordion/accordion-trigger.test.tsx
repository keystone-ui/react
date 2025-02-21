import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '.';

describe('AccordionTrigger', () => {
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
          <AccordionHeader>
            <AccordionTrigger className="custom-trigger-class">Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Test Trigger' });
    expect(trigger).toHaveClass('custom-trigger-class');
  });

  it('renders with custom chevron icon', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger chevronIcon={<span data-testid="custom-icon">▼</span>}>
              Test Trigger
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('toggles accordion item when clicked', async () => {
    const user = userEvent.setup();
    
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

    const trigger = screen.getByRole('button', { name: 'Test Trigger' });
    const item = trigger.closest('[data-closed]');
    
    // Initially closed
    expect(item).toHaveAttribute('data-closed');
    
    // Click to open
    await user.click(trigger);
    expect(item).not.toHaveAttribute('data-closed');
  });

  it('renders with empty string as chevron icon', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger chevronIcon={<></>}>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Test Trigger' });
    // Check that there's no SVG element (the default ChevronDown icon)
    const svgElements = trigger.querySelectorAll('svg');
    expect(svgElements.length).toBe(0);
  });
}); 