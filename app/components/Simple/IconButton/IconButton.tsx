import React from 'react';
import './IconButton.css';

interface IconButtonTypes {
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
    children: React.ReactElement;
    full?: boolean;
    backgroundSecondary: boolean;
}
const IconButton = (props: IconButtonTypes) => {
    const {
        size,
        variant,
        className,
        name,
        onClick,
        type,
        children,
        full,
        disabled,
        backgroundSecondary,
    } = props;
    const styles = [
        'profix-icon-button',
        `profix-icon-button_${size}`,
        `profix-icon-button_${variant}`,
    ];
    if (className) {
        styles.push(className);
    }
    if (full) {
        styles.push('profix-full');
    }

    if (backgroundSecondary) {
        styles.push('profix-icon-button--background-secondary');
    }
    return (
        <button
            className={styles.join(' ')}
            disabled={disabled}
            name={name}
            onClick={onClick}
            type={type}>
            <div className='profix-icon-button-container'>
                <div className='profix-icon-button-body'>{children}</div>
            </div>
        </button>
    );
};

export default IconButton;
