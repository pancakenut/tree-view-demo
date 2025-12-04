import Map from 'react-map-gl/mapbox';
import { useSnapshot } from 'valtio';
import { store } from '../store/root';
import { setMapViewState } from '../store/action';
import type { IViewState } from '@sonic/types';

const MAPBOX_TOKEN = 'pk.eyJ1IjoieXFya21qdXciLCJhIjoiY21oOGl5ODdiMHpjdzJscHV1bTB1Z2xyMCJ9.T_yab55Le7PZDmzpqAkwEg'

export function ReactMapGl({
  mapId = 'map1',
  mapStyle = 'mapbox://styles/mapbox/streets-v9',
  style = { width: 600, height: 400 },
}: {
  mapId?: string
  mapStyle?: string
  style?: React.CSSProperties
}) {
  const snap = useSnapshot(store)
  const current: IViewState | null = snap.viewStates[mapId] ?? null
  const fallback: IViewState = {
    longitude: -100,
    latitude: 40,
    zoom: 3.5,
  } as IViewState

  return (
    <Map
      {...(current ?? fallback)}
      onMove={(evt) => setMapViewState(mapId, evt.viewState as IViewState)}
      mapStyle={mapStyle}
      style={style}
      mapboxAccessToken={MAPBOX_TOKEN}
    />
  )
}