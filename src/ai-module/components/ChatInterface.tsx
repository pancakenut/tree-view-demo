import { useState, useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { aiStore } from '@/ai-module/store';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function ChatInterface() {
    const snap = useSnapshot(aiStore);
    const [messages, setMessages] = useState<Message[]>([
        { id: '0', role: 'assistant', content: '你好！我是你的专属 AI 助手。有什么我可以帮你的吗？' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!snap.apiKey) {
            setError('请先在“设置”页面配置 API Key');
            return;
        }

        setError(null);
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // 准备请求历史
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        // 添加 System Prompt
        const apiMessages = [
            { role: 'system', content: snap.systemPrompt },
            ...history,
            { role: 'user', content: input }
        ];

        try {
            const response = await fetch(`${snap.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${snap.apiKey}`
                },
                body: JSON.stringify({
                    model: snap.model,
                    messages: apiMessages,
                    stream: true
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `API Error: ${response.status}`);
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // 创建一个空的 assistant 消息用于流式更新
            const assistantMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) {
                                accumulatedContent += content;
                                setMessages(prev => 
                                    prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m)
                                );
                            }
                        } catch (e) {
                            console.warn('Parse error', e);
                        }
                    }
                }
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || '发送失败，请检查网络或 Key');
            // 如果出错，把刚才那个空消息删掉或者显示错误
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-16 space-y-24" ref={scrollRef}>
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex gap-12 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`
                            w-32 h-32 rounded-full flex items-center justify-center shrink-0
                            ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}
                        `}>
                            {msg.role === 'user' ? <User className="w-20 h-20" /> : <Bot className="w-20 h-20" />}
                        </div>
                        
                        <div className={`
                            max-w-[80%] rounded-lg p-16 text-sm shadow-sm
                            ${msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-slate-800 border border-slate-200'}
                        `}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-12">
                        <div className="w-32 h-32 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Bot className="w-20 h-20" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-16 shadow-sm flex items-center">
                            <Loader2 className="w-16 h-16 animate-spin text-slate-400" />
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="flex justify-center">
                        <div className="bg-red-50 text-red-600 px-16 py-8 rounded-full text-xs flex items-center gap-8 border border-red-100">
                            <AlertCircle className="w-12 h-12" />
                            {error}
                        </div>
                    </div>
                )}
            </div>

            {/* 输入框 */}
            <div className="p-16 bg-white border-t">
                <form onSubmit={handleSubmit} className="flex gap-8 max-w-4xl mx-auto">
                    <input
                        className="flex-1 h-44 rounded-md border border-input bg-transparent px-16 py-8 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="输入您的问题..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-44 px-24 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <Send className="w-16 h-16 mr-8" />
                        发送
                    </button>   
                </form>
            </div>
        </div>
    );
}
