import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Settings } from './components/Settings';
import { DifyChatDemo } from './components/DifyChatDemo';
import { MessageSquare, Database, Settings as SettingsIcon, X, Network, ArrowLeft } from 'lucide-react';

type Tab = 'chat' | 'knowledge' | 'settings' | 'dify';

interface AIModuleProps {
    onClose?: () => void;
}

export default function AIModule() {
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-slate-100 absolute inset-0 z-50">
            {/* 顶部导航栏 */}
            <div className="bg-white border-b px-24 py-12 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/')}
                        className="mr-8 p-4 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-20 h-20 text-slate-600" />
                    </button>
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm text-lg">
                        AI
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 text-lg">企业智能知识库</h1>
                        <p className="text-xs text-slate-500">Local RAG System v0.1</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-4 rounded-lg">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-8 px-16 py-6 rounded-md text-sm font-medium transition-all ${activeTab === 'chat'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <MessageSquare className="w-16 h-16" />
                        硅基流动
                    </button>
                    <button
                        onClick={() => setActiveTab('dify')}
                        className={`flex items-center gap-8 px-16 py-6 rounded-md text-sm font-medium transition-all ${activeTab === 'dify'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Network className="w-16 h-16" />
                        Dify 私有云
                    </button>
                    <button
                        onClick={() => setActiveTab('knowledge')}
                        className={`flex items-center gap-8 px-16 py-6 rounded-md text-sm font-medium transition-all ${activeTab === 'knowledge'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Database className="w-16 h-16" />
                        知识库管理
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-8 px-16 py-6 rounded-md text-sm font-medium transition-all ${activeTab === 'settings'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <SettingsIcon className="w-16 h-16" />
                        系统设置
                    </button>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' && <ChatInterface />}
                {activeTab === 'dify' && <DifyChatDemo />}
                {activeTab === 'knowledge' && <KnowledgeBase />}
                {activeTab === 'settings' && <Settings />}
            </div>
        </div>
    );
}
