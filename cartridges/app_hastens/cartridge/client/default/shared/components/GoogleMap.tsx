import React, { useEffect } from 'react';

import './GoogleMap.scss';

interface Props {
    mapKey: string;
    id?: string;
    options: {
        center: {
            lat: number | string;
            lng: number | string;
        };
        zoom: number;
    };
    onMapLoad: (map: any) => void;
}

GoogleMap.defaultProps = {
    id: Date.now().toString(),
} as Props;

export function GoogleMap({ mapKey, id, options, onMapLoad }: Props) {

    function onScriptLoad() {
        const map = new window.google.maps.Map(
            document.getElementById(id),
            options,
        );
        onMapLoad(map);
    }

    useEffect(() => {
        if (!window.google) {
            const scriptTag = document.createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.src = `https://maps.google.com/maps/api/js?key=${mapKey}`;
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
            // Below is important.
            // We cannot access google.maps until it's finished loading
            scriptTag.addEventListener('load', () => {
                onScriptLoad();
            });
        } else {
            onScriptLoad();
        }
    }, []);

    return (
        <div className="has-google-map" id={id} />
    );
}
