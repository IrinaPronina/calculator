import React from 'react';
import './Input.css';
import { inputTypes } from './types';

const InputText = React.forwardRef<HTMLInputElement, inputTypes>((props, ref) => {
  const {
    type,
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
      type={type ?? 'text'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      id={id}
      name={name}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      minLength={minLength}
      autoFocus={autoFocus}
    />
  );
});
export default InputText;
