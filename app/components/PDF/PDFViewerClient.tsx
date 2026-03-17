'use client';
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import PDF from './PDF';

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
