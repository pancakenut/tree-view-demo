// ComponentA.jsx
import React from 'react';
import { countAtom } from '../../store/atoms';

export default function ComponentA() {
  // 直接读取状态值（不解构，直接用 countAtom.val）
  // 直接修改状态（给 countAtom.val 赋值）
  const handleAdd = () => {
    countAtom.val += 1; // 直接累加（相当于 countAtom.val = countAtom.val + 1）
  };

  const handleSet = () => {
    countAtom.val = 100; // 直接设置为 100
  };

  return (
    <div style={{ border: '1px solid #f00', padding: 10, margin: 10 }}>
      <h3>组件A（修改状态）</h3>
      <p>当前值：{countAtom.val}</p> {/* 直接显示 countAtom.val */}
      <button onClick={handleAdd}>点我+1</button>
      <button onClick={handleSet} style={{ marginLeft: 10 }}>直接设为100</button>
    </div>
  );
}