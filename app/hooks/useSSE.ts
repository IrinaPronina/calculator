import React from 'react';

function useSSE<T>(url: string) {
    const [data, setData] = React.useState<T | null>(null);

    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const eventSource = new EventSource(url, {
            withCredentials: true,
        });

        eventSource.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data) as T;

                setData(parsedData);

                console.log(data, parsedData);
            } catch (e) {
                console.error('Error parsing SSE data:', e);

                setError('Error parsing data');
            }
        };

        eventSource.onerror = (event) => {
            console.error('SSE error:', event);

            setError('Error connecting to SSE');

            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [url]);

    return { data, error };
}

export default useSSE;
