import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '.';

describe('Accordion', () => {
  it('renders with basic content', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByRole('button', { name: 'Trigger 1' })).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('expands/collapses when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger 1' });
    const item = trigger.closest('[data-closed]');

    // Initially panel should be closed
    expect(item).toHaveAttribute('data-closed');

    // Click to open
    await user.click(trigger);
    expect(item).not.toHaveAttribute('data-closed');

    // Click to close
    await user.click(trigger);
    expect(item).toHaveAttribute('data-closed');
  });

  it('supports multiple items open when openMultiple is true', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion openMultiple>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole('button', { name: 'Trigger 1' });
    const trigger2 = screen.getByRole('button', { name: 'Trigger 2' });
    const item1 = trigger1.closest('[data-closed]');
    const item2 = trigger2.closest('[data-closed]');

    // Open both panels
    await user.click(trigger1);
    await user.click(trigger2);

    expect(item1).not.toHaveAttribute('data-closed');
    expect(item2).not.toHaveAttribute('data-closed');
  });

  it('renders with custom chevron icon', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger chevronIcon={<span>▼</span>}>
              Custom Chevron
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    render(
      <Accordion variant="box">
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Box Variant</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen.getByRole('button', { name: 'Box Variant' }).closest('[class*="rounded-lg"]');
    expect(item).toBeInTheDocument();
  });

  it('closes other items when openMultiple is false', async () => {
    const user = userEvent.setup();
    
    render(
      <Accordion openMultiple={false}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole('button', { name: 'Trigger 1' });
    const trigger2 = screen.getByRole('button', { name: 'Trigger 2' });
    const item1 = trigger1.closest('[data-closed]');
    const item2 = trigger2.closest('[data-closed]');

    // Open first panel
    await user.click(trigger1);
    expect(item1).not.toHaveAttribute('data-closed');
    
    // Open second panel, first should close
    await user.click(trigger2);
    expect(item2).not.toHaveAttribute('data-closed');
    expect(item1).toHaveAttribute('data-closed');
  });

  it('respects defaultValue prop', () => {
    render(
      <Accordion defaultValue={['item-2']}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole('button', { name: 'Trigger 1' });
    const trigger2 = screen.getByRole('button', { name: 'Trigger 2' });
    
    const item1 = trigger1.closest('[data-closed]');
    expect(item1).toHaveAttribute('data-closed');
    
    // Item 2 should be open
    const panel2 = screen.getByText('Content 2');
    expect(panel2).toBeVisible();
  });

  it('calls onValueChange when item is toggled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    
    render(
      <Accordion onValueChange={onValueChange}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger 1' });
    
    await user.click(trigger);
    expect(onValueChange).toHaveBeenCalledWith(['item-1']);
    
    await user.click(trigger);
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it('respects disabled prop on accordion', () => {
    render(
      <Accordion disabled>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger 1' });
    expect(trigger).toBeDisabled();
  });

  it('respects disabled prop on accordion item', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1" disabled>
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole('button', { name: 'Trigger 1' });
    const trigger2 = screen.getByRole('button', { name: 'Trigger 2' });
    
    expect(trigger1).toBeDisabled();
    expect(trigger2).not.toBeDisabled();
  });
}); 