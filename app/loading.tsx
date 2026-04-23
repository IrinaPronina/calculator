import React from 'react';

import Loader from './components/Simple/Loader/Loader';

const Loading = () => {
    return (
        <div className='min-h-[calc(100vh-80px)] flex items-center justify-center'>
            <Loader />
        </div>
    );
};

export default Loading;
