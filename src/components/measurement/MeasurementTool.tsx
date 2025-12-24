import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { Layer, Marker, useMap, Source } from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import type { FeatureCollection, LineString, Position } from "geojson";
import type { MapMouseEvent } from "mapbox-gl";
import { measurementStore, measurementActions } from '@/store/measurementStore'

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

function MeasurementTool() {
  const snap = useSnapshot(measurementStore)

  const { current: map } = useMap()

  useEffect(() => {
    if (!map) return

    const onClick = (e: MapMouseEvent) => {
      const { lng, lat } = e.lngLat
      // setMarkerArr(prev => [...prev, [lng, lat]])
      measurementActions.addPoint(lng, lat)
    }

    const onMouseMove = (e: MapMouseEvent) => {
      const { lng: lng_end, lat: lat_end } = e.lngLat
      measurementActions.setPreviewLineEnd(lng_end, lat_end)
    }

    const onDblClick = (e: MapMouseEvent) => {
      e.preventDefault();
      measurementActions.finishDrawing()
    }

    map.on('click', onClick)
    map.on('mousemove', onMouseMove)
    map.on('dblclick', onDblClick)

    return () => {
      map.off('click', onClick)
      map.off('mousemove', onMouseMove)
      map.off('dblclick', onDblClick)
    }
  }, [map])

  const previewGeoJSON: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: snap.previewLine as Position[]
        },
        properties: {}
      }
    ]
  }

  // 确保彻底去除 Proxy 包装，获取纯净数组
  // 这是为了解决 Mapbox 可能无法识别 Proxy 对象或无法检测其变化的问题
  const cleanMarkerArr = JSON.parse(JSON.stringify(snap.markerArr));

  const currentLineGeoJSON: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: cleanMarkerArr.length >= 2 ? [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: cleanMarkerArr
        },
        properties: {}
      },
    ] : []
  }

  // 从 oldMarkerData 中提取所有坐标点和对应的标签
  const allOldMarkers = snap.oldMarkerData.features.flatMap(feature => {
    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates;
      const labels = feature.properties?.distanceLabels as string[] || [];
      
      return coords.map((coord, idx) => ({
        coord,
        label: labels[idx] || ''
      }));
    }

    return [];
  })

  return (
    <>
      {/* 已画线段的端点 */}
      {
        allOldMarkers.map((item, idx) => (
          <Marker
            key={`old-marker-${idx}`}
            longitude={item.coord[0]}
            latitude={item.coord[1]}
            anchor="center"
          >
            <div className="relative">
              {item.label && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-white rounded shadow text-xs font-medium text-slate-700 whitespace-nowrap pointer-events-none z-10">
                  {item.label}
                  {/* 小三角箭头 */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white" />
                </div>
              )}
              <div className="size-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
            </div>
          </Marker>
        ))
      }

      {/* 正在画的线段端点 */}
      {
        snap.markerArr.map((coord, idx) => (
          <Marker
            key={`current-marker-${idx}`}
            longitude={coord[0]}
            latitude={coord[1]}
            anchor="center"
          >
             <div className="relative">
              {snap.distanceLabels[idx] && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-white rounded shadow text-xs font-medium text-slate-700 whitespace-nowrap pointer-events-none z-10">
                  {snap.distanceLabels[idx]}
                  {/* 小三角箭头 */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white" />
                </div>
              )}
              <div className="size-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
            </div>
          </Marker>
        ))
      }

      {/* 已画线段 */}
      <Source id="old-line-source" type="geojson" data={snap.oldMarkerData as FeatureCollection}>
        <Layer {...lineLayer} id="old-line-layer" />
      </Source>

      {/* 正在画的线段 */}
      <Source
        id="current-line-source"
        type="geojson"
        data={currentLineGeoJSON}
      >
        <Layer {...lineLayer} id="current-line-layer" />
      </Source>

      {/* 预览线 */}
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
