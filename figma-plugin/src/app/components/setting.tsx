import { Switch, NumberInput, SegmentedControl, Tooltip } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import { useContext, useEffect } from 'react';
import { AppContext } from './App';
import { Info } from 'lucide-react';

const Setting = ({ windowSizeMap }: { windowSizeMap: { [key: string]: { width: number; height: number } } }) => {
  const { textData, windowSize, setWindowSize } = useContext(AppContext);
  const form = useVariableFormContext();
  const formValues = form.values;

  useEffect(() => {
    sendResizeMessage(windowSizeMap[formValues.windowSize].width, windowSizeMap[formValues.windowSize].height);
    setWindowSize(formValues.windowSize);
  }, [formValues.windowSize]);

  const sendResizeMessage = (width: number, height: number) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'resize',
          width,
          height,
        },
      },
      '*'
    );
  };

  return (
    <div className="grid gap-8">
      {/* <div className="flex items-center justify-between gap-2">
        前缀
        <Switch size="md" />
      </div> */}

      <div className="flex items-center justify-between gap-2">
        {textData.use_rem_as_unit}
        <Switch size="md" defaultChecked={form.values.useRemUnit} {...form.getInputProps('useRemUnit')} />
      </div>

      {formValues.useRemUnit && (
        <div className="flex items-center justify-between gap-2">
          {textData.root_element_size}
          <NumberInput defaultValue={formValues.rootElementSize} {...form.getInputProps('rootElementSize')} />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {textData.window_size}
        <SegmentedControl
          data={[
            { label: textData.large, value: 'large' },
            { label: textData.medium, value: 'medium' },
            { label: textData.small, value: 'small' },
          ]}
          defaultValue={windowSize}
          {...form.getInputProps('windowSize')}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="grid gap-1">
          {textData.ignore_tailwind_css_default_palette}
          <Tooltip
            multiline
            w={220}
            withArrow
            transitionProps={{ duration: 200 }}
            label={textData.when_do_you_need_to_do_this_description}
          >
            <div className="flex items-center gap-1 text-xs">
              <span>{textData.when_do_you_need_to_do_this}</span>
              <Info size={12} />
            </div>
          </Tooltip>
        </div>

        <Switch
          size="md"
          defaultChecked={form.values.ignoreTailwindColor}
          {...form.getInputProps('ignoreTailwindColor')}
        />
      </div>
    </div>
  );
};

export default Setting;
