import { useState, useRef, useCallback } from 'react';

// Dify API 的响应类型定义
interface DifyResponse {
    event: 'message' | 'message_end' | 'agent_message' | 'error';
    answer?: string;
    conversation_id?: string;
    message_id?: string;
    created_at?: number;
    metadata?: any;
}

interface UseDifyChatOptions {
    apiKey: string;
    baseUrl: string; // e.g., 'http://localhost/v1'
    inputs?: Record<string, any>;
}

export function useDifyChat({ apiKey, baseUrl, inputs = {} }: UseDifyChatOptions) {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string>('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (query: string) => {
        if (isLoading) return;

        setIsLoading(true);
        const userMsgId = Date.now().toString();
        // 立即上屏用户消息
        setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: query }]);

        // 准备 AI 消息占位
        const aiMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${baseUrl}/chat-messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: inputs,
                    query: query,
                    response_mode: 'streaming',
                    conversation_id: conversationId, // 传空字符串开启新会话，传具体ID延续会话
                    user: 'user-123' // 唯一用户标识
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) throw new Error('Network response was not ok');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedAnswer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Dify 的流式数据是以 data: 开头的 SSE 格式
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.slice(6);
                            // Dify 可能会发送 ping 或其他非 JSON 数据，需兼容
                            if (!jsonStr.trim()) continue;

                            const data: DifyResponse = JSON.parse(jsonStr);

                            if (data.event === 'message' || data.event === 'agent_message') {
                                accumulatedAnswer += data.answer;
                                // 更新会话 ID (通常第一帧就会返回)
                                if (data.conversation_id && !conversationId) {
                                    setConversationId(data.conversation_id);
                                }

                                // 实时更新 UI
                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === aiMsgId
                                            ? { ...msg, content: accumulatedAnswer }
                                            : msg
                                    )
                                );
                            } else if (data.event === 'message_end') {
                                // 消息结束，处理引用来源
                                const citations = data.metadata?.retriever_resources || [];

                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === aiMsgId
                                            ? { ...msg, citations }
                                            : msg
                                    )
                                );

                                console.log('Message ended', data.metadata);
                            } else if (data.event === 'error') {
                                throw new Error('Dify API Error');
                            }
                        } catch (e) {
                            console.warn('Parse error', e);
                        }
                    }
                }
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                console.error('Chat error:', error);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: `Error: ${error.message}`
                }]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [apiKey, baseUrl, inputs, conversationId, isLoading]);

    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        stop,
        conversationId
    };
}
