import React, { useState } from 'react';
import './input-field.css';

export interface InputProps {
  /** Visual variant of the input */
  variant?: 'default' | 'focus' | 'error' | 'disabled';
  /** Label text displayed above the input */
  label?: string;
  /** Input value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Render as a textarea */
  multiline?: boolean;
  /** Number of rows for textarea */
  rows?: number;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const Input = ({
  variant = 'default',
  label = 'Label',
  value,
  placeholder = 'Input',
  helperText,
  multiline = false,
  rows = 4,
  onChange,
}: InputProps) => {
  const [focused, setFocused] = useState(false);

  const activeVariant = variant === 'disabled' || variant === 'error'
    ? variant
    : focused ? 'focus' : 'default';

  const sharedProps = {
    className: `input-field__input input-field__input--${activeVariant} ${multiline ? 'input-field__input--textarea' : ''}`,
    disabled: variant === 'disabled',
    value,
    placeholder,
    onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  return (
    <div className="input-field">
      <label className={`input-field__label input-field__label--${activeVariant}`}>
        {label}
      </label>
      {multiline
        ? <textarea {...sharedProps} rows={rows} />
        : <input {...sharedProps} />
      }
      {helperText && (
        <div className="input-field__helper">
          <span className="input-field__helper-icon" aria-hidden="true">info</span>
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
};
