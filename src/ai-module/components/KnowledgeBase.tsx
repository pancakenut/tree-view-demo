import { useState } from 'react';
import { Upload, FileText, Trash2, FolderOpen } from 'lucide-react';

interface Doc {
    id: string;
    name: string;
    size: string;
    status: 'indexed' | 'processing' | 'error';
    date: string;
}

export function KnowledgeBase() {
    const [docs, setDocs] = useState<Doc[]>([
        { id: '1', name: '员工手册_2024.pdf', size: '2.4 MB', status: 'indexed', date: '2024-05-20' },
        { id: '2', name: '财务报销规范.docx', size: '1.1 MB', status: 'indexed', date: '2024-05-21' },
        { id: '3', name: '产品技术白皮书.pdf', size: '5.6 MB', status: 'processing', date: '2024-05-22' },
    ]);

    const handleUpload = () => {
        // Mock upload
        const newDoc: Doc = {
            id: Date.now().toString(),
            name: `新上传文档_${Math.floor(Math.random() * 100)}.pdf`,
            size: '1.5 MB',
            status: 'processing',
            date: new Date().toISOString().split('T')[0]
        };
        setDocs([newDoc, ...docs]);
    };

    return (
        <div className="p-24 max-w-5xl mx-auto h-full flex flex-col gap-24">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">知识库管理</h2>
                    <p className="text-muted-foreground">上传并管理您的私有文档，构建专属知识引擎。</p>
                </div>
                <button
                    onClick={handleUpload}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-36 px-16 py-8 bg-slate-900 text-white"
                >
                    <Upload className="w-16 h-16 mr-8" />
                    上传文档
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
                {/* 集合卡片 Mock */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-24 space-y-8 cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="flex items-center justify-between">
                        <FolderOpen className="w-32 h-32 text-blue-500" />
                        <span className="text-xs bg-blue-100 text-blue-700 px-8 py-4 rounded-full">3 文档</span>
                    </div>
                    <h3 className="font-semibold text-lg">规章制度</h3>
                    <p className="text-sm text-muted-foreground">包含所有公司内部管理规定、员工手册等。</p>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-24 space-y-8 cursor-pointer hover:border-blue-500 transition-colors opacity-60">
                    <div className="flex items-center justify-between">
                        <FolderOpen className="w-32 h-32 text-slate-400" />
                        <span className="text-xs bg-slate-100 text-slate-700 px-8 py-4 rounded-full">0 文档</span>
                    </div>
                    <h3 className="font-semibold text-lg">法律法规</h3>
                    <p className="text-sm text-muted-foreground">暂无数据，请上传相关法律条文。</p>
                </div>

                <div className="rounded-lg border border-dashed flex flex-col items-center justify-center p-24 text-muted-foreground hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-4xl font-light">+</span>
                    <span className="text-sm mt-8">新建集合</span>
                </div>
            </div>

            <div className="rounded-md border bg-white flex-1 overflow-hidden flex flex-col">
                <div className="p-16 border-b bg-slate-50 font-medium text-sm flex">
                    <div className="flex-1">文档名称</div>
                    <div className="w-128">大小</div>
                    <div className="w-128">状态</div>
                    <div className="w-128">上传日期</div>
                    <div className="w-80 text-center">操作</div>
                </div>
                <div className="overflow-y-auto flex-1 p-8">
                    {docs.map(doc => (
                        <div key={doc.id} className="flex items-center p-12 hover:bg-slate-50 rounded-md text-sm transition-colors border-b last:border-0 border-slate-100">
                            <div className="flex-1 flex items-center gap-8 font-medium">
                                <FileText className="w-16 h-16 text-slate-500" />
                                {doc.name}
                            </div>
                            <div className="w-128 text-slate-500">{doc.size}</div>
                            <div className="w-128">
                                {doc.status === 'indexed' && <span className="text-green-600 flex items-center gap-4"><span className="w-8 h-8 rounded-full bg-green-500"></span>已索引</span>}
                                {doc.status === 'processing' && <span className="text-blue-600 flex items-center gap-4"><span className="w-8 h-8 rounded-full bg-blue-500 animate-pulse"></span>处理中</span>}
                                {doc.status === 'error' && <span className="text-red-600 flex items-center gap-4"><span className="w-8 h-8 rounded-full bg-red-500"></span>失败</span>}
                            </div>
                            <div className="w-128 text-slate-500">{doc.date}</div>
                            <div className="w-80 flex justify-center">
                                <button className="text-slate-400 hover:text-red-500">
                                    <Trash2 className="w-16 h-16" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
