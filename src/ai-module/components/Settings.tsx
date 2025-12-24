import { useSnapshot } from 'valtio';
import { aiStore } from '@/ai-module/store';
import { ExternalLink } from 'lucide-react';

export function Settings() {
    const snap = useSnapshot(aiStore);

    const handleChange = (key: keyof typeof aiStore, value: string) => {
        aiStore[key] = value;
    };

    return (
        <div className="p-24 max-w-2xl mx-auto space-y-24 h-full overflow-y-auto">
            {/* 模型配置卡片 */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="flex flex-col space-y-6 p-24">
                    <h3 className="font-semibold leading-none tracking-tight">模型配置</h3>
                    <p className="text-sm text-muted-foreground">配置连接到硅基流动 (SiliconFlow) 或其他 OpenAI 兼容的 API 服务。</p>
                </div>
                <div className="p-24 pt-0 space-y-16">
                    <div className="space-y-8">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">API Key</label>
                        <div className="flex gap-8">
                            <input
                                type="password"
                                className="flex h-36 w-full rounded-md border border-input bg-transparent px-12 py-4 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={snap.apiKey}
                                onChange={(e) => handleChange('apiKey', e.target.value)}
                                placeholder="sk-..."
                            />
                            <a
                                href="https://cloud.siliconflow.cn/account/ak"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-36 px-16 py-8"
                            >
                                <ExternalLink className="w-16 h-16 mr-4" />
                                获取 Key
                            </a>
                        </div>
                        <p className="text-xs text-muted-foreground">您的 Key 仅保存在本地浏览器中，不会发送给任何中间服务器。</p>
                    </div>

                    <div className="space-y-8">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Base URL</label>
                        <input
                            className="flex h-36 w-full rounded-md border border-input bg-transparent px-12 py-4 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={snap.baseUrl}
                            onChange={(e) => handleChange('baseUrl', e.target.value)}
                            placeholder="https://api.siliconflow.cn/v1"
                        />
                    </div>

                    <div className="space-y-8">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Model Name</label>
                        <input
                            className="flex h-36 w-full rounded-md border border-input bg-transparent px-12 py-4 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={snap.model}
                            onChange={(e) => handleChange('model', e.target.value)}
                            placeholder="Qwen/Qwen2.5-7B-Instruct"
                        />
                    </div>
                </div>
            </div>

            {/* 助手设定卡片 */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="flex flex-col space-y-6 p-24">
                    <h3 className="font-semibold leading-none tracking-tight">助手设定</h3>
                </div>
                <div className="p-24 pt-0">
                    <div className="space-y-8">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">System Prompt (系统提示词)</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-12 py-8 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={snap.systemPrompt}
                            onChange={(e) => handleChange('systemPrompt', e.target.value)}
                            placeholder="你是一个专业的..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
