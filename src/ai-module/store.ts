import { proxy, subscribe } from 'valtio';

interface AIState {
    apiKey: string;
    baseUrl: string;
    model: string;
    systemPrompt: string;
}

const STORAGE_KEY = 'ai_module_config';

const getInitialState = (): AIState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        apiKey: '',
        baseUrl: 'https://api.siliconflow.cn/v1',
        model: 'Qwen/Qwen2.5-7B-Instruct', // 硅基流动支持的模型
        systemPrompt: '你是一个智能助手，请基于用户的提问进行回答。'
    };
};

export const aiStore = proxy<AIState>(getInitialState());

subscribe(aiStore, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aiStore));
});
