import { Resizable, ResizableProps } from 'react-resizable';
import React, { SyntheticEvent, useState } from 'react';
import { ChevronsDown } from 'lucide-react';

type AspectRatioResizableProps = {
  aspectRatio?: number;
  children: React.ReactNode;
};

// 比例约束组件
const AspectRatioResizable: React.FC<AspectRatioResizableProps> = ({ aspectRatio = 4 / 5, children }) => {
  const [size, setSize] = useState({ width: 500, height: 625 });
  const constrainSize = (newWidth: number, newHeight: number) => {
    // 确保 props.width 和 props.height 是有效数字
    const currentWidth = typeof size.width === 'number' ? size.width : 500;
    const currentHeight = typeof size.height === 'number' ? size.height : 625;

    // 根据拖拽方向计算约束
    const isWidthPrimary = Math.abs(newWidth - currentWidth) > Math.abs(newHeight - currentHeight);

    return isWidthPrimary ? [newWidth, newWidth / aspectRatio] : [newHeight * aspectRatio, newHeight];
  };

  // 向 Figma 主线程发送调整大小请求
  const sendResizeMessage = (width: number, height: number) => {
    setSize({ width, height });
    parent.postMessage(
      {
        pluginMessage: {
          type: 'resize',
          width,
          height,
        },
      },
      '*'
    );
  };

  return (
    <Resizable
      width={size.width}
      height={size.height}
      minConstraints={[400, 500]} // 最小尺寸
      maxConstraints={[800, 1000]} // 最大尺寸
      handle={<ChevronsDown size={20} className="absolute bottom-0 right-0 -rotate-45 cursor-nwse-resize z-50" />}
      onResize={(e, data) => {
        // 确保 data.size 有效
        if (!data.size || typeof data.size.width !== 'number' || typeof data.size.height !== 'number') {
          return;
        }

        // 根据手柄位置判断调整方向
        const [constrainedWidth, constrainedHeight] = constrainSize(data.size.width, data.size.height);

        sendResizeMessage(Math.floor(constrainedWidth), Math.floor(constrainedHeight));
      }}
      // onResizeStop={(e, data) => {
      //   if (!data.size || typeof data.size.width !== 'number' || typeof data.size.height !== 'number') {
      //     return;
      //   }
      //   const [constrainedWidth, constrainedHeight] = constrainSize(data.size.width, data.size.height);
      //   setStoreSize({ width: Math.floor(constrainedWidth), height: Math.floor(constrainedHeight) });
      // }}
    >
      <div
        className="relative overflow-hidden w-full h-full"
        style={
          {
            '--background-width': `${size.width * 3}px`,
            '--background-height': `${size.height - 52}px`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </Resizable>
  );
};

export default AspectRatioResizable;
