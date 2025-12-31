// 1. 定义请求参数类型 (Input)
// 对应你代码里 onRequest 传的参数
export interface IChatInput {
    conversation_id: string;
    message: {
        content: string;
        role: "user";
        doc_ids: string[];
        id: string;
        created_at: number;
    };
    // 如果还有其他参数（比如 rag 参数），也都写在这里
}

// 2. 定义后端流式返回的数据结构 (Output)
// 对应你 transformMessage 里 JSON.parse(chunk.data) 后的结构
export interface ISSEData {
    data?: {
        answer: string;
        reference: any;
    };
    choices?: Array<{
        delta: {
            content: string;
            reasoning_content: string;
        };
    }>;
}

