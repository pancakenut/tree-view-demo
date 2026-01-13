import React, { useState } from 'react';
import { Sender } from '@ant-design/x';
import { RiSendPlane2Fill } from '@remixicon/react';
import "./chat-sender.scss"

interface ChatSenderProps {
    loading?: boolean;
    disabled?: boolean;
    onSubmit: (value: string) => void;
    onCancel?: () => void;
}

export const ChatSender: React.FC<ChatSenderProps> = ({ loading, disabled, onSubmit, onCancel }) => {
    const [value, setValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // 监听输入值变化，判断是否需要展开（例如行数超过1行）
    // 这里简单通过字符长度或是否包含换行来判断，或者通过 autoSize 的回调
    // Sender 组件底层是 TextArea，我们可以利用 onChange 来简单判断，
    // 但更精准的是监听高度变化。Ant Design 的 Input.TextArea autoSize 会调整高度。
    // 为了简化效果，我们可以根据内容是否有换行或者长度来切换样式，
    // 或者直接让 border-radius 随高度平滑过渡。

    // 更好的方式：直接给 borderRadius 一个较大的值（如 24px），
    // 当高度变高时，它看起来就会自然变成圆角矩形（类似方形但圆角），
    // 而不是胶囊。胶囊通常是 height / 2。
    // 如果想要截图那种明显的“大圆角矩形”而不是“完全的胶囊”，
    // 设置一个固定的较大圆角（例如 24px 或 32px）通常就能满足两种形态：
    // 1. 单行时：高度约 48px，圆角 24px -> 看起来像胶囊
    // 2. 多行时：高度变大，圆角保持 24px -> 看起来像圆角矩形

    // 让我们调整圆角策略。

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Sender
                value={value}
                onChange={(v) => {
                    setValue(v);
                    // 简单判断：如果有换行或者长度超过一定值，认为可能多行
                    setIsExpanded(v.includes('\n') || v.length > 50);
                }}
                onSubmit={() => {
                    if (!value.trim()) return;
                    onSubmit(value);
                    setValue('');
                    setIsExpanded(false);
                }}
                onCancel={onCancel}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!value.trim()) return;
                        onSubmit(value);
                        setValue('');
                        setIsExpanded(false);
                    }
                }}
                loading={loading}
                disabled={disabled}
                placeholder="请输入你的问题..."
                className={`shadow-sm transition-all duration-300 ease-in-out border-solid !border-2 ${isFocused ? "sender-focused" : '!border-blue-500'}`}
                style={{
                    borderRadius: isExpanded ? '24px' : '999px', // 展开时大圆角（方），收起时全圆角（胶囊）
                    padding: '8px 8px 8px 24px', // 调整内边距
                    backgroundColor: 'white',
                }}
                styles={{
                    content: {
                        alignItems: isExpanded ? 'flex-end' : 'center', // 多行时底部对齐，单行居中
                        display: 'flex',
                    },
                    input: {
                        padding: '8px 0',
                        fontSize: '15px',
                        backgroundColor: 'transparent',
                        minHeight: '24px',
                        resize: 'none',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        lineHeight: '1.5',
                    }
                }}
                // 自定义后缀渲染发送按钮
                suffix={
                    <button
                        onClick={() => {
                            if (!value.trim()) return;
                            onSubmit(value);
                            setValue('');
                            setIsExpanded(false);
                        }}
                        disabled={loading || disabled || !value.trim()}
                        className={`
                            size-24 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ml-2 mb-[1px]
                            ${!value.trim() ? 'bg-indigo-300 cursor-not-allowed opacity-70' : 'bg-indigo-500 hover:bg-indigo-600 cursor-pointer shadow-md hover:shadow-lg'}
                        `}
                    >
                        <RiSendPlane2Fill className="size-20 text-white translate-x-[-1px] translate-y-[1px]" />
                    </button>
                }
            />
        </div>
    );
};
