import React from 'react';
import './Tab.css';

interface tabTypes {
    className: string;
    size: 32 | 52 | 72;
    activeTab: string;
    disabled?: boolean;
    onClick: (value: string) => void;
    variant: 'button' | 'stroke';
    eventKey: string;
    children:
        | React.ReactNode
        | React.ReactNode[]
        | React.ReactElement
        | React.ReactElement[];
}
const tab = (props: tabTypes) => {
    const {
        size,
        variant,
        onClick,
        disabled,
        eventKey,
        activeTab,
        children,
        className,
    } = props;
    const styles = [
        'profix-tab',
        `profix-tab_${size}`,
        `profix-tab_${variant}`,
    ];

    if (className) {
        styles.push(className);
    }

    if (activeTab === eventKey) {
        styles.push(`profix-tab_active`);
    }

    return (
        <button
            className={styles.join(' ')}
            disabled={disabled}
            onClick={() => onClick(eventKey)}>
            {children}
        </button>
    );
};

export default tab;
