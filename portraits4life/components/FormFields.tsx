import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';

// Shared style for text inputs, selects and the message field. min-h-11 keeps every field at least 44px tall for touch.
export const fieldClass =
  'w-full min-h-11 px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent';

const labelClass = 'block text-base font-medium text-body mb-2';
const checkboxClass = 'mt-1 h-5 w-5 shrink-0 accent-brand';

// Marks a control invalid and links it to its message, when there is an error.
export function invalidProps(id: string, error?: string) {
  return error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {};
}

// The message under a field. The id matches aria-describedby from invalidProps.
export function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={`${id}-error`} className="mt-1 text-base text-danger-text">
      {error}
    </p>
  ) : null;
}

// Label, control and message for one field. The control is passed as children (select, textarea).
// errorId is the key the message belongs to, when it differs from the control id.
export function Field({
  id,
  label,
  error,
  errorId = id,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {children}
      <FieldError id={errorId} error={error} />
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'autoComplete' | 'inputMode' | 'maxLength' | 'min' | 'max' | 'required'
>;

// A text input whose name is its id, so one change handler can update the form state.
export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  className,
  type = 'text',
  ...inputProps
}: TextFieldProps) {
  return (
    <Field id={id} label={label} error={error} className={className}>
      <input
        id={id}
        {...invalidProps(id, error)}
        type={type}
        name={id}
        value={value}
        onChange={onChange}
        {...inputProps}
        className={fieldClass}
      />
    </Field>
  );
}

// A checkbox with its text beside it, and an optional message below.
export function CheckboxField({
  id,
  checked,
  onChange,
  error,
  className,
  labelClassName = '',
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className={`flex items-start gap-3 text-base text-body ${labelClassName}`.trim()}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          {...invalidProps(id, error)}
          className={checkboxClass}
        />
        <span>{children}</span>
      </label>
      <FieldError id={id} error={error} />
    </div>
  );
}
