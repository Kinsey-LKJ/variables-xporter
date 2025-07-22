import AutoHeight from 'embla-carousel-auto-height';
import { useCarouselApi } from '../../lib/hooks';
import Export from './export';
import HomeTabButton from './home-tab-button';
import { VariableFormProvider, useVariableForm } from './variables-export-form-context';
import Setup from './setup';
import useEmblaCarousel from 'embla-carousel-react';
import { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { AppContext } from './App';
import { Button, Drawer, ScrollArea } from '@mantine/core';
import { ColorProcessor, UnitConverter } from '../../lib/utils';
import prettier from 'prettier/standalone';
import parserEstree from 'prettier/plugins/estree';
import parserBabel from 'prettier/plugins/babel';
import { FileContent, TVariable, TVariableCollection } from '../../types/app';
import SyncGithub from './sync-github';
import { submitFormAction } from '../../lib/action';
import Welcome from './welcome';
import { notifications } from '@mantine/notifications';
import * as changeCase from 'change-case';
import { generateThemeFiles } from '../../lib/utils';
import Setting from './setting';
import { useDisclosure } from '@mantine/hooks';
import background from '../assets/background.svg';

const windowSizeMap = {
  large: { width: 600, height: 750 },
  medium: { width: 500, height: 625 },
  small: { width: 400, height: 500 },
};

export const tailwindV3IgnoreGroup = [
  'colors/slate',
  'colors/gray',
  'colors/zinc',
  'colors/neutral',
  'colors/stone',
  'colors/red',
  'colors/orange',
  'colors/amber',
  'colors/yellow',
  'colors/lime',
  'colors/green',
  'colors/emerald',
  'colors/teal',
  'colors/cyan',
  'colors/sky',
  'colors/blue',
  'colors/indigo',
  'colors/violet',
  'colors/purple',
  'colors/fuchsia',
  'colors/pink',
  'colors/rose',
];

export const tailwindV4IgnoreGroup = [
  'color/slate',
  'color/gray',
  'color/zinc',
  'color/neutral',
  'color/stone',
  'color/red',
  'color/orange',
  'color/amber',
  'color/yellow',
  'color/lime',
  'color/green',
  'color/emerald',
  'color/teal',
  'color/cyan',
  'color/sky',
  'color/blue',
  'color/indigo',
  'color/violet',
  'color/purple',
  'color/fuchsia',
  'color/pink',
  'color/rose',
];

function flattenConfig(config: object) {
  const newConfig = {};
  for (const key in config) {
    const value = config[key];
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      if (value.__value) {
        newConfig[key] = value.__value;
      } else {
        const valueToFlatten = { ...value };
        delete valueToFlatten.__value;
        newConfig[key] = flattenConfig(valueToFlatten);
      }
    } else {
      newConfig[key] = value;
    }
  }
  return newConfig;
}

async function writeConfig(config: object) {
  const rawCode = `
      module.exports = {
        theme: {
          extend:${JSON.stringify(config)}
        }
      }
      `;
  const formattedCode = await prettier.format(rawCode, {
    parser: 'babel',
    plugins: [parserEstree, parserBabel],
    printWidth: 120,
    tabWidth: 1,
    singleQuote: true,
  });

  return formattedCode;
}

export interface ExportPageHandles {
  onPrevButtonClick: () => void;
  openSetting: () => void;
}

const ExportPage = forwardRef<ExportPageHandles>((_, ref) => {
  const { collections, variables, connectedRepoInfo, currentStep, setCurrentStep, textData, windowSize } = useContext(AppContext);
  const [formattingOutput, setFormattingOutput] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [tailwindCSSOutput, setTailwindCSSOutput] = useState<{
    config?: string;
    globalsCSS?: string;
  }>(undefined);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    watchDrag: false,
  });

  const [formChanged, setFormChanged] = useState(true);

  const { selectedSnap, prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick, setSelectedSnap } =
    useCarouselApi(emblaApi);

  const variableForm = useVariableForm({
    initialValues: {
      selectCollectionID: '',
      useRemUnit: true,
      rootElementSize: 16,
      selectVariableGroup: [],
      ignoreTailwindColor: false,
      fileName: '',
      updateMessage: '',
      exportFormat: undefined,
      windowSize: windowSize,
    },
  });

  const [opened, { open, close }] = useDisclosure(false);

  const formValues = variableForm.values;

  variableForm.watch('selectCollectionID', () => {
    setFormChanged(true);
  });

  variableForm.watch('selectVariableGroup', () => {
    setFormChanged(true);
  });

  useImperativeHandle(ref, () => ({
    onPrevButtonClick,
    openSetting: open,
  }));

  useEffect(() => {
    setSelectedSnap(currentStep);
  }, [currentStep]);

  useEffect(() => {
    setCurrentStep(selectedSnap);
  }, [selectedSnap]);

  // 因为 selectVariableGroup 时引用类型，所以当 useRemUnit 或 ignoreTailwindColor 更新时出发组件重新渲染，variableForm 会重新初始化，导致 variableForm 指向新的引用， useEffect 是浅比较，所以下面的副作用也会执行
  // useEffect(() => {
  //   console.log('setFormChanged 被修改');
  //   setFormChanged(true);
  // }, [formValues.selectCollectionID, formValues.selectVariableGroup]);

  useEffect(() => {
    // 因为 ignoreTailwindColor 和 useRemUnit 不是引用类型，所以可以使用 useEffect 监听
    const generateTheme = async () => {
      if (variables && formValues.selectCollectionID) {
        try {
          const output = variables.filter((item) => item.variableCollectionId === formValues.selectCollectionID);
          console.log('ignoreTailwindColor', formValues.ignoreTailwindColor);

          const { css, tailwindConfig } = await generateThemeFiles(
            output,
            variables,
            collections,
            true,
            formValues.useRemUnit,
            formValues.selectVariableGroup,
            formValues.ignoreTailwindColor
              ? formValues.exportFormat === 'Tailwind CSS V4' || formValues.exportFormat === 'shadcn/ui (Tailwind CSS V4)'
                ? tailwindV4IgnoreGroup
                : tailwindV3IgnoreGroup
              : [],
            formValues.exportFormat || 'Tailwind CSS V4',
            formValues.rootElementSize,
            formValues.selectCollectionID
          );
          setTailwindCSSOutput({
            config: tailwindConfig,
            globalsCSS: css,
          });
        } catch (error) {
          console.log(error);
        }
      }
    };
    generateTheme();
  }, [formValues.useRemUnit, formValues.ignoreTailwindColor, formValues.exportFormat, formValues.rootElementSize]);

  const submitForm = async () => {
    setSubmitting(true);
    try {
      const { fileName, updateMessage } = formValues;
      const { owner, name, installationID } = connectedRepoInfo;
      const config: FileContent = { name: `${formValues.fileName}.config.js`, content: tailwindCSSOutput.config };
      const css = { name: `${formValues.fileName}.css`, content: tailwindCSSOutput.globalsCSS };
      await submitFormAction(owner, name, fileName, updateMessage, [config, css], installationID);
    } catch (error) {
      console.error('请求错误:', error);
    }
  };

  const handleExport = async () => {
    setFormattingOutput(true); // 显示加载图标

    try {
      const output = variables.filter((item) => item.variableCollectionId === formValues.selectCollectionID);
      const selectCollection = collections.filter((item) => item.id === formValues.selectCollectionID);
      if (output.length > 0 && selectCollection.length > 0 && variableForm.getValues().selectVariableGroup.length > 0) {
        if (formChanged) {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve('延迟完成');
            }, 1000);
          });

          const { css, tailwindConfig } = await generateThemeFiles(
            output,
            variables,
            collections,
            true,
            formValues.useRemUnit,
            formValues.selectVariableGroup,
            formValues.ignoreTailwindColor
              ? formValues.exportFormat === 'Tailwind CSS V4' || formValues.exportFormat === 'shadcn/ui (Tailwind CSS V4)'
                ? tailwindV4IgnoreGroup
                : tailwindV3IgnoreGroup
              : [],
            formValues.exportFormat || 'Tailwind CSS V4',
            formValues.rootElementSize,
            formValues.selectCollectionID
          );
          setTailwindCSSOutput({
            config: tailwindConfig,
            globalsCSS: css,
          });
        }

        onNextButtonClick();
      } else {
        notifications.show({
          message: '没有找到任何的变量',
        });
        throw new Error('没有找到任何变量');
      }
    } catch (error) {
      // 处理错误
      console.log(error);
    } finally {
      setFormattingOutput(false); // 隐藏加载图标
      setFormChanged(false);
    }
  };

  console.log(formChanged);

  return (
    <VariableFormProvider form={variableForm}>
      <form className=" h-full flex flex-col mb-0! overflow-hidden" onSubmit={variableForm.onSubmit(submitForm)}>
        <Drawer
          opened={opened}
          onClose={close}
          position="bottom"
          title={textData.setting}
          overlayProps={{ backgroundOpacity: 0.74, blur: 4 }}
        >
          <Setting windowSizeMap={windowSizeMap} />
        </Drawer>
        <div className=" overflow-x-hidden h-full">
          <div className=" overflow-x-hidden h-full" ref={emblaRef}>
            <div className=" flex h-full items-start">
              <div className=" absolute -z-10 left-0 top-0">
                <img
                  src={background}
                  alt="export-page-bg"
                  className={`max-w-none`}
                  style={{
                    height: windowSizeMap[formValues.windowSize].height - 52,
                    width: windowSizeMap[formValues.windowSize].width * 3,
                  }}
                />
              </div>
              <ScrollArea className=" flex-[0_0_100%] h-full min-w-0 p-6 overflow-y-hidden relative">
                <Welcome />
              </ScrollArea>
              <ScrollArea className=" flex-[0_0_100%] h-full min-w-0 p-6 overflow-y-hidden relative">
                <Setup />
              </ScrollArea>
              <Export tailwindCSSOutput={tailwindCSSOutput} exportFormat={formValues.exportFormat} />
            </div>
          </div>
        </div>
        <HomeTabButton
          selectedSnap={selectedSnap}
          prevBtnDisabled={prevBtnDisabled}
          nextBtnDisabled={nextBtnDisabled}
          onPrevButtonClick={onPrevButtonClick}
          onNextButtonClick={onNextButtonClick}
          formattingOutput={formattingOutput}
          handleExport={handleExport}
        />
      </form>
    </VariableFormProvider>
  );
});

export default ExportPage;
