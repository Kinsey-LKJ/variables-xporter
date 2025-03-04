import { Resizable, ResizableProps } from 'react-resizable';
import React, { SyntheticEvent } from 'react';

type AspectRatioResizableProps = ResizableProps & {
  aspectRatio?: number; 
}

// 比例约束组件
const AspectRatioResizable: React.FC<AspectRatioResizableProps> = ({ aspectRatio = 4/5, children, ...props }) => {
  const constrainSize = (newWidth: number, newHeight: number) => {
    // 根据拖拽方向计算约束
    const isWidthPrimary = Math.abs(newWidth - props.width) > Math.abs(newHeight - props.height);
    
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
        // 根据手柄位置判断调整方向
        const [constrainedWidth, constrainedHeight] = constrainSize(data.size.width, data.size.height);
        
        props.onResize(e, {
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
