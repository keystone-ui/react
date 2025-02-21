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

    // Panel should exist in the DOM but be hidden
    const panel = screen.getByText('Test Panel Content');
    expect(panel).toBeInTheDocument();
    
    // The panel's parent should have the hidden attribute
    const panelContainer = panel.closest('[hidden]');
    expect(panelContainer).toBeInTheDocument();
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

    const panel = screen.getByRole('region');
    expect(panel).toHaveAttribute('aria-labelledby');
  });
}); 