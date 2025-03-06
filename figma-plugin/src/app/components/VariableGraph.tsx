import React, { useCallback, useState, useEffect, CSSProperties } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeProps,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, Text, Divider, Badge, Group, Select, TextInput, Checkbox, Button } from '@mantine/core';
import { VariableGraph, VariableNode, VariableEdge } from '../../lib/graph-utils';
import { Search, RefreshCw } from 'lucide-react';

// 更新 VariableNode 类型以包含 position 属性
type ExtendedVariableNode = VariableNode & {
  position?: { x: number; y: number };
};

// 自定义节点组件
const VariableNodeComponent = ({ data }: { data: any }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const handleClick = () => {
    setShowDetails(!showDetails);
  };
  
  let bgColor = data.problematic ? '#3F2A2D' : 
                data.selected ? '#1A3A4A' : 
                data.type === 'value' ? '#1A1B1E' : '#1E2124';
  
  let borderColor = data.problematic ? '#A33543' : 
                  data.selected ? '#4C9EEB' : '#323439';
  
  const nodeStyle = {
    padding: '12px',
    borderRadius: '8px',
    background: bgColor,
    border: `1px solid ${borderColor}`,
    width: '200px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    position: 'relative' as const,
    zIndex: 0
  };

  return (
    <>
      <div style={nodeStyle} onClick={handleClick}>
        <Text size="sm" fw={500} ta="center">
          {data.label}
        </Text>
        
        {data.resolvedType && (
          <Badge size="xs" color={data.resolvedType === 'COLOR' ? 'blue' : 'gray'}>
            {data.resolvedType}
          </Badge>
        )}
        
        {showDetails && (
          <Box mt="xs">
            <Text size="xs">完整路径: {data.name}</Text>
            {data.cssName && <Text size="xs">CSS变量: {data.cssName}</Text>}
            {data.collection && <Text size="xs">集合: {data.collection}</Text>}
            {data.modes && (
              <Text size="xs">
                模式: {data.modes.join(', ')}
              </Text>
            )}
            {data.problematic && (
              <Text size="xs" color="red">
                问题: 引用链存在可能的兼容性问题
              </Text>
            )}
          </Box>
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
  // 使用直角连接线
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

// 注册自定义节点类型
const nodeTypes = {
  variable: VariableNodeComponent
};

// 边类型定义
const edgeTypes = {
  custom: CustomEdge,
};

interface VariableGraphViewerProps {
  graphData: {
    nodes: ExtendedVariableNode[];
    edges: VariableEdge[];
  };
}

// 图表的样式
const flowStyles: CSSProperties = {
  height: '100%',
  background: '#18191C',
  border: '1px solid #2C2E33',
  borderRadius: '8px',
  overflow: 'hidden',
};

// 确保ReactFlow CSS正确加载
const reactFlowInstanceStyle: CSSProperties = {
  width: '100%',
  height: '100%',
};

export const VariableGraphViewer: React.FC<VariableGraphViewerProps> = ({ graphData }) => {
  // 初始化图数据，确保每个节点都有position
  const initialNodes = graphData.nodes.map(node => ({
    ...node,
    position: node.position || { x: 0, y: 0 },
    type: 'variable'
  }));
  
  const initialEdges = graphData.edges.map(edge => ({
    ...edge,
    type: 'custom'
  }));
  
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const [showProblematicOnly, setShowProblematicOnly] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // 获取模式选项
  const getModeOptions = () => {
    const modes = new Set<string>();
    graphData.nodes.forEach(node => {
      if (node.data.modes && Array.isArray(node.data.modes)) {
        node.data.modes.forEach((mode: string) => modes.add(mode));
      }
    });
    return Array.from(modes).map(mode => ({ value: mode, label: mode }));
  };

  // 过滤和搜索节点
  const filterNodes = () => {
    return initialNodes.filter(node => {
      // 搜索条件
      const matchesSearch = searchTerm === '' || 
        node.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.data.cssName && node.data.cssName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 模式过滤
      const matchesMode = !filterMode || 
        (node.data.modes && node.data.modes.includes(filterMode));
      
      // 问题过滤
      const matchesProblematic = !showProblematicOnly || node.data.problematic;
      
      return matchesSearch && matchesMode && matchesProblematic;
    });
  };

  // 过滤边 - 只显示过滤后节点之间的连接
  const filterEdges = (filteredNodes: Node[]) => {
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    return graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    ).map(edge => ({
      ...edge,
      type: 'custom',  // 使用自定义边
    }));
  };

  // 重置过滤器
  const resetFilters = () => {
    setSearchTerm('');
    setFilterMode(null);
    setShowProblematicOnly(false);
  };

  // 应用过滤器
  const applyFilters = () => {
    const filteredNodes = filterNodes();
    const filteredEdges = filterEdges(filteredNodes);
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  };

  // 当过滤条件改变时应用过滤器
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, filterMode, showProblematicOnly]);

  console.log('Rendering VariableGraphViewer with nodes:', nodes.length, 'edges:', edges.length);

  return (
    <Box>
      <Group mb="md">
        <TextInput
          placeholder="搜索变量..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={16} />}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="按模式过滤"
          value={filterMode}
          onChange={setFilterMode}
          data={getModeOptions()}
          clearable
          style={{ width: 150 }}
        />
        <Checkbox
          label="仅显示问题变量"
          checked={showProblematicOnly}
          onChange={(e) => setShowProblematicOnly(e.target.checked)}
        />
        <Button 
          variant="subtle" 
          leftSection={<RefreshCw size={16} />}
          onClick={resetFilters}
        >
          重置过滤器
        </Button>
      </Group>
      
      <div style={flowStyles}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.4}
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
              if (n.data.problematic) return '#A33543';
              if (n.data.selected) return '#4C9EEB';
              return '#555';
            }}
            nodeColor={(n) => {
              if (n.data.problematic) return '#3F2A2D';
              if (n.data.selected) return '#1A3A4A';
              return n.data.type === 'value' ? '#1A1B1E' : '#1E2124';
            }}
            style={{
              backgroundColor: '#25262B',
              border: '1px solid #2C2E33',
            }}
          />
          <Background color="#555" gap={16} size={1} />
        </ReactFlow>
      </div>
    </Box>
  );
}; 