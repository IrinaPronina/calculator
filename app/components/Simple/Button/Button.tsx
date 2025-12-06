import React from 'react';
import './Button.css';

interface ButtonTypes {
    size: 32 | 44 | 52 | 72;
    variant:
        | 'primary'
        | 'alternative'
        | 'alwaysWhite'
        | 'secondary'
        | 'ghost'
        | 'negative';
    className?: string;
    disabled?: boolean;
    name?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type: 'button' | 'submit';
    iconLeft?: React.ReactElement;
    iconRight?: React.ReactElement;
    children: string | number;
    full?: boolean;
    backgroundSecondary: boolean;
}
const Button = (props: ButtonTypes) => {
    const {
        size,
        variant,
        className,
        name,
        onClick,
        type,
        children,
        iconLeft,
        iconRight,
        full,
        disabled,
        backgroundSecondary,
    } = props;
    const styles = [
        'profix-button',
        `profix-button_${size}`,
        `profix-button_${variant}`,
    ];
    if (className) {
        styles.push(className);
    }
    if (full) {
        styles.push('profix-full');
    }

    if (backgroundSecondary) {
        styles.push('profix-button--background-secondary');
    }
    return (
        <button
            className={styles.join(' ')}
            disabled={disabled}
            name={name}
            onClick={onClick}
            type={type}>
            <div className='profix-button-container'>
                <div className='profix-button-body'>
                    {iconLeft && iconLeft}
                    <span className='profix-button--title'>{children}</span>
                    {iconRight && iconRight}
                </div>
            </div>
        </button>
    );
};

export default Button;
