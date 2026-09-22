import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adicionarCamadaBase } from '../map/baseLayer';

// Mini-mapa de seleção de coordenadas. Extraído de Coverage.jsx sem mudança de
// comportamento — só saiu do arquivo de 740 linhas.
export default function MapaPicker({ lat, lng, onChange, altura = 240 }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        // HMR: limpa _leaflet_id preso de versão anterior
        if (containerRef.current._leaflet_id) containerRef.current._leaflet_id = undefined;

        const center = (lat && lng) ? [lat, lng] : [-10.5, -36.5];
        const zoom = (lat && lng) ? 14 : 9;
        const map = L.map(containerRef.current, { center, zoom, zoomControl: true, maxZoom: 19 });
        adicionarCamadaBase(map);

        let marker = null;
        const prender = (m) => {
            m.on('dragend', () => {
                const p = m.getLatLng();
                onChange(p.lat.toFixed(7), p.lng.toFixed(7));
            });
        };

        if (lat && lng) {
            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            prender(marker);
        }

        map.on('click', (e) => {
            const { lat: clat, lng: clng } = e.latlng;
            if (marker) {
                marker.setLatLng([clat, clng]);
            } else {
                marker = L.marker([clat, clng], { draggable: true }).addTo(map);
                prender(marker);
            }
            onChange(clat.toFixed(7), clng.toFixed(7));
        });

        mapRef.current = { map, getMarker: () => marker, setMarker: (m) => { marker = m; }, L };

        return () => {
            if (mapRef.current) { mapRef.current.map.remove(); mapRef.current = null; }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Quando lat/lng mudam via campos de texto → mover marcador
    useEffect(() => {
        if (!mapRef.current || !lat || !lng) return;
        const { map, getMarker, setMarker, L: LL } = mapRef.current;
        let m = getMarker();
        if (m) {
            m.setLatLng([lat, lng]);
        } else {
            m = LL.marker([lat, lng], { draggable: true }).addTo(map);
            m.on('dragend', () => {
                const p = m.getLatLng();
                onChange(parseFloat(p.lat.toFixed(7)), parseFloat(p.lng.toFixed(7)));
            });
            setMarker(m);
        }
        map.setView([lat, lng], Math.max(map.getZoom(), 13));
    }, [lat, lng]); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={containerRef} style={{ height: altura, width: '100%' }} />;
}
