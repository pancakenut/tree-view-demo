import { Layer, Marker, Source, useMap } from "react-map-gl/mapbox";
import { useEffect, useState } from 'react'
import type { FeatureCollection, LineString, Feature } from 'geojson'


export default function Test() {
    const maps = useMap() as any
    console.log("🚀 ~ Test ~ maps:", maps)
    const map3 = maps?.map3
    const [styleReady, setStyleReady] = useState(false)
    useEffect(() => {
        const m = map3?.getMap?.()
        if (!m) return
        const onLoad = () => setStyleReady(true)
        if (m.isStyleLoaded()) setStyleReady(true)
        else m.once('load', onLoad)
        return () => { m.off('load', onLoad as any) }
    }, [map3])

    // const geojson: FeatureCollection<LineString> = {
    //     "type": "FeatureCollection",
    //     "features": [
    //         {
    //             "type": "Feature",
    //             "properties": {},
    //             "geometry": {
    //                 "coordinates": [
    //                     // [
    //                     //     114.31569958683394,
    //                     //     30.62318812003717
    //                     // ],
    //                     // [
    //                     //     114.34144541144809,
    //                     //     30.61314131873084
    //                     // ]
    //                 ],
    //                 "type": "LineString"
    //             }
    //         }
    //     ]
    // }

    const [lineData, setLineData] = useState<FeatureCollection<LineString>>({
        type: 'FeatureCollection',
        features: [{
            type: 'Feature', properties: {}, geometry: {
                type: 'LineString',
                coordinates: []
            }
        }]
    })

    const [lastLineData, setLastLineData] = useState<FeatureCollection<LineString>>({
        type: 'FeatureCollection',
        features: [{
            type: 'Feature', properties: {}, geometry: {
                type: 'LineString',
                coordinates: []
            }
        }]
    })
    console.log("🚀 ~ Test ~ lastLineData:", lastLineData)

    const layerStyle = {
        type: 'line' as const,
        paint: { 'line-color': '#00ffff', 'line-width': 3 }
    }

    type LngLat = { lng: number; lat: number }
    const [markerArr, setMarkerArr] = useState<LngLat[]>([])
    const [lineRange, setLineRange] = useState<[LngLat | null, LngLat | null]>([null, null])

    useEffect(() => {
        const map = map3
        if (!map) return
        const handler = (e: any) => {
            const { lng, lat } = e.lngLat
            setMarkerArr(prev => [...prev, { lng, lat }])
            setLineRange(([, end]) => [{ lng, lat }, end])
        }

        const moveHandle = (e: any) => {
            const { lng, lat } = e.lngLat
            console.log("🚀 ~ moveHandle ~ e.lngLat:", e.lngLat)
            setLineRange(([start]) => {
                const nextEnd = { lng, lat }
                console.log("🚀 ~ moveHandle ~ nextEnd:", nextEnd)
                const coords: [number, number][] = start ? [[start.lng, start.lat], [nextEnd.lng, nextEnd.lat]] : []
                console.log("🚀 ~ moveHandle ~ coords:", coords)
                setLastLineData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }] })
                return [start, nextEnd]
            })
        }
        map?.getMap?.()?.on('click', handler)
        map?.getMap?.()?.on('mousemove', moveHandle)


        return () => {
            map?.getMap?.()?.off('click', handler)
            map?.getMap?.()?.off('mousemove', moveHandle)
        }
    }, [map3])


    useEffect(() => {
        if (markerArr.length >= 2) {
            setLineData({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {

                        },
                        geometry: {
                            type: 'LineString',
                            coordinates: markerArr.map(p => [p.lng, p.lat])
                        }
                    }
                ]
            })
        }
    }, [markerArr])

    return (
        <div>
            {styleReady && (
                <>

                    <Source id="line-source" type="geojson" data={lineData}>
                        <Layer id="line-fixed" {...layerStyle} />
                    </Source>

                    <Source id="line-preview-source" type="geojson" data={lastLineData}>
                        <Layer id="line-preview" {...layerStyle} paint={{ 'line-color': '#00ffff', 'line-width': 2, 'line-dasharray': [2, 2] }} />
                    </Source>
                </>
            )}

            {markerArr.map((value, idx) => (
                <Marker key={`m-${idx}`} longitude={value.lng} latitude={value.lat} anchor="center" >
                    <div className="size-2 rounded-full bg-amber-500"></div>
                </Marker>
            ))}

        </div>
    )
}
