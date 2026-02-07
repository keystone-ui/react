import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field';

describe('Field', () => {
  test('renders correctly', () => {
    render(<Field data-testid="field">Content</Field>);
    expect(screen.getByTestId('field')).toBeInTheDocument();
  });

  test('has group role', () => {
    render(<Field data-testid="field">Content</Field>);
    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('role', 'group');
  });

  test('has data-slot attribute', () => {
    render(<Field data-testid="field">Content</Field>);
    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-slot', 'field');
  });

  test('applies vertical orientation by default', () => {
    render(<Field data-testid="field">Content</Field>);
    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-orientation', 'vertical');
    expect(field).toHaveClass('flex-col');
  });

  test('applies horizontal orientation', () => {
    render(<Field orientation="horizontal" data-testid="field">Content</Field>);
    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-orientation', 'horizontal');
    expect(field).toHaveClass('flex-row');
  });

  test('applies responsive orientation', () => {
    render(<Field orientation="responsive" data-testid="field">Content</Field>);
    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-orientation', 'responsive');
  });

  test('supports data-invalid attribute', () => {
    render(<Field data-invalid data-testid="field">Content</Field>);
    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-invalid', 'true');
  });

  test('applies custom className', () => {
    render(<Field className="custom-class" data-testid="field">Content</Field>);
    const field = screen.getByTestId('field');
    expect(field).toHaveClass('custom-class');
  });
});

describe('FieldSet', () => {
  test('renders correctly', () => {
    render(<FieldSet data-testid="fieldset">Content</FieldSet>);
    expect(screen.getByTestId('fieldset')).toBeInTheDocument();
  });

  test('renders as fieldset element', () => {
    render(<FieldSet data-testid="fieldset">Content</FieldSet>);
    const fieldset = screen.getByTestId('fieldset');
    expect(fieldset.tagName.toLowerCase()).toBe('fieldset');
  });

  test('has data-slot attribute', () => {
    render(<FieldSet data-testid="fieldset">Content</FieldSet>);
    const fieldset = screen.getByTestId('fieldset');
    expect(fieldset).toHaveAttribute('data-slot', 'field-set');
  });

  test('applies custom className', () => {
    render(<FieldSet className="custom-class" data-testid="fieldset">Content</FieldSet>);
    const fieldset = screen.getByTestId('fieldset');
    expect(fieldset).toHaveClass('custom-class');
  });
});

describe('FieldLegend', () => {
  test('renders correctly', () => {
    render(
      <FieldSet>
        <FieldLegend data-testid="legend">Legend Text</FieldLegend>
      </FieldSet>
    );
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('renders as legend element', () => {
    render(
      <FieldSet>
        <FieldLegend data-testid="legend">Legend Text</FieldLegend>
      </FieldSet>
    );
    const legend = screen.getByTestId('legend');
    expect(legend.tagName.toLowerCase()).toBe('legend');
  });

  test('has data-slot attribute', () => {
    render(
      <FieldSet>
        <FieldLegend data-testid="legend">Legend Text</FieldLegend>
      </FieldSet>
    );
    const legend = screen.getByTestId('legend');
    expect(legend).toHaveAttribute('data-slot', 'field-legend');
  });

  test('applies legend variant by default', () => {
    render(
      <FieldSet>
        <FieldLegend data-testid="legend">Legend Text</FieldLegend>
      </FieldSet>
    );
    const legend = screen.getByTestId('legend');
    expect(legend).toHaveAttribute('data-variant', 'legend');
  });

  test('applies label variant', () => {
    render(
      <FieldSet>
        <FieldLegend variant="label" data-testid="legend">Legend Text</FieldLegend>
      </FieldSet>
    );
    const legend = screen.getByTestId('legend');
    expect(legend).toHaveAttribute('data-variant', 'label');
  });
});

describe('FieldGroup', () => {
  test('renders correctly', () => {
    render(<FieldGroup data-testid="group">Content</FieldGroup>);
    expect(screen.getByTestId('group')).toBeInTheDocument();
  });

  test('has data-slot attribute', () => {
    render(<FieldGroup data-testid="group">Content</FieldGroup>);
    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-slot', 'field-group');
  });

  test('applies custom className', () => {
    render(<FieldGroup className="grid grid-cols-2" data-testid="group">Content</FieldGroup>);
    const group = screen.getByTestId('group');
    expect(group).toHaveClass('grid');
    expect(group).toHaveClass('grid-cols-2');
  });
});

describe('FieldLabel', () => {
  test('renders correctly', () => {
    render(<FieldLabel data-testid="label">Label Text</FieldLabel>);
    expect(screen.getByTestId('label')).toBeInTheDocument();
  });

  test('renders as label element', () => {
    render(<FieldLabel data-testid="label">Label Text</FieldLabel>);
    const label = screen.getByTestId('label');
    expect(label.tagName.toLowerCase()).toBe('label');
  });

  test('has data-slot attribute', () => {
    render(<FieldLabel data-testid="label">Label Text</FieldLabel>);
    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('data-slot', 'field-label');
  });

  test('supports htmlFor attribute', () => {
    render(<FieldLabel htmlFor="my-input" data-testid="label">Label Text</FieldLabel>);
    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('for', 'my-input');
  });

  test('applies custom className', () => {
    render(<FieldLabel className="font-normal" data-testid="label">Label Text</FieldLabel>);
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('font-normal');
  });
});

describe('FieldTitle', () => {
  test('renders correctly', () => {
    render(<FieldTitle data-testid="title">Title Text</FieldTitle>);
    expect(screen.getByTestId('title')).toBeInTheDocument();
  });

  test('has data-slot attribute', () => {
    render(<FieldTitle data-testid="title">Title Text</FieldTitle>);
    const title = screen.getByTestId('title');
    expect(title).toHaveAttribute('data-slot', 'field-title');
  });
});

describe('FieldDescription', () => {
  test('renders correctly', () => {
    render(<FieldDescription data-testid="description">Description text</FieldDescription>);
    expect(screen.getByTestId('description')).toBeInTheDocument();
  });

  test('renders as p element', () => {
    render(<FieldDescription data-testid="description">Description text</FieldDescription>);
    const description = screen.getByTestId('description');
    expect(description.tagName.toLowerCase()).toBe('p');
  });

  test('has data-slot attribute', () => {
    render(<FieldDescription data-testid="description">Description text</FieldDescription>);
    const description = screen.getByTestId('description');
    expect(description).toHaveAttribute('data-slot', 'field-description');
  });

  test('applies custom className', () => {
    render(<FieldDescription className="custom-class" data-testid="description">Description text</FieldDescription>);
    const description = screen.getByTestId('description');
    expect(description).toHaveClass('custom-class');
  });
});

describe('FieldError', () => {
  test('renders correctly with children', () => {
    render(<FieldError data-testid="error">Error message</FieldError>);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  test('has alert role', () => {
    render(<FieldError data-testid="error">Error message</FieldError>);
    const error = screen.getByRole('alert');
    expect(error).toBeInTheDocument();
  });

  test('has data-slot attribute', () => {
    render(<FieldError data-testid="error">Error message</FieldError>);
    const error = screen.getByTestId('error');
    expect(error).toHaveAttribute('data-slot', 'field-error');
  });

  test('renders nothing when no content', () => {
    render(<FieldError data-testid="error" />);
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('renders single error from errors array', () => {
    render(<FieldError errors={[{ message: 'Single error' }]} />);
    expect(screen.getByText('Single error')).toBeInTheDocument();
  });

  test('renders multiple errors as list', () => {
    render(
      <FieldError 
        errors={[
          { message: 'Error 1' },
          { message: 'Error 2' },
        ]} 
      />
    );
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  test('filters undefined errors', () => {
    render(
      <FieldError 
        errors={[
          { message: 'Valid error' },
          undefined,
        ]} 
      />
    );
    expect(screen.getByText('Valid error')).toBeInTheDocument();
  });

  test('deduplicates errors with same message', () => {
    render(
      <FieldError 
        errors={[
          { message: 'Duplicate' },
          { message: 'Duplicate' },
        ]} 
      />
    );
    const duplicates = screen.getAllByText('Duplicate');
    expect(duplicates).toHaveLength(1);
  });

  test('applies custom className', () => {
    render(<FieldError className="custom-class" data-testid="error">Error</FieldError>);
    const error = screen.getByTestId('error');
    expect(error).toHaveClass('custom-class');
  });
});

describe('FieldContent', () => {
  test('renders correctly', () => {
    render(<FieldContent data-testid="content">Content</FieldContent>);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  test('has data-slot attribute', () => {
    render(<FieldContent data-testid="content">Content</FieldContent>);
    const content = screen.getByTestId('content');
    expect(content).toHaveAttribute('data-slot', 'field-content');
  });

  test('applies custom className', () => {
    render(<FieldContent className="custom-class" data-testid="content">Content</FieldContent>);
    const content = screen.getByTestId('content');
    expect(content).toHaveClass('custom-class');
  });
});

describe('FieldSeparator', () => {
  test('renders correctly', () => {
    render(<FieldSeparator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  test('has data-slot attribute', () => {
    render(<FieldSeparator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-slot', 'field-separator');
  });

  test('renders children when provided', () => {
    render(<FieldSeparator data-testid="separator">OR</FieldSeparator>);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  test('sets data-content attribute when children provided', () => {
    render(<FieldSeparator data-testid="separator">OR</FieldSeparator>);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-content', 'true');
  });

  test('applies custom className', () => {
    render(<FieldSeparator className="custom-class" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-class');
  });
});

describe('Field Integration', () => {
  test('renders complete field with all components', () => {
    render(
      <FieldSet data-testid="fieldset">
        <FieldLegend data-testid="legend">Profile</FieldLegend>
        <FieldGroup data-testid="group">
          <Field data-testid="field">
            <FieldLabel htmlFor="name" data-testid="label">Name</FieldLabel>
            <input id="name" data-testid="input" />
            <FieldDescription data-testid="description">Enter your name</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    );

    expect(screen.getByTestId('fieldset')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('group')).toBeInTheDocument();
    expect(screen.getByTestId('field')).toBeInTheDocument();
    expect(screen.getByTestId('label')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
  });

  test('renders field with error state', () => {
    render(
      <Field data-invalid data-testid="field">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input id="email" aria-invalid data-testid="input" />
        <FieldError data-testid="error">Invalid email</FieldError>
      </Field>
    );

    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  test('renders horizontal field with checkbox/switch pattern', () => {
    render(
      <Field orientation="horizontal" data-testid="field">
        <input type="checkbox" id="terms" data-testid="checkbox" />
        <FieldLabel htmlFor="terms" data-testid="label">Accept terms</FieldLabel>
      </Field>
    );

    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-orientation', 'horizontal');
    expect(field).toHaveClass('flex-row');
  });
});
