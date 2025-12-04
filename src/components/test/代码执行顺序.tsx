import React, { useState, useEffect } from 'react';

function KitchenDemo() {
    console.log('👨‍🍳 1. 厨师进入厨房 - 组件开始执行');

    // useState 初始化 - 准备食材
    const [ingredients, setIngredients] = useState(() => {
        console.log('🥚 2. 从冰箱拿鸡蛋 - useState 初始化执行');
        return 3; // 初始有3个鸡蛋
    });

    const [steps, setSteps] = useState(0); // 记录烹饪步骤

    console.log('📋 3. 查看现有食材:', ingredients, '个鸡蛋');

    // useEffect - 烹饪后的清理工作
    useEffect(() => {
        console.log('🧹 6. 开始清理厨房 - useEffect 执行');
        console.log('   用了', ingredients, '个鸡蛋做菜');

        return () => {
            console.log('🗑️ 清理前的准备工作 - useEffect 清理函数');
        };
    }, [ingredients]); // 依赖数组 - 当鸡蛋数量变化时重新清理

    // 另一个 useEffect - 只执行一次
    useEffect(() => {
        console.log('🔥 7. 预热烤箱 - 只执行一次的 useEffect');
    }, []);

    console.log('🍽️ 4. 准备上菜 - 即将返回 JSX');

    // 用户交互函数 - 点击事件
    const crackEgg = () => {
        console.log('👆 用户点击了！- 打鸡蛋');
        if (ingredients > 0) {
            setIngredients(ingredients - 1);
            setSteps(steps + 1);
        }
    };

    const buyEggs = () => {
        console.log('👆 用户点击了！- 买鸡蛋');
        setIngredients(ingredients + 6);
    };

    // JSX 部分 - 菜品的呈现
    return (
        <div style={{ padding: '20px', border: '2px solid #ccc', margin: '20px' }}>
            <h2>🍳 厨房烹饪演示</h2>

            <div className="kitchen-info">
                <p>🥚 剩余鸡蛋: <strong>{ingredients}</strong> 个</p>
                <p>📝 已完成步骤: <strong>{steps}</strong> 步</p>
            </div>

            <div className="buttons" style={{ marginTop: '20px' }}>
                <button onClick={crackEgg} style={{ marginRight: '10px' }}>
                    打一个鸡蛋
                </button>

                <button onClick={buyEggs}>
                    买6个鸡蛋
                </button>
            </div>

            <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
                <h4>执行顺序说明:</h4>
                <ol>
                    <li>👨‍🍳 厨师进入厨房 (组件执行)</li>
                    <li>🥚 从冰箱拿鸡蛋 (useState 初始化)</li>
                    <li>📋 查看现有食材 (其他逻辑)</li>
                    <li>🍽️ 准备上菜 (返回 JSX)</li>
                    <li>👆 用户点击按钮 (事件触发)</li>
                    <li>🧹 开始清理厨房 (useEffect 执行)</li>
                </ol>
            </div>
        </div>
    );
}

export default KitchenDemo;