import { TVariable, TVariableCollection } from '@/src/types/app';
import { MultiSelect, Select } from '@mantine/core';
import { Button } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import SelectVariableGroups from './selectVariableGroups';
import { useContext } from 'react';
import { AppContext } from './App';
import { ArrowUpRight } from 'lucide-react';
import { useMantineTheme } from '@mantine/core';
import { ExportFormat } from '@/src/types/app';

const Setup = () => {
  const { textData, collections, variables } = useContext(AppContext);
  const theme = useMantineTheme();

  const form = useVariableFormContext();
  const formValus = form.values;

  // 定义所有可用的导出格式
  const exportFormatOptions: Array<{ value: ExportFormat; label: string }> = [
    { value: 'Tailwind CSS V3', label: 'Tailwind CSS V3' },
    { value: 'Tailwind CSS V4', label: 'Tailwind CSS V4' },
    { value: 'CSS Variables', label: 'CSS Variables' },
    { value: 'shadcn/ui (Tailwind CSS V3)', label: 'shadcn/ui (Tailwind CSS V3)' },
    { value: 'shadcn/ui (Tailwind CSS V4)', label: 'shadcn/ui (Tailwind CSS V4)' },
  ];

  return (
    <div className="w-full h-full overflow-y-hidden p-1">
      <div className="grid gap-6">
        <div className="grid gap-3 text-center">
          <div className="text-4xl font-bold special-text">{textData.select_variables_to_export}</div>
        </div>

        {collections ? (
          <div className=" grid gap-4">
            <div className=" grid gap-2">
              <Select
                size="sm"
                placeholder={textData.format}
                data={exportFormatOptions}
                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                maxDropdownHeight={200}
                className=" shadow-2xl"
                color="#C3FF36"
                {...form.getInputProps('exportFormat')}
              />

              {(formValus.exportFormat === 'Tailwind CSS V4' || 
                formValus.exportFormat === 'Tailwind CSS V3' ||
                formValus.exportFormat === 'shadcn/ui (Tailwind CSS V3)' ||
                formValus.exportFormat === 'shadcn/ui (Tailwind CSS V4)') && (

                  <div className="text-xs px-1">
                    {textData.tailwind_css_variable_naming_specification}
                    <a
                      className="text-blue-300 ml-1 inline-flex items-center"
                      target="_blank"
                      href="https://www.variables-xporter.com/docs/organizing-your-variables"
                    >
                      {textData.view_our_variable_organization_suggestions}
                      <ArrowUpRight size={12} className="ml-1" />
                    </a>
                  </div>

              )}
            </div>
            <Select
              size="sm"
              placeholder={textData.select_collection}
              data={collections.map((item) => ({ value: item.id, label: item.name }))}
              comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
              maxDropdownHeight={200}
              className=" shadow-2xl"
              color="#C3FF36"
              {...form.getInputProps('selectCollectionID')}
            />
            <SelectVariableGroups collections={collections} variables={variables} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Setup;
