import { Source, Layer } from 'react-map-gl/mapbox'
import { sources, layers } from '@/config/layerConfig'
import type { LayerProps } from 'react-map-gl/mapbox'
import { layerStore } from '@/store/layerStore'

export function LayerManager() {
    const snap = useSnapshot(layerStore);
    return (
        <>
            {/* 遍历所有定义的数据源 */}
            {sources.map((sourceConfig) => {
                // 找到所有使用这个 source 的 layer
                const relatedLayers = layers.filter(layer => layer.source === sourceConfig.id && snap.visibility[layer.id] != false);

                return (
                    // @ts-ignore: 配置文件中的类型可能和库的类型定义有细微差异，这里暂时忽略
                    <Source
                        key={sourceConfig.id}
                        id={sourceConfig.id}
                        type={sourceConfig.type} // "vector" | "geojson" | ...
                        url={sourceConfig.url}   // 对于 vector/raster source
                    // 如果有 data 属性（GeoJSON），也应该传进去
                    // data={sourceConfig.data} 
                    >
                        {/* 渲染关联的图层 */}
                        {relatedLayers.map((layerConfig) => (
                            <Layer
                                key={layerConfig.id}
                                {...layerConfig as LayerProps}
                            />
                        ))}
                    </Source>
                );
            })}
        </>
    )
}
