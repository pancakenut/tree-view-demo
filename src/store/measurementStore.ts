import type { Feature, FeatureCollection, LineString, Position } from 'geojson';
import { proxy } from 'valtio';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

interface MeasurementState {
    markerArr: Position[];
    distanceLabels: string[];
    totalDistance: number;
    oldMarkerData: FeatureCollection<LineString>;
    previewLine: Position[];
}

export const measurementStore = proxy<MeasurementState>({
    markerArr: [],
    distanceLabels: [],
    totalDistance: 0,
    oldMarkerData: {
        type: 'FeatureCollection',
        features: []
    },
    previewLine: []
})

export const measurementActions = {
    addPoint: (lng: number, lat: number) => {
        const currentPos = [lng, lat];
        let label = '起点';

        if (measurementStore.markerArr.length > 0) {
            const lastPos = measurementStore.markerArr[measurementStore.markerArr.length - 1];
            // 计算两点间距离 (km)
            const d = distance(point(lastPos), point(currentPos), { units: 'kilometers' });
            measurementStore.totalDistance += d;

            // 格式化显示
            if (measurementStore.totalDistance < 1) {
                label = Math.round(measurementStore.totalDistance * 1000) + ' m';
            } else {
                label = measurementStore.totalDistance.toFixed(2) + ' km';
            }
        } else {
            // 重置总距离（虽然 finishDrawing 也会重置，但在开始新的一段时重置更安全）
            measurementStore.totalDistance = 0;
        }

        measurementStore.markerArr.push(currentPos);
        measurementStore.distanceLabels.push(label);

        // 同时更新预览线的起点
        measurementStore.previewLine = [[lng, lat], [lng, lat]]
    },

    setPreviewLineEnd: (lng: number, lat: number) => {
        const start = measurementStore.previewLine[0];
        if (start) {
            measurementStore.previewLine = [start, [lng, lat]]
        }
    },

    finishDrawing: () => {
        const currentPoints = measurementStore.markerArr;

        if (currentPoints.length >= 2) {
            const newFeature: Feature<LineString> = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: JSON.parse(JSON.stringify(currentPoints))
                },
                properties: {
                    distance: measurementStore.totalDistance,
                    distanceLabels: [...measurementStore.distanceLabels]
                }
            }

            measurementStore.oldMarkerData.features.push(newFeature)
        }

        measurementStore.markerArr = [];
        measurementStore.distanceLabels = [];
        measurementStore.totalDistance = 0;
        measurementStore.previewLine = [];
    }
}
