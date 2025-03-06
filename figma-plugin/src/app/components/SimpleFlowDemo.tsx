import React, { useState, CSSProperties } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  MiniMap,
  MarkerType,
  Position,
  Handle,
  EdgeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Text, Badge, Paper } from '@mantine/core';

// 确保ReactFlow CSS正确加载
const flowStyles: CSSProperties = {
  height: 600,
  background: '#18191C',
  border: '1px solid #2C2E33',
  borderRadius: '8px',
  overflow: 'hidden',
};

// 全局CSS样式 - 用于覆盖可能的冲突
const reactFlowInstanceStyle: CSSProperties = {
  width: '100%',
  height: '100%',
};

// 自定义节点组件 - 工作流节点
const ProcessNode = ({ data }: { data: any }) => {
  const nodeStyle = {
    padding: '16px',
    borderRadius: '8px',
    background: '#1A1B1E',
    border: '1px solid #2C2E33',
    width: '220px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 0,
  };

  return (
    <>
      <div style={nodeStyle}>
        {data.icon && (
          <div style={{ 
            background: '#2C2E33', 
            borderRadius: '50%', 
            width: '36px', 
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            {data.icon}
          </div>
        )}
        <Text size="md" fw={600} mb={4}>{data.label}</Text>
        {data.subLabel && (
          <Text size="sm" color="#9DA1A8">{data.subLabel}</Text>
        )}
      </div>
      <Handle 
        type="target" 
        position={Position.Top} 
        id={`${data.id}-target`}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          width: '15px', 
          height: '15px', 
          top: '-5px',
          visibility: 'hidden'
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id={`${data.id}-source`}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          width: '15px', 
          height: '15px', 
          bottom: '-5px',
          visibility: 'hidden'
        }}
      />
    </>
  );
};

// 决策节点
const DecisionNode = ({ data }: { data: any }) => {
  let bgColor = '#1A1B1E';
  let borderColor = '#2C2E33';
  
  if (data.status === 'positive') {
    bgColor = '#163A2D';
    borderColor = '#137758';
  } else if (data.status === 'negative') {
    bgColor = '#3F2A2D';
    borderColor = '#A33543';
  }

  return (
    <>
      <div style={{
        padding: '10px 20px',
        borderRadius: '40px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: '#fff',
        textAlign: 'center',
        minWidth: '180px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        zIndex: 0,
      }}>
        <Text fw={600}>{data.label}</Text>
      </div>
      <Handle 
        type="target" 
        position={Position.Top}
        id={`${data.id}-target`}
        style={{ 
          background: 'transparent', 
          border: 'none',
          width: '15px',
          height: '15px',
          top: '-5px',
          visibility: 'hidden'
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        id={`${data.id}-source`}
        style={{ 
          background: 'transparent', 
          border: 'none',
          width: '15px',
          height: '15px',
          bottom: '-5px',
          visibility: 'hidden'
        }}
      />
    </>
  );
};

// 自定义边组件
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  ...props
}: EdgeProps) => {
  // 计算路径 - 修改为直接从源到目标的路径，而不使用贝塞尔曲线
  // 这样可以让连接线贴着节点
  const path = `M${sourceX},${sourceY} L${sourceX},${sourceY + (targetY - sourceY) / 2} L${targetX},${sourceY + (targetY - sourceY) / 2} L${targetX},${targetY}`;

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={path}
      strokeWidth={1.5}
      stroke="#555"
    />
  );
};

// 节点类型定义
const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
};

// 边类型定义
const edgeTypes = {
  custom: CustomEdge,
};

// 初始节点和边
const initialNodes: Node[] = [
  {
    id: '1',
    data: { 
      id: '1',
      label: 'Trigger', 
      subLabel: 'Moved Champions',
      icon: <span style={{ color: '#FFD43B', fontSize: '18px' }}>⊙</span>
    },
    position: { x: 250, y: 50 },
    type: 'process',
  },
  {
    id: '2',
    data: { 
      id: '2',
      label: 'AI Account Qualification',
      icon: <span style={{ color: '#5CADFF', fontSize: '18px' }}>⋄</span>
    },
    position: { x: 250, y: 200 },
    type: 'process',
  },
  {
    id: '3',
    data: { 
      id: '3',
      label: 'Qualified',
      status: 'positive'
    },
    position: { x: 150, y: 350 },
    type: 'decision',
  },
  {
    id: '4',
    data: { 
      id: '4',
      label: 'Not qualified',
      status: 'negative'
    },
    position: { x: 350, y: 350 },
    type: 'decision',
  },
  {
    id: '5',
    data: { 
      id: '5',
      label: 'Prospect',
      subLabel: 'Prospect for Marketers',
      icon: <span style={{ color: '#fff', fontSize: '18px' }}>⊕</span>
    },
    position: { x: 150, y: 450 },
    type: 'process',
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    type: 'custom',
    animated: true
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    type: 'custom',
    animated: true
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    type: 'custom',
    animated: true
  },
  { 
    id: 'e3-5', 
    source: '3', 
    target: '5',
    type: 'custom',
    animated: true
  },
];

const SimpleFlowDemo = () => {
  const [nodes] = useState<Node[]>(initialNodes);
  const [edges] = useState<Edge[]>(initialEdges);

  console.log('Rendering SimpleFlowDemo with edges:', edges);

  return (
    <div style={flowStyles}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={1.5}
        fitView
        proOptions={{ hideAttribution: true }}
        style={reactFlowInstanceStyle}
        className="dark"
      >
        <Controls 
          style={{
            backgroundColor: '#2C2E33',
            color: '#fff',
            border: 'none',
          }}
        />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === 'decision') return n.data.status === 'positive' ? '#137758' : '#A33543';
            return '#555';
          }}
          nodeColor={(n) => {
            if (n.type === 'decision') return n.data.status === 'positive' ? '#163A2D' : '#3F2A2D';
            return '#1A1B1E';
          }}
          style={{
            backgroundColor: '#25262B',
            border: '1px solid #2C2E33',
          }}
        />
        <Background color="#555" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};

export default SimpleFlowDemo; 