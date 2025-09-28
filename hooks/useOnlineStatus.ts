import { useState, useEffect } from 'react';

const useOnlineStatus = (): boolean => {
    // Start with the browser's determination, but we will verify it.
    const [isOnline, setIsOnline] = useState(
        typeof window !== 'undefined' ? window.navigator.onLine : true
    );

    useEffect(() => {
        // The navigator.onLine property is not always reliable, especially in WebViews.
        // We use it as an initial value and then perform our own checks.

        const verifyStatus = async () => {
            try {
                // We fetch a resource with a cache-busting query parameter.
                // This request will be intercepted by the service worker, but since it's not
                // a pre-cached URL, the SW will attempt a network fetch.
                // If the network fetch fails, it will throw an error, indicating we are offline.
                // We use HEAD to be lightweight and no-store to bypass HTTP cache.
                await fetch(`/?online-check=${Date.now()}`, {
                    method: 'HEAD',
                    cache: 'no-store',
                });
                // If the fetch succeeds, we are online.
                if (!isOnline) { // Only update state if it changed
                    setIsOnline(true);
                }
            } catch (e) {
                // If the fetch fails, we are offline.
                if (isOnline) { // Only update state if it changed
                    setIsOnline(false);
                }
            }
        };

        // Check status on component mount
        verifyStatus();

        // Add event listeners for the browser's online/offline events
        const handleOnline = () => verifyStatus(); // Verify when browser thinks we're online
        const handleOffline = () => setIsOnline(false); // We can trust this one more

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Periodically check the connection status as `navigator.onLine` can be misleading.
        const interval = setInterval(verifyStatus, 60000); // Check every minute

        // Cleanup function to remove event listeners and interval
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [isOnline]);

    return isOnline;
};

export default useOnlineStatus;
