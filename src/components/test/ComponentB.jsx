// ComponentB.jsx
import React from 'react';
import { countAtom } from '../../store/atoms';

export default function ComponentB() {
  return (
    <div style={{ border: '1px solid #00f', padding: 10, margin: 10 }}>
      <h3>组件B（展示状态）</h3>
      <p>同步显示的值：{countAtom.val}</p> {/* 直接显示 countAtom.val */}
    </div>
  );
}