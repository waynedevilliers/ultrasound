import { describe, expect, it } from 'vitest';
import { clearFieldError, fieldErrorsFromIssues } from './form-errors';

const MESSAGE = 'Check this field';

describe('fieldErrorsFromIssues', () => {
  it('puts each issue on its form field with the localized message', () => {
    expect(fieldErrorsFromIssues([{ field: 'email' }, { field: 'weeksInWomb' }], MESSAGE)).toEqual({
      email: MESSAGE,
      weeksInWomb: MESSAGE,
    });
  });

  it('maps stored photo paths to the upload fields', () => {
    expect(
      fieldErrorsFromIssues([{ field: 'ultrasoundPath' }, { field: 'referencePath' }], MESSAGE),
    ).toEqual({ ultrasound: MESSAGE, reference: MESSAGE });
  });

  it('uses the first part of a nested path', () => {
    expect(fieldErrorsFromIssues([{ field: 'shippingPostalCode.length' }], MESSAGE)).toEqual({
      shippingPostalCode: MESSAGE,
    });
  });

  it('ignores fields the form does not show, such as the honeypot', () => {
    expect(fieldErrorsFromIssues([{ field: 'website' }, { field: 'unknown' }], MESSAGE)).toEqual({});
  });
});

describe('clearFieldError', () => {
  it('removes one field and keeps the others', () => {
    expect(clearFieldError({ email: 'a', name: 'b' }, 'email')).toEqual({ name: 'b' });
  });

  it('returns the same object when the field has no error', () => {
    const errors = { name: 'b' };
    expect(clearFieldError(errors, 'email')).toBe(errors);
  });
});
