import { proxy } from "valtio";
import type { IViewState } from "@sonic/types";

interface IState {
    viewStates: Record<string, IViewState | null>
}

export const store: IState = proxy({
    viewStates: {}
})