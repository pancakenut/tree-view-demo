import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './mapbox-view.css'

const ACCESS_TOKEN = 'pk.eyJ1IjoieXFya21qdXciLCJhIjoiY21oOGl5ODdiMHpjdzJscHV1bTB1Z2xyMCJ9.T_yab55Le7PZDmzpqAkwEg'

// 接受来自 helux 的只读原子（含 val）或直接字符串 ID
export default function MapboxView({ selectedItemId, layerToggles }: { selectedItemId?: string | { val: string | undefined }, layerToggles?: Record<string, boolean> }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const [showPolygonLayer, setShowPolygonLayer] = useState(false)
  const [showBaseLayer, setShowBaseLayer] = useState(true)
  const [currentBaseLayer, setCurrentBaseLayer] = useState<'OpenStreetMap' | 'Custom Style'>('OpenStreetMap')
  const [currentZoom, setCurrentZoom] = useState(12)
  const [currentCenter, setCurrentCenter] = useState('30.6000, 114.3000')

  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = ACCESS_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/yqrkmjuw/cmh8x9cc900b901qp2ezog78v',
      center: [114.3, 30.6],
      zoom: 12,
    })

    map.on('load', () => {
      // 原有 polygon features
      map.addSource('polygon-features', {
        type: 'vector',
        tiles: ['http://localhost:8088/polygon_features/{z}/{x}/{y}'],
        minzoom: 0,
        maxzoom: 22,
      })

      map.addLayer({
        id: 'polygon-fill',
        type: 'fill',
        source: 'polygon-features',
        'source-layer': 'polygon_features',
        paint: {
          'fill-color': '#ff4757',
          'fill-opacity': 0.8,
        },
      })

      map.addLayer({
        id: 'polygon-stroke',
        type: 'line',
        source: 'polygon-features',
        'source-layer': 'polygon_features',
        paint: {
          'line-color': '#2f3542',
          'line-width': 3,
          'line-opacity': 1,
        },
      })

      map.on('click', 'polygon-fill', (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          const properties = e.features[0].properties as Record<string, any>
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              `<div>
                <h4>Polygon Feature</h4>
                <p><strong>ID:</strong> ${properties?.gid ?? 'N/A'}</p>
                <p><strong>Layer Name:</strong> ${properties?.layername ?? 'N/A'}</p>
                <p><strong>区域名称:</strong> ${properties?.xzqmc ?? 'N/A'}</p>
                <p><strong>面积:</strong> ${properties?.mj ?? 'N/A'}</p>
              </div>`
            )
            .addTo(map)
        }
      })

      map.on('mouseenter', 'polygon-fill', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'polygon-fill', () => {
        map.getCanvas().style.cursor = ''
      })

      // 初始状态隐藏图层，等待树节点联动控制
      map.setLayoutProperty('polygon-fill', 'visibility', 'none')
      map.setLayoutProperty('polygon-stroke', 'visibility', 'none')

      // 新增：生态红线图层（WGS84 / SRID 4326）
      if (!map.getSource('eco-redline-source')) {
        map.addSource('eco-redline-source', {
          type: 'vector',
          tiles: ['http://localhost:8088/polygon_features_hongxian_84/{z}/{x}/{y}'],
          minzoom: 0,
          maxzoom: 22,
        })
      }

      if (!map.getLayer('eco-redline-fill')) {
        map.addLayer({
          id: 'eco-redline-fill',
          type: 'fill',
          source: 'eco-redline-source',
          'source-layer': 'polygon_features_hongxian_84',
          paint: {
            'fill-color': '#1abc9c',
            'fill-opacity': 0.6,
          },
        })
      }

      if (!map.getLayer('eco-redline-outline')) {
        map.addLayer({
          id: 'eco-redline-outline',
          type: 'line',
          source: 'eco-redline-source',
          'source-layer': 'polygon_features_hongxian_84',
          paint: {
            'line-color': '#0e6655',
            'line-width': 2,
            'line-opacity': 0.9,
          },
        })
      }

      // 初始隐藏生态红线图层，等待树节点联动
      map.setLayoutProperty('eco-redline-fill', 'visibility', 'none')
      map.setLayoutProperty('eco-redline-outline', 'visibility', 'none')

      // 生态红线点击弹窗
      map.on('click', 'eco-redline-fill', (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          const p = e.features[0].properties as Record<string, any>
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              `<div>
                <h4>生态红线</h4>
                <p><strong>名称:</strong> ${p?.hxmc ?? 'N/A'}</p>
                <p><strong>类型:</strong> ${p?.hxlx ?? 'N/A'}</p>
                <p><strong>面积:</strong> ${p?.mj ?? 'N/A'}</p>
                <p><strong>行政区:</strong> ${p?.xzqmc ?? 'N/A'}</p>
              </div>`
            )
            .addTo(map)
        }
      })

      map.on('mouseenter', 'eco-redline-fill', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'eco-redline-fill', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    const updateMapInfo = () => {
      setCurrentZoom(Math.round(map.getZoom() * 100) / 100)
      const center = map.getCenter()
      setCurrentCenter(`${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`)
    }

    map.on('moveend', updateMapInfo)
    map.on('zoomend', updateMapInfo)

    updateMapInfo()

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  const togglePolygonLayer = () => {
    const map = mapRef.current
    if (!map) return
    const visibility = showPolygonLayer ? 'none' : 'visible'
    map.setLayoutProperty('polygon-fill', 'visibility', visibility)
    map.setLayoutProperty('polygon-stroke', 'visibility', visibility)
    setShowPolygonLayer(!showPolygonLayer)
  }

  // 根据开关状态联动图层显示（点击树菜单开关控制）
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const shouldShow = !!(layerToggles?.polygon)
    if (map.getLayer('polygon-fill') && map.getLayer('polygon-stroke')) {
      map.setLayoutProperty('polygon-fill', 'visibility', shouldShow ? 'visible' : 'none')
      map.setLayoutProperty('polygon-stroke', 'visibility', shouldShow ? 'visible' : 'none')
      setShowPolygonLayer(shouldShow)
    }

    // 生态红线联动：由开关 hongxian 控制
    const showEco = !!(layerToggles?.hongxian)
    if (map.getLayer('eco-redline-fill') && map.getLayer('eco-redline-outline')) {
      map.setLayoutProperty('eco-redline-fill', 'visibility', showEco ? 'visible' : 'none')
      map.setLayoutProperty('eco-redline-outline', 'visibility', showEco ? 'visible' : 'none')
      if (showEco) {
        // 适配到生态红线数据范围（WGS84 bbox）
        map.fitBounds(
          [
            [113.76092360741322, 30.06905385671089],
            [115.06062572190255, 31.358057290337346],
          ],
          { padding: 20, duration: 600 }
        )
      }
    }
  }, [layerToggles])

  const toggleBaseLayer = () => {
    const map = mapRef.current
    if (!map) return

    if (currentBaseLayer === 'OpenStreetMap') {
      map.setStyle('mapbox://styles/yqrkmjuw/cmh8x9cc900b901qp2ezog78v')
      setCurrentBaseLayer('Custom Style')
    } else {
      map.setStyle({
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
          },
        ],
      })
      setCurrentBaseLayer('OpenStreetMap')
    }

    map.once('styledata', () => {
      if (!map) return

      if (!(map.getSource('polygon-source') as any)) {
        map.addSource('polygon-source', {
          type: 'vector',
          tiles: ['http://localhost:8088/polygon_features_wgs84/{z}/{x}/{y}'],
          minzoom: 0,
          maxzoom: 14,
        })
      }

      if (!map.getLayer('polygon-layer')) {
        map.addLayer({
          id: 'polygon-layer',
          type: 'fill',
          source: 'polygon-source',
          'source-layer': 'polygon_features_wgs84',
          paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.6,
          },
        })
      }

      if (!map.getLayer('polygon-outline')) {
        map.addLayer({
          id: 'polygon-outline',
          type: 'line',
          source: 'polygon-source',
          'source-layer': 'polygon_features_wgs84',
          paint: {
            'line-color': '#ff0000',
            'line-width': 2,
          },
        })
      }

      // 切换底图后重新添加生态红线图层
      if (!(map.getSource('eco-redline-source') as any)) {
        map.addSource('eco-redline-source', {
          type: 'vector',
          tiles: ['http://localhost:8088/polygon_features_hongxian_84/{z}/{x}/{y}'],
          minzoom: 0,
          maxzoom: 22,
        })
      }

      if (!map.getLayer('eco-redline-fill')) {
        map.addLayer({
          id: 'eco-redline-fill',
          type: 'fill',
          source: 'eco-redline-source',
          'source-layer': 'polygon_features_hongxian_84',
          paint: {
            'fill-color': '#1abc9c',
            'fill-opacity': 0.6,
          },
        })
      }
      if (!map.getLayer('eco-redline-outline')) {
        map.addLayer({
          id: 'eco-redline-outline',
          type: 'line',
          source: 'eco-redline-source',
          'source-layer': 'polygon_features_hongxian_84',
          paint: {
            'line-color': '#0e6655',
            'line-width': 2,
            'line-opacity': 0.9,
          },
        })
      }
      // 保持与当前开关状态一致
      const showEco = !!(layerToggles?.hongxian)
      map.setLayoutProperty('eco-redline-fill', 'visibility', showEco ? 'visible' : 'none')
      map.setLayoutProperty('eco-redline-outline', 'visibility', showEco ? 'visible' : 'none')
    })
  }

  const hideBaseLayer = () => {
    const map = mapRef.current
    if (!map) return

    if (currentBaseLayer === 'Custom Style') {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.opacity = showBaseLayer ? '0' : '1'
      }
    } else {
      const visibility = showBaseLayer ? 'none' : 'visible'
      if (map.getLayer('osm-layer')) {
        map.setLayoutProperty('osm-layer', 'visibility', visibility)
      }
    }
    setShowBaseLayer(!showBaseLayer)
  }

  return (
    <div className="mapbox-container">
      <h1>Mapbox 瓦片地图展示</h1>
      <div className="map-controls">
        <button onClick={togglePolygonLayer} className={showPolygonLayer ? 'active' : ''}>
          {showPolygonLayer ? '隐藏' : '显示'} Polygon Features
        </button>
        <button onClick={toggleBaseLayer}>切换底图 ({currentBaseLayer})</button>
        <button onClick={hideBaseLayer} className={!showBaseLayer ? 'active' : ''}>
          {showBaseLayer ? '隐藏底图' : '显示底图'}
        </button>
      </div>
      <div ref={mapContainerRef} id="mapbox-map" className="mapbox-map" />
      <div className="map-info">
        <h3>瓦片信息</h3>
        <p>
          <strong>Martin 服务器:</strong> http://localhost:8088
        </p>
        <p>
          <strong>Polygon Features 瓦片:</strong> http://localhost:8088/polygon_features/{'{z}/{x}/{y}'}
        </p>
        <p>
          <strong>生态红线瓦片:</strong> http://localhost:8088/polygon_features_hongxian_84/{'{z}/{x}/{y}'}
        </p>
        <p>
          <strong>当前缩放级别:</strong> {currentZoom}
        </p>
        <p>
          <strong>当前中心点:</strong> {currentCenter}
        </p>
        <p>
          <strong>地图框架:</strong> Mapbox GL JS
        </p>
      </div>
    </div>
  )
}