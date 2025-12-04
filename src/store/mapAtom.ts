import { atom } from "helux"

// 选中项 ID 的原子状态，提供只读快照 selectedItemId 和对应的 setter
export const [selectedItemId, setSelectedItemId] = atom<string | undefined>(undefined)
export type ViewState = {
  longitude: number
  latitude: number
  zoom: number
}

export const [viewState, setViewState] = atom<ViewState>({
  longitude: -100,
  latitude: 40,
  zoom: 3.5,
})

