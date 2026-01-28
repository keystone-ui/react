import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '.';

describe('AccordionPanel', () => {
  it('renders with children content', () => {
    render(
      <Accordion defaultValue={['test-item']}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Test Panel Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Accordion defaultValue={['test-item']}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel className="custom-panel-class">Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const panel = screen.getByText('Test Panel Content').closest('.custom-panel-class');
    expect(panel).toBeInTheDocument();
  });

  it('is hidden when accordion item is closed', () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    // Base UI doesn't render panel content when closed
    // Instead, check that the item has the data-closed attribute
    const trigger = screen.getByRole('button', { name: 'Test Trigger' });
    const item = trigger.closest('[data-closed]');
    expect(item).toBeInTheDocument();
    
    // Panel content should not be in the DOM when closed
    expect(screen.queryByText('Test Panel Content')).not.toBeInTheDocument();
  });

  it('is visible when accordion item is open', () => {
    render(
      <Accordion defaultValue={['test-item']}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    // Panel should be visible
    const panel = screen.getByText('Test Panel Content');
    expect(panel).toBeVisible();
  });

  it('has the correct ARIA attributes', () => {
    render(
      <Accordion defaultValue={['test-item']}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    // Find the panel by its content, then check the parent panel element
    const panelContent = screen.getByText('Test Panel Content');
    const panel = panelContent.closest('[role="region"][aria-labelledby]');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('aria-labelledby');
  });
}); 