import React from 'react';
import { Bubble } from '@ant-design/x';
import ReactMarkdown from 'react-markdown';
import { RiUser3Line, RiRobot2Line, RiFileTextLine } from '@remixicon/react';
import { type Citation } from './hooks/useDifyChat';

interface ChatBubbleProps {
    message: {
        role: string;
        content: string;
        citations?: Citation[];
    };
    isFirst?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isFirst }) => {
    const isUser = message.role === 'user';
    const citations = message.citations || [];

    // 解析 <think> 标签
    const parseContent = (content: string) => {
        const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
        const thinkContent = thinkMatch ? thinkMatch[1] : null;
        const mainContent = content.replace(/<think>[\s\S]*?(?:<\/think>|$)/, '');
        return { thinkContent, mainContent };
    };

    const { thinkContent, mainContent } = parseContent(message.content);

    // 渲染内容
    const renderContent = () => (
        <div className="flex flex-col gap-3">
            {thinkContent && (
                <div
                    className="p-3 rounded-lg text-sm text-gray-600 border border-indigo-100"
                    style={{
                        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' // 示例渐变，用户要求是渐变
                    }}
                >
                    <div className="font-medium mb-1 text-xs text-indigo-400">思考过程</div>
                    <div className="whitespace-pre-wrap">{thinkContent}</div>
                </div>
            )}

            <div className="text-sm text-slate-700 leading-relaxed">
                <ReactMarkdown
                    components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-slate-100 p-2 rounded mb-2 overflow-x-auto" {...props} />,
                    }}
                >
                    {mainContent}
                </ReactMarkdown>
            </div>

            {/* 引用文件列表 - 仅在非用户且有引用时显示 */}
            {!isUser && citations.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                    {citations.map((ref, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-8 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100"
                            onClick={() => console.log('预览:', ref.document_name)}
                        >
                            <RiFileTextLine className="size-16 text-blue-500 shrink-0" />
                            <span className="text-xs text-blue-700 truncate font-medium">{ref.document_name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // 渲染头像
    const avatar = isUser ? (
        <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center">
            <RiUser3Line className="size-20 text-slate-500" />
        </div>
    ) : (
        <div className="size-24 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
            <RiRobot2Line className="size-20 text-white" />
        </div>
    );

    // 头部信息
    const header = !isUser ? (
        <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-slate-800">法规知识专家</span>
            <span className="text-xs text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    ) : (
        <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    );

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <Bubble
                placement={isUser ? 'end' : 'start'}
                avatar={avatar}
                header={header}
                content={renderContent()}
                variant="filled" // 使用填充模式
                shape="corner"   // Ant Design X 可能有 corner 形状，或者我们用 className 覆盖
                className="max-w-[80%]"
                styles={{
                    content: {
                        borderRadius: isUser ? '12px 0 12px 12px' : '0 12px 12px 12px', // 自定义圆角：AI左上直角，User右上直角
                        backgroundColor: isUser ? '#F4F6FC' : '#ffffff', // User: indigo-100, AI: white
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '2px solid rgba(255,255,255,0.8)',
                        padding: '16px'
                    }
                }}
            />
        </div>
    );
};
