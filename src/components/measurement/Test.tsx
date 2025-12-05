import { Layer, Marker, Source, useMap } from "react-map-gl/mapbox";
import { useEffect, useRef, useState } from 'react'
import type { FeatureCollection, LineString, Feature } from 'geojson'


export default function Test() {
    const maps = useMap() as any
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

    const [lineData, setLineData] = useState<FeatureCollection<LineString>>({
        type: 'FeatureCollection',
        features: [{
            type: 'Feature', properties: {}, geometry: {
                type: 'LineString',
                coordinates: []
            }
        }]
    })

    const [oldLineDatas, setOldLineDatas] = useState<FeatureCollection<LineString>>({
        type: 'FeatureCollection',
        features: []
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

    const layerStyle = {
        type: 'line' as const,
        paint: { 'line-color': '#00ffff', 'line-width': 3 }
    }

    type LngLat = { lng: number; lat: number }

    const [markerArr, setMarkerArr] = useState<LngLat[]>([])
    const [oldMarkers, setOldMarkers] = useState<LngLat[][]>([])


    const markerArrRef = useRef<LngLat[]>([])
    useEffect(() => {
        markerArrRef.current = markerArr
    }, [markerArr])

    const [lineRange, setLineRange] = useState<[LngLat | null, LngLat | null]>([null, null])

    useEffect(() => {
        const map = map3
        if (!map) return
        const handler = (e: any) => {
            const { lng, lat } = e.lngLat
            const currentMarkers = markerArrRef.current
            if (currentMarkers.length === 0) {
                // 新一轮绘制，重新开启 moveHandle 监听
                map?.getMap?.()?.on('mousemove', moveHandle)
                setMarkerArr([{ lng, lat }])
                // 其他初始化逻辑...
            } else {
                setMarkerArr(prev => [...prev, { lng, lat }])
            }
            setLineRange(([, end]) => [{ lng, lat }, end])
        }

        const dblHandler = (e: any) => {
            // 如果希望双击确认最后一个点，可加： 
            // const { lng, lat } = e.lngLat
            // setMarkerArr(prev => [...prev, { lng, lat }])
            const currentMarkers = markerArrRef.current
            console.log("🚀 ~ dblHandler ~ markerArr:", currentMarkers)
            if (currentMarkers.length >= 2) {
                const coords = currentMarkers.map(p => [p.lng, p.lat]);
                const feature: Feature<LineString> = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }

                // 将上一段的线段坐标保存
                setOldLineDatas(prev => ({
                    type: 'FeatureCollection',
                    features: [...prev.features, feature]
                }))

                // 保存端点
                setOldMarkers(prev => [...prev, currentMarkers])
            }
            setMarkerArr([])
            setLineData({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] }
                }]
            })
            setLastLineData({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] }
                }]
            })
            // 这里建议不要卸载事件监听，否则无法继续绘制
            map?.getMap?.()?.doubleClickZoom?.enable?.()
            map?.getMap?.()?.off('mousemove', moveHandle)
        }

        const moveHandle = (e: any) => {
            const { lng, lat } = e.lngLat
            setLineRange(([start]) => {
                const nextEnd = { lng, lat }
                const coords: [number, number][] = start ? [[start.lng, start.lat], [nextEnd.lng, nextEnd.lat]] : []
                setLastLineData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }] })
                return [start, nextEnd]
            })
        }

        map?.getMap?.()?.on('click', handler)
        map?.getMap?.()?.on('dblclick', dblHandler)
        map?.getMap?.()?.doubleClickZoom?.disable?.()
        map?.getMap?.()?.on('mousemove', moveHandle)


        return () => {
            // map?.getMap?.()?.off('click', handler)
            // map?.getMap?.()?.off('dblclick', dblHandler)
            // map?.getMap?.()?.off('mousemove', moveHandle)
            // map?.getMap?.()?.doubleClickZoom?.enable?.()
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
                    {/* 历史线段 */}
                    {oldLineDatas.features.map((feature, idx) => (
                        <Source
                            key={`fixed-line-${idx}`}
                            id={`fixed-line-source-${idx}`}
                            type="geojson"
                            data={{
                                type: 'FeatureCollection',
                                features: [feature]
                            }}
                        >
                            <Layer id={`line-fixed-${idx}`} {...layerStyle} />
                        </Source>
                    ))}

                    {/* 现有绘制线段 */}
                    <Source id="line-source" type="geojson" data={lineData}>
                        <Layer id="line-fixed" {...layerStyle} />
                    </Source>

                    <Source id="line-preview-source" type="geojson" data={lastLineData}>
                        <Layer id="line-preview" {...layerStyle} paint={{ 'line-color': '#00ffff', 'line-width': 2, 'line-dasharray': [2, 2] }} />
                    </Source>
                </>
            )}

            {oldMarkers.map((markerGroup, idx) =>
                markerGroup.map((value, mIdx) => (
                    <Marker key={`old-m-${idx}-${mIdx}`} longitude={value.lng} latitude={value.lat} anchor="center">
                        <div className="size-2 rounded-full bg-amber-500"></div>
                    </Marker>
                ))
            )}

            {markerArr.map((value, idx) => (
                <Marker key={`m-${idx}`} longitude={value.lng} latitude={value.lat} anchor="center" >
                    <div className="size-2 rounded-full bg-amber-500"></div>
                </Marker>
            ))}

        </div>
    )
}
