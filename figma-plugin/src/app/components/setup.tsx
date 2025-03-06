import { TVariable, TVariableCollection } from '@/src/types/app';
import { MultiSelect, Select, Modal, Text } from '@mantine/core';
import { Button } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import SelectVariableGroups from './selectVariableGroups';
import { useContext, useState } from 'react';
import { AppContext } from './App';
import { ArrowUpRight, Network } from 'lucide-react';
import { useMantineTheme } from '@mantine/core';
import { VariableGraphViewer } from './VariableGraph';
import { buildVariableGraph, calculateLayout } from '../../lib/graph-utils';
import { resolveVariables } from '../../lib/utils';
import SimpleFlowDemo from './SimpleFlowDemo';

// 声明ExportFormat类型
type ExportFormat = 'Tailwind CSS V3' | 'CSS Variables' | 'Tailwind CSS V4';

const Setup = () => {
  const { textData, collections, variables } = useContext(AppContext);
  const theme = useMantineTheme();
  const form = useVariableFormContext();
  const formValus = form.values;

  // 添加状态管理变量引用关系图
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const [showSimpleDemo, setShowSimpleDemo] = useState(false);

  // 生成变量引用关系图
  const handleShowGraph = () => {
    console.log('handleShowGraph 被调用');
    
    if (!collections || !variables || !formValus.selectCollectionID) {
      console.log('条件验证失败', { 
        collections: !!collections, 
        variables: !!variables, 
        selectCollectionID: formValus.selectCollectionID 
      });
      return;
    }

    // 获取当前选择的变量集合
    const selectedOutput = variables.filter(
      (item) => item.variableCollectionId === form.values.selectCollectionID
    );
    
    // 获取忽略的变量组
    const ignoreGroup = form.values.ignoreTailwindColor
      ? form.values.exportFormat === 'Tailwind CSS V4'
        ? ['效果', 'effect', '阴影', '投影', 'shadow', 'elevation', 'blur', 'opacity']
        : ['效果', 'effect', '阴影', '投影', 'shadow', 'elevation']
      : [];
      
    try {
      // 解析变量引用关系
      const results = resolveVariables(
        selectedOutput,
        variables,
        collections,
        formValus.selectVariableGroup || [],
        ignoreGroup,
        formValus.exportFormat as ExportFormat
      );
      
      // 构建变量引用关系图
      const graph = buildVariableGraph(results);
      
      // 计算图布局
      const nodesWithLayout = calculateLayout(graph.nodes, graph.edges);
      
      setGraphData({
        nodes: nodesWithLayout,
        edges: graph.edges
      });
      
      setShowGraph(true);
    } catch (error) {
      console.error("生成变量引用关系图时出错:", error);
    }
  };

  // 按钮点击后的处理函数，修改为独立的命名函数
  function onShowGraphButtonClick() {
    console.log('变量引用关系图按钮被点击');
    handleShowGraph();
  }

  // 在handleShowGraph函数旁边添加一个新函数
  const handleShowSimpleDemo = () => {
    console.log('显示简单演示按钮被点击');
    setShowSimpleDemo(true);
  };

  return (
    <div className="w-full h-full overflow-y-hidden p-1">
      <div className="grid gap-8">
        <div className="grid gap-3 text-center">
          <div className="text-4xl font-bold special-text">{textData.select_variables_to_export}</div>
          {/* <div className=" text-sm">将 Figma Variables 导出为 Tailwind CSS Presets</div> */}
        </div>

        {collections ? (
          <div className=" grid gap-4">
            <Select
              size="sm"
              placeholder={textData.select_collection}
              data={collections.map((item) => ({ value: item.id, label: item.name }))}
              comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
              maxDropdownHeight={200}
              className=" shadow-2xl"
              color='#C3FF36'
              {...form.getInputProps('selectCollectionID')}
            />
            <SelectVariableGroups collections={collections} variables={variables} />
            {formValus.selectVariableGroup.length > 0 ? (
              <div className=' grid gap-2'>
                <Select
                  size="sm"
                  placeholder={textData.format}
                  data={['Tailwind CSS V3', 'CSS Variables',"Tailwind CSS V4"]}
                  comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                  maxDropdownHeight={200}
                  className=" shadow-2xl"
                  color='#C3FF36'
                  {...form.getInputProps('exportFormat')}
                />

                {formValus.exportFormat === 'Tailwind CSS V3' ? (
                  <a
                    className=" text-xs justify-self-end text-blue-300 flex items-center justify-center"
                    target="_blank"
                    href="https://www.figma.com/community/file/1052575036916494414/tailwindcss-v3-4-3-design-system"
                    
                  >
                    {textData.tailwind_css_figma_template}
                    <ArrowUpRight size={12} />
                  </a>
                ) : null}
                
                {/* 添加变量引用关系图按钮 */}
                <Button
                  size="xs"
                  leftSection={<Network size={14} />}
                  variant="light"
                  onClick={onShowGraphButtonClick}
                  className="mt-2"
                >
                  查看变量引用关系图
                </Button>
                <Button 
                  onClick={handleShowSimpleDemo} 
                  ml="md" 
                  color="teal"
                >
                  简单Flow演示
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      
      {/* 变量引用关系图弹窗 */}
      <Modal
        opened={showGraph}
        onClose={() => setShowGraph(false)}
        title="变量引用关系图"
        size="xl"
        centered
        styles={{
          content: {
            height: '80vh',
            maxWidth: '90vw',
            display: 'flex',
            flexDirection: 'column'
          },
          body: {
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Text size="sm" mb="md">该图显示了变量之间的引用关系，红色标记表示可能存在引用链问题。</Text>
        {graphData && <VariableGraphViewer graphData={graphData} />}
      </Modal>

      {showSimpleDemo && (
        <Modal
          opened={showSimpleDemo}
          onClose={() => setShowSimpleDemo(false)}
          title="简单的React Flow演示"
          size="xl"
          styles={{
            content: {
              height: '80vh',
              maxWidth: '90vw'
            },
            body: {
              flex: 1,
              overflow: 'hidden'
            }
          }}
        >
          <SimpleFlowDemo />
        </Modal>
      )}
    </div>
  );
};

export default Setup;
