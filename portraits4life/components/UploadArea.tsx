'use client';

import { useRef, type ChangeEvent, type ReactNode } from 'react';

// A styled upload box. The real file input stays in the page (visually hidden, still focusable),
// so keyboard and screen reader users use the same control; the box shows the focus outline.
export default function UploadArea({
  id,
  labelText,
  hint,
  file,
  locale,
  copy,
  required = false,
  inputProps = {},
  errorNode = null,
  onChange,
  onRemove,
  className = '',
}: {
  id: string;
  labelText: string;
  hint?: string;
  file: File | null;
  locale: 'de' | 'en';
  copy: { choose: string; formats: string; remove: string };
  required?: boolean;
  inputProps?: { 'aria-invalid'?: boolean; 'aria-describedby'?: string };
  errorNode?: ReactNode;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = `${id}-label`;

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '';
    onRemove();
  };

  return (
    <div className={className}>
      <span id={labelId} className="block text-base font-medium text-body mb-2">
        {labelText}
      </span>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        required={required}
        aria-labelledby={labelId}
        {...inputProps}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-field bg-surface p-4 text-center transition hover:border-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
      >
        <svg
          className="h-8 w-8 text-brand"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
          />
        </svg>
        <span className="font-semibold text-brand-strong">{copy.choose}</span>
        <span className="text-base text-copy">{copy.formats}</span>
      </label>
      {hint && <p className="mt-2 text-base text-copy">{hint}</p>}

      {file && (
        <div className="mt-2 flex items-center justify-between gap-3 text-base text-body">
          <span className="min-w-0 truncate">
            {file.name} ({formatFileSize(file.size, locale)})
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="min-h-11 shrink-0 px-3 font-semibold text-brand-strong hover:text-ink"
          >
            {copy.remove}
          </button>
        </div>
      )}
      {errorNode}
    </div>
  );
}

// "850 KB" below 1 MB, otherwise "2,3 MB" (German) or "2.3 MB" (English).
export function formatFileSize(bytes: number, locale: 'de' | 'en'): string {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes < 1) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(megabytes)} MB`;
}
