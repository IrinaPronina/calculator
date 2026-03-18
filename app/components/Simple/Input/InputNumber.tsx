import React from 'react';
import './Input.css';
import { inputTypes } from './types';

const InputNumber = React.forwardRef<HTMLInputElement, inputTypes>((props, ref) => {
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
        min,
        max,
        step,
        size,
        onChange,
        onBlur,
    } = props;

    const styles = ['input', `input_size_${size}`];
    if (className) {
        styles.push(className);
    }

    const inputType = type ?? 'number';

    return (
        <input
            className={styles.join(' ')}
            ref={ref}
            type={inputType}
            inputMode={inputType === 'text' ? 'decimal' : undefined}
            value={value}
            onKeyDown={(event) => {
                if (
                    inputType === 'number' &&
                    (event.key === '-' ||
                        event.key === '+' ||
                        event.key === 'e' ||
                        event.key === 'E')
                ) {
                    event.preventDefault();
                }
            }}
            onChange={(event) => onChange(event.target.value)}
            onBlur={(event) => onBlur?.(event.target.value)}
            id={id}
            name={name}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            minLength={minLength}
            min={inputType === 'number' ? min : undefined}
            max={inputType === 'number' ? max : undefined}
            step={inputType === 'number' ? step ?? 'any' : undefined}
            autoFocus={autoFocus}
        />
    );
});

export default InputNumber;
