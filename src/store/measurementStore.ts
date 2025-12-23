import type { Feature, FeatureCollection, LineString,Position } from 'geojson';
import {proxy} from 'valtio';

interface MeasurementState {
    markerArr: Position[];
    oldMarkerData: FeatureCollection<LineString>;
    previewLine: Position[];
}

export const measurementStore = proxy<MeasurementState>({
    markerArr: [],
    oldMarkerData: {
        type: 'FeatureCollection',
        features: []
    },
    previewLine: []
})

export const measurementActions = {
    addPoint: (lng:number,lat:number) => {
        measurementStore.markerArr.push([lng,lat]);
        // 同时更新预览线的起点
        measurementStore.previewLine = [[lng,lat],[lng,lat]]
    },

    setPreviewLineEnd: (lng:number,lat:number) => {
        const start = measurementStore.previewLine[0];
        if(start) {
            measurementStore.previewLine = [start,[lng,lat]]
        }
    },

    finishDrawing: () => {
        const currentPoints = measurementStore.markerArr;

        if(currentPoints.length >= 2) {
            const newFeature : Feature<LineString> = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: JSON.parse(JSON.stringify(currentPoints))
                },
                properties: {}
            }

            measurementStore.oldMarkerData.features.push(newFeature)
        }

        measurementStore.markerArr = [],
        measurementStore.previewLine = []
    }
}
