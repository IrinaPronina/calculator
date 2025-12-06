'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import PDF from './PDF';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
    { ssr: false }
);

const PDFViewerClient = () => {
    return (
        <PDFViewer
            width={'100%'}
            height={'100%'}
            showToolbar
            className='w-full h-full'>
            <PDF />
        </PDFViewer>
    );
};

export default PDFViewerClient;
