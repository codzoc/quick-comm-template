import { useEffect, useState } from 'react';
import { getStoreInfo } from '../services/storeInfo';

/**
 * FaviconLoader Component
 * Dynamically updates the browser favicon based on store icon
 */
const FaviconLoader = ({ iconUrl }) => {
    const [resolvedIconUrl, setResolvedIconUrl] = useState(iconUrl || '');

    useEffect(() => {
        // If parent provides icon URL, use it directly.
        if (iconUrl) {
            setResolvedIconUrl(iconUrl);
            return;
        }

        let isMounted = true;

        const loadStoreIcon = async () => {
            try {
                const storeInfo = await getStoreInfo();
                const nextIcon = storeInfo?.storeIcon || storeInfo?.logoUrl || '';
                if (isMounted && nextIcon) {
                    setResolvedIconUrl(nextIcon);
                }
            } catch (error) {
                // Non-critical: keep default favicon if store info fails.
            }
        };

        loadStoreIcon();

        return () => {
            isMounted = false;
        };
    }, [iconUrl]);

    useEffect(() => {
        if (!resolvedIconUrl) return;

        // Find existing favicon or create new one
        let link = document.querySelector("link[rel*='icon']");

        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        link.type = resolvedIconUrl.endsWith('.ico') ? 'image/x-icon' : 'image/png';
        link.href = resolvedIconUrl;
    }, [resolvedIconUrl]);

    return null; // This component doesn't render anything
};

export default FaviconLoader;
