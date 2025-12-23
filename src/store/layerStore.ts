import { layers } from "@/config/layerConfig";

const initialState = layers.reduce((acc, layer) => {
    acc[layer.id] = true; // 默认全显示，或者读取 layer.visible
    return acc;
}, {} as Record<string, boolean>);

export const layerStore = proxy({
    visibility: initialState
})

export const layerActions = {
    toggle: (id: string) => {
        layerStore.visibility[id] = !layerStore.visibility[id];
    },
    setVisible: (id:string,visible:boolean) => {
        layerStore.visibility[id] = visible
    }
}



// const layers = [
//     { id: 'hongxian', type: 'fill' },
//     { id: 'traffic', type: 'line' }
// ];

// => 

// const initialState = {
//     hongxian: true,
//     traffic: true
// };