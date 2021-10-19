import { useEffect, useState } from 'react';

// Custom hook which tracks the window size.
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: null,
        height: null,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

export default useWindowSize;
