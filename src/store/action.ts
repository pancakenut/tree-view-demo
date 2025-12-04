import type { IViewState } from "@sonic/types";
import { store } from "./root";

export function setMapViewState(id: string, payload: IViewState) {
    store.viewStates[id] = payload;
}

export function setViewState(payload: IViewState) {
    store.viewStates["default"] = payload;
}