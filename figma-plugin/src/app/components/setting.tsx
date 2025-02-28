import { Switch, NumberInput, SegmentedControl } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import { useContext } from 'react';
import { AppContext } from './App';

const Setting = () => {
  const { textData } = useContext(AppContext);
  const form = useVariableFormContext();
  return (
    <div className="grid gap-8">
      {/* <div className="flex items-center justify-between gap-2">
        前缀
        <Switch size="md" />
      </div> */}
      <div className="flex items-center justify-between gap-2">
        根元素大小
        <NumberInput defaultValue={16} />
      </div>
      <div className="flex items-center justify-between gap-2">
        {textData.ignore_tailwind_css_default_palette}
        <Switch size="md" defaultChecked={form.values.ignoreTailwindColor} {...form.getInputProps('ignoreTailwindColor')} />
      </div>

      <div className="flex items-center justify-between gap-2">
        {textData.use_rem_as_unit}
        <Switch size="md" defaultChecked={form.values.useRemUnit} {...form.getInputProps('useRemUnit')} />
      </div>
    </div>
  );
};

export default Setting;
