import './App.css'
import { TreeView, type TreeDataItem } from './components/ui/tree-view'
import {
  Folder,
  FolderOpen,
  FolderCheck,
  File,
  FileText,
  FileCheck,
  MapPin,
  Building,
  Home,
  Settings,
  Bot
} from 'lucide-react'
import MapboxView from './components/MapboxView'
import { useState, useRef, useEffect } from 'react'
import { selectedItemId, setSelectedItemId } from '../src/store/mapAtom'
// @ts-ignore
import ComponentA from '../src/components/test/ComponentA'
// @ts-ignore
import ComponentB from '../src/components/test/ComponentB'
import { ReactMapGl } from './components/ReactMapGl'
import { Map, MapProvider, useMap } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import MeasureControl from './components/measurement/MeasureControl'
import Test from './components/measurement/Test'
import KitchenDemo from './components/test/代码执行顺序'
import MeasurementTool from './components/measurement/MeasurementTool'
import { LayerManager } from './components/layers/LayerManager'
import { ControlBtn } from './components/sidebar/controlbtn'
// import AIModule from './ai-module/AIModule'

import { layers } from '@/config/layerConfig'

const data: TreeDataItem[] = [
  {
    id: '1',
    name: '基础地理',
    icon: <Folder className="h-4 w-4 mr-1 text-blue-600" />,
    openIcon: <FolderOpen className="h-4 w-4 mr-1 text-blue-700" />,
    selectedIcon: <FolderCheck className="h-4 w-4 mr-1 text-blue-800" />,
    children: [
      {
        id: '2',
        name: '行政区划',
        // icon: <Map className="h-4 w-4 mr-1 text-green-600" />,
        selectedIcon: <MapPin className="h-4 w-4 mr-1 text-green-700" />,
        draggable: true,
      },
      {
        id: '6',
        name: '地形数据',
        icon: <File className="h-4 w-4 mr-1 text-amber-600" />,
        selectedIcon: <FileCheck className="h-4 w-4 mr-1 text-amber-700" />,
        draggable: true,
      },
    ],
  },
  {
    id: '3',
    name: '现状调查',
    icon: <Folder className="h-4 w-4 mr-1 text-gray-500" />,
    openIcon: <FolderOpen className="h-4 w-4 mr-1 text-gray-600" />,
    selectedIcon: <FolderCheck className="h-4 w-4 mr-1 text-gray-700" />,
    disabled: true,
    children: [
      {
        id: '4',
        name: '现状建设用地地类图斑',
        icon: <Building className="h-4 w-4 mr-1 text-purple-600" />,
        selectedIcon: <Home className="h-4 w-4 mr-1 text-purple-700" />,
        draggable: true,
      },
      {
        id: '9',
        name: '生态红线',
        // icon: <Map className="h-4 w-4 mr-1 text-red-600" />,
        selectedIcon: <MapPin className="h-4 w-4 mr-1 text-red-700" />,
        draggable: true,
      },
      {
        id: '5',
        name: '建筑调查',
        icon: <FileText className="h-4 w-4 mr-1 text-orange-600" />,
        selectedIcon: <FileCheck className="h-4 w-4 mr-1 text-orange-700" />,
        draggable: true,
      },
    ],
  },
  {
    id: '7',
    name: '系统配置',
    icon: <Settings className="h-4 w-4 mr-1 text-slate-600" />,
    selectedIcon: <Settings className="h-4 w-4 mr-1 text-slate-800" />,
    onClick: () => console.log('点击了系统配置'),
    children: [
      {
        id: '8',
        name: '用户设置',
        icon: <File className="h-4 w-4 mr-1 text-indigo-600" />,
        selectedIcon: <FileCheck className="h-4 w-4 mr-1 text-indigo-700" />,
        draggable: true,
      },
    ],
  },
]

const MAPBOX_TOKEN = 'pk.eyJ1IjoieXFya21qdXciLCJhIjoiY21oOGl5ODdiMHpjdzJscHV1bTB1Z2xyMCJ9.T_yab55Le7PZDmzpqAkwEg'

function NavigateButton({ mapRef }: { mapRef: React.RefObject<MapRef | null> }) {
  // const onClick = () => {
  //   const map = mapRef.current?.getMap();
  //   map?.flyTo({ center: [-74.006, 40.7128], zoom: 11, duration: 800, essential: true });
  // };

  // return <button onClick={onClick}>Go</button>;

  const { map3 } = useMap()
  const onClick = () => {
    map3?.getMap()?.flyTo({ center: [-74.006, 40.7128], zoom: 11, duration: 800 })
  }

  return <button onClick={onClick} className="bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-100 cursor-pointer" style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>Go</button>
}

import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate();
  // const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined)

  const [layerToggles, setLayerToggles] = useState<Record<string, boolean>>({
    polygon: false,
    hongxian: false,
  })
  const map3Ref = useRef<MapRef | null>(null)

  return (
    <div className="">

      {/* <div>
        <h2>验证 atom.val 直接赋值是否生效</h2>
        <ComponentA />
        <ComponentB />
      </div>
      <h1 className="text-xl mb-4">TreeView 示例</h1>
      <TreeView
        data={data}
        onSelectChange={(item) => {
          setSelectedItemId(item?.id)
          if (!item) return
          // 点击即开关图层
          if (item.id === '4' || item.name.includes('地类图斑')) {
            setLayerToggles((prev) => ({ ...prev, polygon: !prev.polygon }))
          }
          if (item.id === '9' || item.name.includes('生态红线')) {
            setLayerToggles((prev) => ({ ...prev, hongxian: !prev.hongxian }))
          }
        }}
      />
      <div className="mt-8">
        <MapboxView selectedItemId={selectedItemId.val} layerToggles={layerToggles} />
      </div>
      <div className="mt-8">
        <h2 className="text-lg mb-2">React Map GL 示例（两个地图）</h2>
        <div className="mb-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={layerToggles.linked ?? false}
              onChange={() => setLayerToggles(prev => ({ ...prev, linked: !(prev.linked ?? false) }))}
            />
            <span>联动两个地图（共享视图状态）</span>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <ReactMapGl mapId={(layerToggles.linked ?? false) ? 'shared' : 'map1'} style={{ width: 600, height: 400 }} />
          <ReactMapGl mapId={(layerToggles.linked ?? false) ? 'shared' : 'map2'} style={{ width: 600, height: 400 }} />
        </div>
      </div> */}

      <div className='w-screen h-screen'>
        <MapProvider>
          <Map
            id='map3'
            ref={map3Ref}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
              longitude: 114.31162017350988,
              latitude: 30.62161425111897,
              zoom: 14
            }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
            mapStyle="mapbox://styles/yqrkmjuw/cmh8x9cc900b901qp2ezog78v"
            reuseMaps
          >
            {/* <NavigateButton mapRef={map3Ref} /> */}
            {/* <MeasureControl mapId="map3" /> */}
            {/* <Test /> */}
            <LayerManager />
            <MeasurementTool />
          </Map>

          {/* <Map id='map2'></Map> */}
        </MapProvider>
      </div>

      <div className='absolute right-40 bottom-20 gap-1.5 grid-cols-1 grid'>
        {
          layers.map((layer) =>
            <ControlBtn key={layer.id} layerid={layer.id} />
          )
        }
      </div>

      <button
        className="absolute bottom-24 left-24 z-40 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-20 py-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-8"
        onClick={() => navigate('/ai-assistant')}
      >
        <Bot className="w-24 h-24" />
        <span className="font-bold">AI 知识库助手</span>
      </button>
    </div >
  )
}

export default App

