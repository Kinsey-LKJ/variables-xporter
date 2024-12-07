import { useState, useEffect, useContext } from 'react';
import { TVariableCollection, TVariableOptions } from '@/src/lib/type';
import { TVariable } from '@/src/lib/type';
import { MultiSelect } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import { AppContext } from './App';

export interface SelectVariableGroupsProps {
  collections: TVariableCollection[];
  variables: TVariable[];
}

const SelectVariableGroups = (props: SelectVariableGroupsProps) => {
  const {textData} = useContext(AppContext)
  const { collections, variables } = props;
  const form = useVariableFormContext();

  const [selectVariableOptions, setSelectVariableOptions] = useState<TVariableOptions[]>([]);
  const selectCollectionID = form.values.selectCollectionID;
  useEffect(() => {
    if (variables && selectCollectionID) {
      try {
        const output = variables.filter((item) => item.variableCollectionId === selectCollectionID);

        const options = output.reduce((acc, item) => {
          // 从 name 属性中得到类别（如 'colors', 'spacing'）
          // 使用 shift 方法获取在 '/' 分隔符之前的部分
          let category = item.name.split('/').shift();

          // 寻找在累积对象中该类别是否已经存在
          let categoryIndex = acc.findIndex((i) => i.value === category);

          // 如果类别在累积对象中不存在，则创建一个新的类别，并使用你希望的属性名
          if (categoryIndex === -1) {
            acc.push({ value: category, label: category, variables: [item] });
          } else {
            // 如果存在，将当前项添加到类别的 var 数组中
            acc[categoryIndex].variables.push(item);
          }

          // 返回累积对象以供下一次迭代使用
          return acc;
        }, []);

        console.log(options);

        setSelectVariableOptions(options);
      } catch (error) {
        console.log(error);
      }
    }
  }, [selectCollectionID]);

  return selectCollectionID ? (
    <MultiSelect
      size="sm"
      placeholder={textData.select_variables}
      data={selectVariableOptions}
      comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
      {...form.getInputProps('selectVariableGroup')}
      className=' shadow-2xl'
      maxDropdownHeight={200}
    />
  ) : null;
};

export default SelectVariableGroups;
