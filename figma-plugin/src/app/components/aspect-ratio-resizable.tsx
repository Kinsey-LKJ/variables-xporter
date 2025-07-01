import { Resizable, ResizableProps } from 'react-resizable';
import React, { SyntheticEvent } from 'react';

type AspectRatioResizableProps = ResizableProps & {
  aspectRatio?: number; 
}

// 比例约束组件
const AspectRatioResizable: React.FC<AspectRatioResizableProps> = ({ aspectRatio = 4/5, children, ...props }) => {
  const constrainSize = (newWidth: number, newHeight: number) => {
    // 确保 props.width 和 props.height 是有效数字
    const currentWidth = typeof props.width === 'number' ? props.width : 500;
    const currentHeight = typeof props.height === 'number' ? props.height : 625;
    
    // 根据拖拽方向计算约束
    const isWidthPrimary = Math.abs(newWidth - currentWidth) > Math.abs(newHeight - currentHeight);
    
    return isWidthPrimary 
      ? [newWidth, newWidth / aspectRatio] 
      : [newHeight * aspectRatio, newHeight];
  };

  return (
    <Resizable
      width={props.width}
      height={props.height}
      {...props}
      onResize={(e, data) => {
        // 确保 data.size 有效
        if (!data.size || typeof data.size.width !== 'number' || typeof data.size.height !== 'number') {
          return;
        }
        
        // 根据手柄位置判断调整方向
        const [constrainedWidth, constrainedHeight] = constrainSize(data.size.width, data.size.height);
        
        props.onResize && props.onResize(e, {
          ...data,
          size: {
            width: Math.floor(constrainedWidth),
            height: Math.floor(constrainedHeight)
          }
        });
      }}
    >
      {children}
    </Resizable>
  );
};

export default AspectRatioResizable;
