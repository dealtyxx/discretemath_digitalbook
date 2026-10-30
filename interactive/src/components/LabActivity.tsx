import { createContext, useContext } from 'react';

// 保留实验的组件与 WebGL 资源；各播放/渲染循环按面板可见性暂停。
export const LabActivityContext = createContext(true);
export const useLabActive = () => useContext(LabActivityContext);
