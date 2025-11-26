import { useEffect } from 'react';

/**
 * FaviconLoader Component
 * Dynamically updates the browser favicon based on store icon
 */
const FaviconLoader = ({ iconUrl }) => {
    useEffect(() => {
        if (!iconUrl) return;

        // Find existing favicon or create new one
        let link = document.querySelector("link[rel*='icon']");

        if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        link.type = 'image/x-icon';
        link.href = iconUrl;
    }, [iconUrl]);

    return null; // This component doesn't render anything
};

export default FaviconLoader;
