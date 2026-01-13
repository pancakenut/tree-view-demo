import React, { useState, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatSender } from './ChatSender';
import { ChatSidebar, type Session } from './ChatSidebar';
import { useDifyChat, type Message } from './hooks/useDifyChat';

// Mock 数据：预置一些历史会话
const MOCK_SESSIONS: Session[] = [
    { id: '1', title: '五改四好具体指的什么', timestamp: Date.now() },
    { id: '2', title: '武汉市主流三房户型的面宽', timestamp: Date.now() - 100000 },
    { id: '3', title: '五改四好中数字化管理的要求是什么？', timestamp: Date.now() - 200000 },
    { id: '4', title: '248号令的要求是什么？', timestamp: Date.now() - 300000 },
    { id: '5', title: '我去四川出差，住宿标准和交通费标准是...', timestamp: Date.now() - 400000 },
    { id: '6', title: '248号令主要讲的什么', timestamp: Date.now() - 500000 },
];

export const Main = () => {
    // 管理会话列表和当前选中会话
    const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // 使用 Dify Hook
    const {
        messages,
        isLoading,
        sendMessage,
        stop,
        setMessages,
        resetConversation
    } = useDifyChat();

    // 模拟：当切换会话时，加载对应的历史消息
    // 在真实应用中，这里应该调用 API 获取数据
    const handleSelectSession = (id: string) => {
        if (id === currentSessionId) return;

        setCurrentSessionId(id);
        resetConversation(); // 重置 Dify 会话状态

        // 模拟：切换会话时加载（伪造的）历史记录
        // 实际开发请替换为 fetchHistory(id)
        // 注意：这里手动构建的消息没有 citations，仅作演示
        setMessages([
            {
                id: `history-${Date.now()}`,
                role: 'user',
                content: `这里是会话 ${id} 的历史记录示例...`,
                createdAt: Date.now() - 10000
            },
            {
                id: `history-ai-${Date.now()}`,
                role: 'assistant',
                content: `你好！这是关于会话 ${id} 的回复。实际场景中这里会加载数据库中的真实对话历史。`,
                createdAt: Date.now()
            }
        ]);
    };

    // 新建对话
    const handleNewChat = () => {
        const newId = Date.now().toString();
        const newSession: Session = {
            id: newId,
            title: '新对话',
            timestamp: Date.now()
        };

        // 1. 添加到列表顶部
        setSessions([newSession, ...sessions]);
        // 2. 选中它
        setCurrentSessionId(newId);
        // 3. 重置聊天区域
        resetConversation();
    };

    // 如果还没有选中任何会话，默认选中第一个（可选）
    useEffect(() => {
        if (!currentSessionId && sessions.length > 0) {
            handleSelectSession(sessions[0].id);
        }
    }, []);

    // ... 渲染界面
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* 左侧边栏 */}
            <ChatSidebar
                sessions={sessions}
                currentId={currentSessionId}
                onSelect={handleSelectSession}
                onNewChat={handleNewChat}
            />

            {/* 右侧聊天主区域 */}
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                {/* 1. 渲染消息列表 */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto w-full">
                        {messages.map((msg, index) => (
                            <ChatBubble
                                key={msg.id}
                                message={msg}
                                isFirst={msg.role === 'assistant' && messages.findIndex(m => m.role === 'assistant') === index}
                            />
                        ))}
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
                                <p>开始一个新的对话吧...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. 输入框区域 */}
                <div className="shrink-0 bg-white border-t border-slate-100 p-4">
                    <ChatSender
                        loading={isLoading}
                        onSubmit={(val) => {
                            sendMessage(val);

                            // 优化：如果是新对话且标题是默认的，可以用第一句话更新标题
                            if (currentSessionId) {
                                setSessions(prev => prev.map(s =>
                                    s.id === currentSessionId && s.title === '新对话'
                                        ? { ...s, title: val.slice(0, 15) + (val.length > 15 ? '...' : '') }
                                        : s
                                ));
                            }
                        }}
                        onCancel={stop}
                    />
                </div>
            </div>
        </div>
    );
}
