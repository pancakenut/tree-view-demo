
export interface SourceConfig {
    id: string;
    type: "vector" | "geojson"; // 扩展类型定义
    url?: string; // vector 需要 url
    data?: any;   // geojson 需要 data
}

export interface LayerConfig {
    id: string;
    type: string;
    source: string;
    "source-layer"?: string; // vector source 必填
    layout?: object;
    paint: object;
}

export const sources: SourceConfig[] = [
    {
        id: 'hongxian',
        type: "vector",
        url: 'http://localhost:8088/polygon_features_hongxian_84'
    },
    {
        id: 'central_city_lakes',
        type: "vector",
        url: 'http://localhost:8088/central_city_lakes'
    }
]

export const layers: LayerConfig[] = [
    {
        id: 'hongxian',
        type: 'fill',
        source: 'hongxian',
        "source-layer": "polygon_features_hongxian_84", // ⚠️ 请确认这里的图层名是否正确！通常需要和切片服务里的名字一致
        paint: {
            'fill-color': "#ff0000",
            'fill-opacity': 0.5
        }
    },
    {
        id: 'central_city_lakes',
        type: 'fill',
        source: 'central_city_lakes',
        "source-layer": "central_city_lakes",
        paint: {
            'fill-color': "#729b6f",
            'fill-opacity': 0.5
        }
    }
] 
