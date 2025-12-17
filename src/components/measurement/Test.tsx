import { Layer, Marker, Source, useMap } from "react-map-gl/mapbox";
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import type { FeatureCollection, LineString, Feature } from 'geojson'

// --- Types ---
type LngLat = { lng: number; lat: number }

// --- Constants ---
const EMPTY_FEATURE_COLLECTION: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: []
}

const LINE_PAINT_STYLE = {
    'line-color': '#00ffff',
    'line-width': 3
}

const PREVIEW_LINE_PAINT_STYLE = {
    'line-color': '#00ffff',
    'line-width': 2,
    'line-dasharray': [2, 2]
}

const LAYER_STYLE = {
    type: 'line' as const,
    paint: LINE_PAINT_STYLE
}

// --- Components ---

/**
 * Measurement Tool Component
 * Allows users to draw lines on the map by clicking points.
 * Double-click to finish drawing a line segment.
 */
export default function MeasurementTool() {
    // 1. Hooks & State
    const maps = useMap() as any
    const mapInstance = maps?.current // Rename for clarity
    
    const [styleReady, setStyleReady] = useState(false)
    
    // Current drawing state
    const [markers, setMarkers] = useState<LngLat[]>([])
    const markersRef = useRef<LngLat[]>([]) // Ref for event handlers to access latest state

    // Line data states
    const [currentLine, setCurrentLine] = useState<FeatureCollection<LineString>>(EMPTY_FEATURE_COLLECTION)
    const [previewLine, setPreviewLine] = useState<FeatureCollection<LineString>>(EMPTY_FEATURE_COLLECTION)
    
    // History state
    const [historyLines, setHistoryLines] = useState<FeatureCollection<LineString>>(EMPTY_FEATURE_COLLECTION)
    const [historyMarkers, setHistoryMarkers] = useState<LngLat[][]>([])

    // 2. Effects
    
    // Sync Ref with State
    useEffect(() => {
        markersRef.current = markers
    }, [markers])

    // Wait for map style to load
    useEffect(() => {
        const map = mapInstance?.getMap?.()
        if (!map) return

        const handleStyleLoad = () => setStyleReady(true)

        if (map.isStyleLoaded()) {
            setStyleReady(true)
        } else {
            map.once('load', handleStyleLoad)
        }

        return () => {
            map.off('load', handleStyleLoad)
        }
    }, [mapInstance])

    // Update current line GeoJSON when markers change
    useEffect(() => {
        if (markers.length < 2) {
            setCurrentLine(EMPTY_FEATURE_COLLECTION)
            return
        }

        const lineFeature: Feature<LineString> = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: markers.map(p => [p.lng, p.lat])
            }
        }

        setCurrentLine({
            type: 'FeatureCollection',
            features: [lineFeature]
        })
    }, [markers])

    // Map Interaction Handlers
    useEffect(() => {
        const map = mapInstance
        if (!map) return
        
        const mapboxMap = map.getMap?.()
        if (!mapboxMap) return

        // --- Handlers ---

        const handleClick = (e: any) => {
            const { lng, lat } = e.lngLat
            const currentMarkers = markersRef.current
            
            // Start new drawing or add point
            if (currentMarkers.length === 0) {
                 // Ensure mousemove is active (idempotent)
                 mapboxMap.on('mousemove', handleMouseMove)
            }
            
            setMarkers(prev => [...prev, { lng, lat }])
        }

        const handleMouseMove = (e: any) => {
            const { lng, lat } = e.lngLat
            const currentMarkers = markersRef.current
            
            if (currentMarkers.length === 0) {
                setPreviewLine(EMPTY_FEATURE_COLLECTION)
                return
            }

            const lastPoint = currentMarkers[currentMarkers.length - 1]
            const coords: [number, number][] = [[lastPoint.lng, lastPoint.lat], [lng, lat]]

            setPreviewLine({
                type: 'FeatureCollection',
                features: [{ 
                    type: 'Feature', 
                    properties: {}, 
                    geometry: { type: 'LineString', coordinates: coords } 
                }]
            })
        }

        const handleDoubleClick = (e: any) => {
            const currentMarkers = markersRef.current
            console.log("Finish drawing. Markers:", currentMarkers)

            if (currentMarkers.length >= 2) {
                const coords = currentMarkers.map(p => [p.lng, p.lat])
                const newFeature: Feature<LineString> = { 
                    type: 'Feature', 
                    properties: {}, 
                    geometry: { type: 'LineString', coordinates: coords } 
                }

                // Save to history
                setHistoryLines(prev => ({
                    ...prev,
                    features: [...prev.features, newFeature]
                }))
                setHistoryMarkers(prev => [...prev, currentMarkers])
            }

            // Reset current drawing state
            setMarkers([])
            setCurrentLine(EMPTY_FEATURE_COLLECTION)
            setPreviewLine(EMPTY_FEATURE_COLLECTION)

            // Re-enable interactions if needed, or cleanup
            // mapboxMap.doubleClickZoom.enable() // Optional: keep disabled if tool is still active
            mapboxMap.off('mousemove', handleMouseMove)
        }

        // --- Event Binding ---
        mapboxMap.on('click', handleClick)
        mapboxMap.on('dblclick', handleDoubleClick)
        mapboxMap.on('mousemove', handleMouseMove)
        mapboxMap.doubleClickZoom.disable() // Important for drawing UX

        // --- Cleanup ---
        return () => {
            mapboxMap.off('click', handleClick)
            mapboxMap.off('dblclick', handleDoubleClick)
            mapboxMap.off('mousemove', handleMouseMove)
            mapboxMap.doubleClickZoom.enable() // Restore default behavior on unmount
        }
    }, [mapInstance])


    // 3. Render Helpers
    const renderHistoryLines = useMemo(() => {
        return historyLines.features.map((feature, idx) => (
            <Source
                key={`history-line-${idx}`}
                id={`history-line-source-${idx}`}
                type="geojson"
                data={{ type: 'FeatureCollection', features: [feature] }}
            >
                <Layer id={`history-line-layer-${idx}`} {...LAYER_STYLE} />
            </Source>
        ))
    }, [historyLines])

    const renderMarkers = (points: LngLat[], keyPrefix: string) => (
        points.map((p, idx) => (
            <Marker 
                key={`${keyPrefix}-${idx}`} 
                longitude={p.lng} 
                latitude={p.lat} 
                anchor="center"
            >
                <div className="size-2 rounded-full bg-amber-500 border border-white shadow-sm" />
            </Marker>
        ))
    )

    if (!styleReady) return null

    return (
        <>
            {/* --- History Data --- */}
            {renderHistoryLines}
            {historyMarkers.map((group, idx) => 
                <div key={`history-group-${idx}`}>
                    {renderMarkers(group, `history-m-${idx}`)}
                </div>
            )}

            {/* --- Current Drawing --- */}
            <Source id="current-line-source" type="geojson" data={currentLine}>
                <Layer id="current-line-layer" {...LAYER_STYLE} />
            </Source>

            {/* --- Preview Line (Rubber band) --- */}
            <Source id="preview-line-source" type="geojson" data={previewLine}>
                <Layer 
                    id="preview-line-layer" 
                    type="line"
                    paint={PREVIEW_LINE_PAINT_STYLE} 
                />
            </Source>

            {/* --- Current Markers --- */}
            {renderMarkers(markers, 'current-m')}
        </>
    )
}

