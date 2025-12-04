import type { MapViewState } from "deck.gl";
import type { LngLatBoundsLike } from "mapbox-gl";

export type IViewState = {
    height?: number;
    width?: number;
    maxBounds?: LngLatBoundsLike;
} & MapViewState;
