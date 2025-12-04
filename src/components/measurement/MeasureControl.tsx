import { useEffect, useState } from 'react'
import { useMap, Marker, Source, Layer } from 'react-map-gl/mapbox'

const toRad = (d: number) => (d * Math.PI) / 180
const haversine = (a: { lng: number; lat: number }, b: { lng: number; lat: number }) => {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export default function MeasureControl({ mapId = 'map3' }: { mapId?: string }) {
  const maps = useMap() as any
  const mapRef = maps[mapId]
  const [enabled, setEnabled] = useState(false)
  const [distance, setDistance] = useState(0)
  const [points, setPoints] = useState<{ lng: number; lat: number }[]>([])
  const [cursor, setCursor] = useState<{ lng: number; lat: number } | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let total = 0
    for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i])
    setDistance(total)
  }, [points])

  useEffect(() => {
    const map = mapRef?.getMap()
    if (!map) return
    const handler = (e: any) => {
      if (!enabled) return
      const { lng, lat } = e.lngLat
      setPoints((prev) => [...prev, { lng, lat }])
    }
    map.doubleClickZoom?.disable?.()
    map.on('click', handler)
    const finish = (e: any) => {
      if (!enabled) return
      const { lng, lat } = e.lngLat
      setPoints((prev) => [...prev, { lng, lat }])
      setCursor(null)
      setEnabled(false)
      setFinished(true)
    }
    map.on('dblclick', finish)
    return () => {
      map.off('click', handler)
      map.off('dblclick', finish)
      map.doubleClickZoom?.enable?.()
    }
  }, [enabled, mapRef])

  useEffect(() => {
    const map = mapRef?.getMap()
    if (!map) return
    const move = (e: any) => {
      if (!enabled) return
      const { lng, lat } = e.lngLat
      setCursor({ lng, lat })
    }
    map.on('mousemove', move)
    return () => {
      map.off('mousemove', move)
      setCursor(null)
    }
  }, [enabled, mapRef])

  const clear = () => {
    setPoints([])
    setDistance(0)
    setFinished(false)
  }

  return (
    <>
      {points.length >= 2 && (
        <Source
          id={`distance-line-${mapId}`}
          type="geojson"
          data={{ type: 'Feature', geometry: { type: 'LineString', coordinates: points.map((p) => [p.lng, p.lat]) }, properties: {} }}
        >
          <Layer id={`distance-line-${mapId}`} type="line" paint={{ 'line-color': '#ff4444', 'line-width': 3 }} layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
        </Source>
      )}
      {enabled && points.length >= 1 && cursor && (
        <Source
          id={`distance-line-preview-${mapId}`}
          type="geojson"
          data={{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [...points.map((p) => [p.lng, p.lat]), [cursor.lng, cursor.lat]] },
            properties: {},
          }}
        >
          <Layer id={`distance-line-preview-${mapId}`} type="line" paint={{ 'line-color': '#ff4444', 'line-width': 2, 'line-dasharray': [2, 2] }} layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
        </Source>
      )}
      {points.map((p, i) => {
        const seg = i > 0 ? haversine(points[i - 1], points[i]) : 0
        return (
          <>
            <Marker key={`dot-${mapId}-${i}`} longitude={p.lng} latitude={p.lat} anchor="center">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4444', border: '2px solid #fff', boxShadow: '0 0 2px rgba(0,0,0,0.4)' }} />
            </Marker>
            <Marker key={`label-${mapId}-${i}`} longitude={p.lng} latitude={p.lat} anchor="top" offset={[0, 14]}>
              <div style={{ fontSize: 12, color: '#222', background: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {i > 0 ? `${seg.toFixed(1)} m` : '0 m'}
              </div>
            </Marker>
          </>
        )
      })}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 8 }}>
        <button onClick={() => setEnabled((v) => !v)}>{enabled ? 'Stop Measure' : 'Start Measure'}</button>
        <button onClick={clear}>Clear</button>
        <span>{distance > 0 ? `${(distance / 1000).toFixed(3)} km` : ''}</span>
      </div>
    </>
  )
}
