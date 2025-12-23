import { layerStore, layerActions } from '@/store/layerStore';

export function ControlBtn({ layerid }: { layerid: string }) {
    const snap = useSnapshot(layerStore);
    const isVisible = snap.visibility[layerid];
    return (
        <>
            <div onClick={() => layerActions.toggle(layerid)} className={`cursor-pointer p-2 ${isVisible ? 'bg-blue-500' : 'bg-gray-300'}`}>
                {layerid} 图层: {isVisible ? '开' : '关'}
            </div>
        </>
    )
}
