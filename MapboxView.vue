<template>
  <div class="mapbox-container">
    <h1>Mapbox 瓦片地图展示</h1>
    <div class="map-controls">
      <button @click="togglePolygonLayer" :class="{ active: showPolygonLayer }">
        {{ showPolygonLayer ? '隐藏' : '显示' }} Polygon Features
      </button>
      <button @click="toggleBaseLayer">
        切换底图 ({{ currentBaseLayer }})
      </button>
      <button @click="hideBaseLayer" :class="{ active: !showBaseLayer }">
        {{ showBaseLayer ? '隐藏底图' : '显示底图' }}
      </button>
    </div>
    <div id="mapbox-map" class="mapbox-map"></div>
    <div class="map-info">
      <h3>瓦片信息</h3>
      <p><strong>Martin 服务器:</strong> http://localhost:8088</p>
      <p><strong>Polygon Features 瓦片:</strong> http://localhost:8088/polygon_features/{z}/{x}/{y}</p>
      <p><strong>当前缩放级别:</strong> {{ currentZoom }}</p>
      <p><strong>当前中心点:</strong> {{ currentCenter }}</p>
      <p><strong>地图框架:</strong> Mapbox GL JS</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// 响应式数据
const showPolygonLayer = ref(true)
const showBaseLayer = ref(true)
const currentBaseLayer = ref('OpenStreetMap')
const currentZoom = ref(12)
const currentCenter = ref('30.6000, 114.3000')

// 地图实例
let map: mapboxgl.Map | null = null

// 初始化地图
const initMap = () => {
  // 设置Mapbox访问令牌
  mapboxgl.accessToken = 'pk.eyJ1IjoieXFya21qdXciLCJhIjoiY21oOGl5ODdiMHpjdzJscHV1bTB1Z2xyMCJ9.T_yab55Le7PZDmzpqAkwEg'
  
  // 创建Mapbox地图实例，使用自定义样式
  map = new mapboxgl.Map({
    container: 'mapbox-map',
    style: 'mapbox://styles/yqrkmjuw/cmh8x9cc900b901qp2ezog78v', // 使用自定义样式
    center: [114.3, 30.6], // 武汉坐标
    zoom: 12
  })

  // 地图加载完成后添加矢量瓦片图层
  map.on('load', () => {
    // 添加Martin矢量瓦片数据源
    map!.addSource('polygon-features', {
      type: 'vector',
      tiles: ['http://localhost:8088/polygon_features/{z}/{x}/{y}'],
      minzoom: 0,
      maxzoom: 22
    })

    // 添加多边形填充图层
    map!.addLayer({
      id: 'polygon-fill',
      type: 'fill',
      source: 'polygon-features',
      'source-layer': 'polygon_features',
      paint: {
        'fill-color': '#ff4757',
        'fill-opacity': 0.8
      }
    })

    // 添加多边形边框图层
    map!.addLayer({
      id: 'polygon-stroke',
      type: 'line',
      source: 'polygon-features',
      'source-layer': 'polygon_features',
      paint: {
        'line-color': '#2f3542',
        'line-width': 3,
        'line-opacity': 1
      }
    })

    // 添加点击事件
    map!.on('click', 'polygon-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const properties = e.features[0].properties
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div>
              <h4>Polygon Feature</h4>
              <p><strong>ID:</strong> ${properties?.gid || 'N/A'}</p>
              <p><strong>Layer Name:</strong> ${properties?.layername || 'N/A'}</p>
              <p><strong>区域名称:</strong> ${properties?.xzqmc || 'N/A'}</p>
              <p><strong>面积:</strong> ${properties?.mj || 'N/A'}</p>
            </div>
          `)
          .addTo(map!)
      }
    })

    // 鼠标悬停效果
    map!.on('mouseenter', 'polygon-fill', () => {
      map!.getCanvas().style.cursor = 'pointer'
    })

    map!.on('mouseleave', 'polygon-fill', () => {
      map!.getCanvas().style.cursor = ''
    })
  })

  // 监听地图移动和缩放事件
  map.on('moveend', updateMapInfo)
  map.on('zoomend', updateMapInfo)

  // 初始化地图信息
  updateMapInfo()
}

// 更新地图信息
const updateMapInfo = () => {
  if (!map) return
  
  currentZoom.value = Math.round(map.getZoom() * 100) / 100
  const center = map.getCenter()
  currentCenter.value = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
}

// 切换 polygon 图层显示/隐藏
const togglePolygonLayer = () => {
  if (!map) return
  
  const visibility = showPolygonLayer.value ? 'none' : 'visible'
  map.setLayoutProperty('polygon-fill', 'visibility', visibility)
  map.setLayoutProperty('polygon-stroke', 'visibility', visibility)
  showPolygonLayer.value = !showPolygonLayer.value
}

// 切换底图
const toggleBaseLayer = () => {
  if (!map) return
  
  if (currentBaseLayer.value === 'OpenStreetMap') {
    // 切换到自定义样式
    map.setStyle('mapbox://styles/yqrkmjuw/cmh8x9cc900b901qp2ezog78v')
    currentBaseLayer.value = 'Custom Style'
  } else {
    // 切换回OSM
    map.setStyle({
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm'
        }
      ]
    })
    currentBaseLayer.value = 'OpenStreetMap'
  }
  
  // 样式切换后需要重新添加矢量瓦片图层
  map.once('styledata', () => {
    if (!map || map.getSource('polygon-source')) return // 避免重复添加
    
    // 重新添加矢量瓦片源
    map.addSource('polygon-source', {
      type: 'vector',
      tiles: ['http://localhost:8088/polygon_features_wgs84/{z}/{x}/{y}'],
      minzoom: 0,
      maxzoom: 14
    })

    // 重新添加图层
    map.addLayer({
      id: 'polygon-layer',
      type: 'fill',
      source: 'polygon-source',
      'source-layer': 'polygon_features_wgs84',
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.6
      }
    })

    map.addLayer({
      id: 'polygon-outline',
      type: 'line',
      source: 'polygon-source',
      'source-layer': 'polygon_features_wgs84',
      paint: {
        'line-color': '#ff0000',
        'line-width': 2
      }
    })
  })
}

// 隐藏/显示底图
const hideBaseLayer = () => {
  if (!map) return
  
  if (currentBaseLayer.value === 'Custom Style') {
    // 对于自定义样式，切换整个地图的可见性
    const mapContainer = document.getElementById('mapbox-map')
    if (mapContainer) {
      mapContainer.style.opacity = showBaseLayer.value ? '0' : '1'
    }
  } else {
    // 对于OSM样式，切换图层可见性
    const visibility = showBaseLayer.value ? 'none' : 'visible'
    if (map.getLayer('osm-layer')) {
      map.setLayoutProperty('osm-layer', 'visibility', visibility)
    }
  }
  showBaseLayer.value = !showBaseLayer.value
}

// 组件挂载时初始化地图
onMounted(() => {
  initMap()
})

// 组件卸载时清理地图
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.mapbox-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.map-controls {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.map-controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.map-controls button:hover {
  background: #e9ecef;
}

.map-controls button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.mapbox-map {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: white; /* 设置白色背景 */
}

.map-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.map-info h3 {
  margin-top: 0;
  color: #495057;
}

.map-info p {
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.map-info strong {
  color: #007bff;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
</style>