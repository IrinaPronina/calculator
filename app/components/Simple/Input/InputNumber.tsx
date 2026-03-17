import React from 'react';
import './Input.css';
import { inputTypes } from './types';

const InputNumber = React.forwardRef<HTMLInputElement, inputTypes>((props, ref) => {
  const {
    value,
    className,
    id,
    name,
    required,
    autoFocus,
    placeholder,
    disabled,
    maxLength,
    minLength,
    min,
    max,
    size,
    onChange,
  } = props;
  const styles = ['input', `input_size_${size}`];
  if (className) {
    styles.push(className);
  }

  return (
    <input
      className={styles.join(' ')}
      ref={ref}
      type="number"
      value={value}
      onKeyDown={(event) => {
        if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
          event.preventDefault();
        }
      }}
      onChange={(event) => onChange(event.target.value)}
      id={id}
      name={name}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      minLength={minLength}
      min={min}
      max={max}
      autoFocus={autoFocus}
    />
  );
});
export default InputNumber;
