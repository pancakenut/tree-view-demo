import React, { useState } from 'react';
import { OpenAIChatProvider, useXChat, XRequest } from '@ant-design/x-sdk';
import { ChatBubble } from './ChatBubble';

// 创建一个 Provider 实例
// XRequest 是一个请求工具，类似 fetch，manual: true 表示“别急着发请求，等我命令”
const provider = new OpenAIChatProvider({
    request: XRequest('https://api.siliconflow.cn/v1/chat/completions', {
        manual: true,
        headers: {
            'Authorization': 'Bearer sk-jawxovxgdmfqblycguufogdtddbimdeusnswrddxxtyhfupd',
            'Content-Type': 'application/json'
        },
        params: {
            model: 'Pro/zai-org/GLM-4.7',
            stream: true,
            max_tokens: 4096,
            enable_thinking: false,
            thinking_budget: 4096,
            min_p: 0.05,
            stop: null,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            frequency_penalty: 0.5,
            n: 1,
            response_format: { type: "text" },
        } as any,
    }),
});

export const Main = () => {
    // 召唤管家，它会返回给你一堆好用的工具
    const {
        messages,      // 聊天记录列表（数组）
        onRequest,     // 发送消息的方法
        isRequesting,  // 是否正在生成中（布尔值）
        abort,         // 停止生成的方法
        setMessages,   // 手动修改消息列表的方法
    } = useXChat({
        provider,      // 把翻译官给它
    });

    const [input, setInput] = useState('');

    // ... 渲染界面
    return (
        <div>
            {/* 1. 渲染消息列表 */}
            <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
                {messages.map((msg, index) => (
                    <ChatBubble
                        key={msg.id}
                        message={{
                            role: msg.message.role,
                            content: typeof msg.message.content === 'string' ? msg.message.content : (msg.message.content as any).text
                        }}
                        isFirst={msg.message.role === 'assistant' && messages.findIndex(m => m.message.role === 'assistant') === index}
                    />
                ))}
            </div>

            {/* 2. 输入框和发送按钮 */}
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button
                onClick={() => {
                    if (!input.trim()) return;
                    // 3. 调用 onRequest 发送消息
                    // 这会自动添加一条用户消息到列表，并开始请求 AI
                    onRequest({
                        messages: [{ role: 'user', content: input }]
                    });
                    setInput('');
                }}
                disabled={isRequesting} // 如果正在生成，就禁用按钮
            >
                发送
            </button>

            {/* 4. 停止按钮 */}
            {isRequesting && <button onClick={abort}>停止</button>}
        </div>
    );
}

