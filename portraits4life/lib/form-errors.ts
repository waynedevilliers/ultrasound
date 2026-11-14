// Field keys the order form can show an error for. Server field names that differ are aliased.
export const ORDER_FORM_FIELDS = [
  'name',
  'email',
  'product',
  'canvasSize',
  'childName',
  'weeksInWomb',
  'specialRequests',
  'shippingFullName',
  'shippingStreet',
  'shippingCity',
  'shippingState',
  'shippingPostalCode',
  'shippingCountry',
  'ultrasound',
  'reference',
] as const;

const SERVER_FIELD_ALIASES: Record<string, string> = {
  ultrasoundPath: 'ultrasound',
  referencePath: 'reference',
};

// Maps the server's validation issues to form field keys. Each mapped field gets the same
// localized message; the server's own (English) messages are not shown to visitors.
export function fieldErrorsFromIssues(
  issues: ReadonlyArray<{ field: string }>,
  message: string,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const serverField = issue.field.split('.')[0];
    const key = SERVER_FIELD_ALIASES[serverField] ?? serverField;
    if ((ORDER_FORM_FIELDS as readonly string[]).includes(key)) {
      errors[key] = message;
    }
  }
  return errors;
}

export function clearFieldError(errors: Record<string, string>, key: string): Record<string, string> {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
}
