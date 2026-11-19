import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CheckboxField, TextField } from './FormFields';

describe('TextField', () => {
  it('labels the input and uses the id as its name', () => {
    render(<TextField id="name" label="Name" value="Ann" onChange={() => {}} />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('name', 'name');
    expect(input).toHaveValue('Ann');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks the input invalid and links it to its message', () => {
    render(<TextField id="email" label="Email" value="" onChange={() => {}} error="Required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByText('Required')).toHaveAttribute('id', 'email-error');
  });
});

describe('CheckboxField', () => {
  it('reports the new state and shows its message', () => {
    const onChange = vi.fn();
    render(
      <CheckboxField id="consent" checked={false} onChange={onChange} error="Please agree">
        I agree
      </CheckboxField>,
    );
    fireEvent.click(screen.getByLabelText('I agree'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText('I agree')).toHaveAttribute('aria-describedby', 'consent-error');
    expect(screen.getByText('Please agree')).toBeInTheDocument();
  });
});
