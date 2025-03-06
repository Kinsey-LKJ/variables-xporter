import { Result, ResolvedValue, isColorValue, ResultValue } from './utils';
import dagre from 'dagre';

export type VariableNode = {
  id: string;
  label: string;
  type: 'variable' | 'value'; // 变量节点或值节点
  data: {
    name: string;
    cssName: string;
    collection?: string;
    resolvedType?: string;
    modes?: string[];
    problematic?: boolean;
  };
};

export type VariableEdge = {
  id: string;
  source: string; // 源节点ID
  target: string; // 目标节点ID
  label?: string;
  animated?: boolean; // 用于标记潜在问题的边
  data?: {
    mode?: string;
    problematic?: boolean;
  };
};

export type VariableGraph = {
  nodes: VariableNode[];
  edges: VariableEdge[];
};

/**
 * 从变量结果中构建引用关系图
 */
export function buildVariableGraph(results: Result[]): VariableGraph {
  const nodes: VariableNode[] = [];
  const edges: VariableEdge[] = [];
  const nodeIds = new Set<string>();
  const problematicVariables = new Set<string>();
  
  // 为每个变量创建节点
  results.forEach(result => {
    const variableName = result.initialVariable.name;
    const variableId = `var-${variableName.replace(/\//g, '-')}`;
    
    if (!nodeIds.has(variableId)) {
      nodeIds.add(variableId);
      nodes.push({
        id: variableId,
        label: variableName.split('/').pop() || variableName,
        type: 'variable',
        data: {
          name: variableName,
          cssName: `--${variableName.replace(/\//g, '-')}`,
          collection: result.initialVariable.collection.name,
          resolvedType: result.initialVariable.resolvedDataType,
          modes: Object.keys(result.modes)
        }
      });
    }
    
    // 分析每个模式下的引用关系
    Object.entries(result.modes).forEach(([modeId, modeData]) => {
      const resultValue = modeData as ResultValue;
      if (!resultValue.value) return;
      
      // 如果是引用其他变量
      if (typeof resultValue.value === 'object' && !isColorValue(resultValue.value)) {
        const refChain: string[] = [];
        let hasMultipleReferences = false;
        
        Object.entries(resultValue.value).forEach(([refModeId, refValue]: [string, any]) => {
          if (refValue.variable) {
            const targetId = `var-${refValue.variable.name.replace(/\//g, '-')}`;
            refChain.push(refValue.variable.name);
            
            // 如果目标节点不存在，创建一个
            if (!nodeIds.has(targetId)) {
              nodeIds.add(targetId);
              nodes.push({
                id: targetId,
                label: refValue.variable.name.split('/').pop() || refValue.variable.name,
                type: 'variable',
                data: {
                  name: refValue.variable.name,
                  cssName: `--${refValue.variable.name.replace(/\//g, '-')}`,
                  collection: refValue.variable.collection.name
                }
              });
            }
            
            // 创建边
            const edgeId = `${variableId}-${targetId}-${modeId}`;
            edges.push({
              id: edgeId,
              source: variableId,
              target: targetId,
              label: modeId,
              data: {
                mode: modeId
              }
            });
            
            if (Object.keys(resultValue.value as object).length > 1) {
              hasMultipleReferences = true;
            }
          }
        });
        
        // 检查引用链深度
        if (refChain.length > 2 || hasMultipleReferences) {
          problematicVariables.add(variableId);
        }
      } 
      // 如果是直接值
      else {
        const valueId = `value-${variableId}-${modeId}`;
        const valueLabel = isColorValue(resultValue.value) 
          ? '色值' 
          : String(resultValue.value).substring(0, 10);
          
        // 添加值节点
        nodes.push({
          id: valueId,
          label: valueLabel,
          type: 'value',
          data: {
            name: valueLabel,
            cssName: ''
          }
        });
        
        // 从变量到值的边
        edges.push({
          id: `${variableId}-${valueId}`,
          source: variableId,
          target: valueId,
          label: modeId,
          data: {
            mode: modeId
          }
        });
      }
    });
  });
  
  // 标记有问题的变量节点和引用边
  nodes.forEach(node => {
    if (problematicVariables.has(node.id)) {
      node.data.problematic = true;
    }
  });
  
  edges.forEach(edge => {
    if (problematicVariables.has(edge.source) || problematicVariables.has(edge.target)) {
      edge.animated = true;
      edge.data = {
        ...edge.data,
        problematic: true
      };
    }
  });
  
  return { nodes, edges };
}

/**
 * 使用dagre计算图布局
 */
export function calculateLayout(nodes: any[], edges: any[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // 设置节点大小
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 172, height: 36 });
  });

  // 添加边
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 计算布局
  dagre.layout(dagreGraph);

  // 获取计算后的位置
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y,
      },
    };
  });
} 