import React from 'react';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnBackdrop?: boolean;
    className?: string;
}

const Modal = (props: ModalProps) => {
    // Size classes
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-4xl',
        full: 'max-w-7xl',
    };

    const size = props.size || 'md'; // Default to 'md' if size is undefined

    if (!props.isOpen) return null;

    return (
        <div className='bg-[#0b0b0b]/82 fixed inset-0 z-50 flex items-center justify-center'>
            {/* Backdrop
            <div
                className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300'
                onClick={handleBackdropClick}
            /> */}
            <div
                className={`relative w-full mx-4 ${
                    sizeClasses[size]
                } max-h-[90vh]  bg-white rounded-sm shadow-2xl transform transition-all duration-300 ease-out before:z-[-1] before:absolute before:-top-5 before:right-0 before:w-[125px] before:h-[90px] before:content-[''] before:bg-[var(--color-primary)] before:skew-x-[-45deg] after:z-[-1] after:absolute after:-bottom-5 after:left-0 after:w-[125px] after:h-[90px] after:content-[''] after:bg-[var(--color-primary)] after:skew-x-[-45deg] ${
                    props.className || ''
                }`}
                style={{
                    animation: 'modalSlideIn 0.3s ease-out',
                }}>
                {/* Header */}
                {(props.title || props.showCloseButton) && (
                    <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                        {props.title && (
                            <h2 className='text-2xl font-semibold'>
                                {props.title}
                            </h2>
                        )}
                        {props.showCloseButton && (
                            <IconButton
                                className=''
                                size={32}
                                variant={'primary'}
                                type={'button'}
                                children={
                                    <svg
                                        className='w-6 h-6'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M6 18L18 6M6 6l12 12'
                                        />
                                    </svg>
                                }
                                onClick={props.onClose}
                                backgroundSecondary={false}></IconButton>
                        )}
                    </div>
                )}
                <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
                    {props.children}
                </div>
            </div>

            <style jsx>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Modal;
