import { TVariable, TVariableCollection } from '@/src/lib/type';
import { MultiSelect, Select } from '@mantine/core';
import { Button } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import SelectVariableGroups from './selectVariableGroups';
import { useContext } from 'react';
import { AppContext } from './App';
import { ArrowUpRight } from 'lucide-react';
import { useMantineTheme } from '@mantine/core';


const Setup = () => {
  const { textData, collections, variables } = useContext(AppContext);
  const theme = useMantineTheme();

  const form = useVariableFormContext();
  const formValus = form.values;
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
                  data={['Tailwind CSS', 'CSS Variables']}
                  comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                  maxDropdownHeight={200}
                  className=" shadow-2xl"
                                color='#C3FF36'
                  {...form.getInputProps('exportFormat')}
                />

                {formValus.exportFormat === 'Tailwind CSS' ? (
                  <a
                    className=" text-xs justify-self-end text-blue-300 flex items-center justify-center"
                    target="_blank"
                    href="https://www.figma.com/community/file/1052575036916494414/tailwindcss-v3-4-3-design-system"
                    
                  >
                    {textData.tailwind_css_figma_template}
                    <ArrowUpRight size={12} />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Setup;
