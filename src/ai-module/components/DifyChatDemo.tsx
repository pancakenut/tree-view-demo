import { useState } from 'react';
import { useDifyChat } from '../hooks/useDifyChat';
import { Send, User, Bot, Loader2, StopCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function DifyChatDemo() {
    // 这里应该是从配置中读取，为了演示先写死或留空
    // 假设你在本地 80 端口启动了 Dify，并且创建了一个 Chat 应用
    const DIFY_API_KEY = 'app-GkxsTmo9EkAIB3AH7d1BYIqc';
    const DIFY_BASE_URL = 'https://api.dify.ai/v1';

    const [input, setInput] = useState('');
    const { messages, isLoading, sendMessage, stop } = useDifyChat({
        apiKey: DIFY_API_KEY,
        baseUrl: DIFY_BASE_URL,
        inputs: {} // 可以在这里传变量给 Dify 的 Prompt
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-white border-b p-16 shadow-sm">
                <h2 className="font-bold text-lg flex items-center gap-8">
                    <div className="w-12 h-12 rounded-full bg-green-500"></div>
                    Dify 本地知识库助手
                </h2>
                <p className="text-xs text-muted-foreground mt-4">
                    连接至私有化部署的 Dify 引擎 | 模型: Ollama/Qwen2.5
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-16 space-y-24">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-80">
                        <Bot className="w-48 h-48 mx-auto mb-16 opacity-50" />
                        <p>请配置 API Key 并开始对话</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-12 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`
                            w-32 h-32 rounded-full flex items-center justify-center shrink-0
                            ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}
                        `}>
                            {msg.role === 'user' ? <User className="w-20 h-20" /> : <Bot className="w-20 h-20" />}
                        </div>

                        <div className={`
                            max-w-[85%] rounded-lg p-16 text-sm shadow-sm flex flex-col gap-8
                            ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-slate-800 border border-slate-200'}
                        `}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}

                            {/* 引用来源展示 */}
                            {msg.citations && msg.citations.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <div className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-4">
                                        <FileText className="w-12 h-12" />
                                        参考来源：
                                    </div>
                                    <div className="space-y-4">
                                        {msg.citations.map((citation: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 p-8 rounded text-xs text-slate-600 border border-slate-100">
                                                <div className="font-medium text-blue-600 mb-2">
                                                    [{idx + 1}] {citation.document_name}
                                                </div>
                                                <div className="line-clamp-2 opacity-80">
                                                    {citation.content}
                                                </div>
                                                <div className="mt-2 text-slate-400">
                                                    匹配度: {(citation.score * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-16 bg-white border-t">
                <form onSubmit={handleSubmit} className="flex gap-8 max-w-4xl mx-auto">
                    <input
                        className="flex-1 h-44 rounded-md border border-input bg-transparent px-16 py-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
                        placeholder="查询知识库..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />

                    {isLoading ? (
                        <button
                            type="button"
                            onClick={stop}
                            className="h-44 px-24 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium flex items-center transition-colors"
                        >
                            <StopCircle className="w-16 h-16 mr-8" />
                            停止
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="h-44 px-24 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium flex items-center transition-colors disabled:opacity-50"
                        >
                            <Send className="w-16 h-16 mr-8" />
                            发送
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
