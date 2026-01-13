import React from 'react';
import {
    RiAddLine,
    RiHistoryLine,
    RiMoreFill,
    RiArrowLeftDoubleFill,
    RiTimeLine,
    RiEditLine
} from '@remixicon/react';

export interface Session {
    id: string;
    title: string;
    timestamp: number;
}

interface ChatSidebarProps {
    sessions: Session[];
    currentId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    sessions,
    currentId,
    onSelect,
    onNewChat
}) => {
    return (
        <div className="w-320 h-full bg-[#F0F4FA] flex flex-col border-r border-slate-200 shrink-0">
            {/* 顶部标题区 */}
            <div className="p-20 flex items-center gap-12">
                <button className="size-40 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 hover:bg-blue-50 transition-colors">
                    <RiArrowLeftDoubleFill size={22} />
                </button>
                <span className="font-semibold text-slate-700 text-lg">法规知识专家</span>
            </div>

            {/* 历史记录标题栏 */}
            <div className="px-20 py-12 flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-8">
                    <span className="text-base font-medium">历史记录</span>
                    <RiEditLine size={18} className="cursor-pointer hover:text-blue-500" />
                </div>
                <RiTimeLine size={20} className="cursor-pointer hover:text-blue-500" />
            </div>

            {/* 滚动列表区域 */}
            <div className="flex-1 overflow-y-auto px-16 py-8 space-y-12 custom-scrollbar">
                {sessions.map((session) => {
                    const isActive = currentId === session.id;
                    return (
                        <div
                            key={session.id}
                            onClick={() => onSelect(session.id)}
                            className={`
                                group relative flex items-center justify-between p-14 rounded-xl cursor-pointer transition-all duration-200 border
                                ${isActive
                                    ? 'bg-white border-blue-500 shadow-sm'
                                    : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200'
                                }
                            `}
                        >
                            <span className={`
                                text-[15px] truncate flex-1 pr-8 leading-relaxed
                                ${isActive ? 'text-blue-600 font-medium' : 'text-slate-600'}
                            `}>
                                {session.title}
                            </span>

                            {/* 更多操作按钮 - 仅hover或选中时显示 */}
                            <button className={`
                                opacity-0 group-hover:opacity-100 transition-opacity p-6 rounded hover:bg-slate-100
                                ${isActive ? 'opacity-100 text-blue-400' : 'text-slate-400'}
                            `}>
                                <RiMoreFill size={20} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* 底部新建按钮区域 */}
            <div className="p-20 mt-auto">
                <button
                    onClick={onNewChat}
                    className="w-full h-56 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl flex items-center justify-center gap-8 transition-all shadow-md hover:shadow-lg"
                >
                    <RiAddLine size={24} />
                    <span className="font-medium text-lg">新建对话</span>
                </button>
            </div>
        </div>
    );
};
