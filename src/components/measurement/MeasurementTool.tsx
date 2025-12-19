import { Layer, Marker, useMap, Source } from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import type { FeatureCollection, LineString, MultiPoint, Point, Position } from "geojson";
import { useEffect, useState } from "react";
import type { MapMouseEvent } from "mapbox-gl";

const geojson: FeatureCollection<LineString> = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            114.29747863235701,
            30.59377993447046
          ],
          [
            114.29998205545189,
            30.59227647643688
          ],
          [
            114.3021070541231,
            30.59377993447046
          ]
        ],
        "type": "LineString"
      }
    }
  ]
}

const lineLayer: LayerProps = {
  id: 'line',
  type: 'line',
  paint: {
    'line-color': '#4E3FC8',
    'line-width': 4
  }
};

type LngLat = {
  lng: number,
  lat: number
}

function MeasurementTool() {
  const { current: map } = useMap()

  const [markerArr, setMarkerArr] = useState<Position[]>([])
  const [oldMarkerArr, setOldMarkerArr] = useState<Position[]>([])

  const [markerData, setMarkerData] = useState<FeatureCollection<LineString>>({
    type: 'FeatureCollection',
    features: []
  })
  const [oldMrkerData, setOldMarkerData] = useState<FeatureCollection<LineString>>({
    type: 'FeatureCollection',
    features: []
  })

  const [previewLine, setPreviewLine] = useState<Position[]>([])

  useEffect(() => {
    if (!map) return

    const onClick = (e: MapMouseEvent) => {
      console.log("e", e.lngLat)
      const { lng, lat } = e.lngLat
      setMarkerArr(prev => [...prev, [lng, lat]])
      setPreviewLine([[lng, lat], [lng, lat]])
    }

    const onMouseMove = (e: MapMouseEvent) => {
      const { lng: lng_end, lat: lat_end } = e.lngLat
      setPreviewLine(prev => {
        const start = prev[0];
        if (!start) return prev;
        return [start, [lng_end, lat_end]]
      })
    }

    const onDblClick = (e: MapMouseEvent) => {
      setOldMarkerArr(prev => [...prev, ...markerArr])
      setMarkerArr([])
      setMarkerData({
        type: 'FeatureCollection',
        features: []
      })
    }

    map.on('click', onClick)
    map.on('mousemove', onMouseMove)
    map.on('dblclick', onDblClick)

    return () => {
      map.off('click', onClick)
      map.off('mousemove', onMouseMove)
    }
  }, [map])

  const previewGeoJSON: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: previewLine
        },
        properties: {}
      }
    ]
  }

  useEffect(() => {
    setMarkerData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: markerArr },
        properties: {}
      }]
    })
  }, [markerArr])

  useEffect(() => {
    setOldMarkerData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: oldMarkerArr },
        properties: {}
      }]
    })
  }, [oldMarkerArr])

  return (
    <>
      {
        markerArr.map((coord, idx) => (
          <Marker
            key={`marker-${idx}`}
            longitude={coord[0]}
            latitude={coord[1]}
            anchor="center"
          >
            <div className="size-4 rounded-full bg-red-500 border border-white shadow-sm" />
          </Marker>
        ))
      }

      <Source id="line-source" type="geojson" data={markerData}>
        <Layer {...lineLayer} />
      </Source>

      <Source id="preview-source" type="geojson" data={previewGeoJSON}>
        <Layer
          id="preview-line"
          type="line"
          paint={{
            'line-color': '#4E3FC8',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }}
        />
      </Source>
    </>
  )
}

export default MeasurementTool