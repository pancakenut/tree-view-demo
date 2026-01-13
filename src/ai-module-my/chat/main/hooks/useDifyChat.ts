import { useState, useRef, useCallback } from 'react';
import { DIFY_CONFIG } from '../config';

// 引用来源类型
export interface Citation {
    segment_id: string;
    position: number;
    document_id: string;
    document_name: string;
    dataset_id: string;
    dataset_name: string;
    content: string;
    score: number;
}

// 消息类型
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations?: Citation[]; // 引用列表
    createdAt: number;
}

interface UseDifyChatOptions {
    apiKey?: string;
    baseUrl?: string;
    inputs?: Record<string, any>;
}

export function useDifyChat(options: UseDifyChatOptions = {}) {
    const apiKey = options.apiKey || DIFY_CONFIG.API_KEY;
    const baseUrl = options.baseUrl || DIFY_CONFIG.BASE_URL;

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string>('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (query: string) => {
        if (isLoading) return;
        if (!apiKey) {
            console.error('Dify API Key is missing');
            return;
        }

        setIsLoading(true);
        const userMsgId = Date.now().toString();
        // 1. 用户消息上屏
        const userMsg: Message = {
            id: userMsgId,
            role: 'user',
            content: query,
            createdAt: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);

        // 2. 预置 AI 消息占位
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: Message = {
            id: aiMsgId,
            role: 'assistant',
            content: '',
            createdAt: Date.now() + 1
        };
        setMessages(prev => [...prev, aiMsg]);

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${baseUrl}/chat-messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: options.inputs || {},
                    query: query,
                    response_mode: 'streaming',
                    conversation_id: conversationId,
                    user: 'user-demo' // 实际项目中应使用真实用户ID
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedAnswer = '';
            let currentConversationId = conversationId;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (!jsonStr.trim()) continue;

                        try {
                            const data = JSON.parse(jsonStr);

                            // 处理不同类型的事件
                            switch (data.event) {
                                case 'message': // 文本生成中
                                case 'agent_message':
                                    accumulatedAnswer += data.answer;
                                    // 获取会话ID (通常在第一帧返回)
                                    if (data.conversation_id && !currentConversationId) {
                                        currentConversationId = data.conversation_id;
                                        setConversationId(data.conversation_id);
                                    }

                                    // 更新消息内容
                                    setMessages(prev =>
                                        prev.map(msg =>
                                            msg.id === aiMsgId
                                                ? { ...msg, content: accumulatedAnswer }
                                                : msg
                                        )
                                    );
                                    break;

                                case 'message_end': // 消息生成结束，包含元数据
                                    const citations = data.metadata?.retriever_resources || [];
                                    setMessages(prev =>
                                        prev.map(msg =>
                                            msg.id === aiMsgId
                                                ? { ...msg, citations } // 保存引用信息
                                                : msg
                                        )
                                    );
                                    console.log('Conversation ID:', data.conversation_id);
                                    break;

                                case 'error':
                                    console.error('Dify API Error:', data);
                                    throw new Error(data.message || 'Dify API Error');
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
                // 显示错误消息
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMsgId
                            ? { ...msg, content: msg.content + `\n\n[Error: ${error.message}]` }
                            : msg
                    )
                );
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [apiKey, baseUrl, options.inputs, conversationId, isLoading]);

    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    }, []);

    const resetConversation = useCallback(() => {
        setConversationId('');
        setMessages([]);
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        stop,
        conversationId,
        setMessages, // 暴露给外部用于模拟数据或回显历史
        resetConversation
    };
}
