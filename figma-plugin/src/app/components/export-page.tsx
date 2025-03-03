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
import { processColorValue as rgbObjectToColorString, processConstantValue as getCssValue } from '../../lib/utils';
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

const ExportPage = forwardRef<ExportPageHandles>((props, ref) => {
  const { collections, variables, connectedRepoInfo, currentStep, setCurrentStep, textData } = useContext(AppContext);
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
      ignoreTailwindColor: true,
      fileName: '',
      updateMessage: '',
      exportFormat: 'Tailwind CSS',
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
              ? formValues.exportFormat === 'Tailwind CSS'
                ? tailwindV4IgnoreGroup
                : tailwindV3IgnoreGroup
              : [],
            formValues.exportFormat,
            formValues.rootElementSize
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
              ? formValues.exportFormat === 'Tailwind CSS'
                ? tailwindV4IgnoreGroup
                : tailwindV3IgnoreGroup
              : [],
            formValues.exportFormat,
            formValues.rootElementSize
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
      <form className=" h-full flex flex-col !mb-0 overflow-hidden" onSubmit={variableForm.onSubmit(submitForm)}>
        <Drawer
          opened={opened}
          onClose={close}
          position="bottom"
          title={textData.setting}
          overlayProps={{ backgroundOpacity: 0.74, blur: 4 }}
        >
          <Setting />
        </Drawer>
        <div className=" overflow-x-hidden h-full">
          <div className=" overflow-x-hidden h-full" ref={emblaRef}>
            <div className=" flex h-full items-start">
              <div className=" absolute -z-10 left-0 top-0">
                <svg width="1200" height="448" viewBox="0 0 1200 448" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_375_1247)">
                    <rect width="1200" height="448" fill="#0A1122" />
                    <path
                      d="M588.5 260V265.515C588.5 267.106 589.132 268.632 590.257 269.757L620.243 299.743C621.368 300.868 622.894 301.5 624.485 301.5L921 301.5H988.515C990.106 301.5 991.632 300.868 992.757 299.743L1024.74 267.757C1025.87 266.632 1026.5 265.106 1026.5 263.515V262"
                      stroke="url(#paint0_linear_375_1247)"
                    />
                    <path
                      d="M588.5 245V239.485C588.5 237.894 589.132 236.368 590.257 235.243L620.243 205.257C621.368 204.132 622.894 203.5 624.485 203.5L919 203.5H988.515C990.106 203.5 991.632 204.132 992.757 205.257L1024.74 237.243C1025.87 238.368 1026.5 239.894 1026.5 241.485V243"
                      stroke="url(#paint1_linear_375_1247)"
                    />
                    <mask id="mask0_375_1247" maskUnits="userSpaceOnUse" x="1048" y="243" width="152" height="19">
                      <rect x="1048" y="243" width="152" height="19" fill="url(#paint2_linear_375_1247)" />
                    </mask>
                    <g mask="url(#mask0_375_1247)">
                      <rect
                        x="1048"
                        y="243"
                        width="152"
                        height="19"
                        fill="url(#paint3_linear_375_1247)"
                        fill-opacity="0.15"
                      />
                    </g>
                    <g filter="url(#filter0_d_375_1247)">
                      <path
                        d="M1025 244H1049C1051.21 244 1053 245.791 1053 248V257C1053 259.209 1051.21 261 1049 261H1025V244Z"
                        fill="url(#paint4_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter1_df_375_1247)">
                      <rect
                        x="1045"
                        y="261"
                        width="17"
                        height="8"
                        rx="4"
                        transform="rotate(-90 1045 261)"
                        fill="url(#paint5_linear_375_1247)"
                      />
                    </g>
                    <g filter="url(#filter2_df_375_1247)">
                      <rect
                        x="1022"
                        y="260"
                        width="15"
                        height="31"
                        rx="7.5"
                        transform="rotate(-90 1022 260)"
                        fill="url(#paint6_linear_375_1247)"
                      />
                    </g>
                    <g filter="url(#filter3_d_375_1247)">
                      <rect
                        x="1010"
                        y="242"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint7_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter4_d_375_1247)">
                      <rect
                        x="1031"
                        y="260"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint8_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter5_d_375_1247)">
                      <rect
                        x="1034"
                        y="241"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint9_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter6_d_375_1247)">
                      <rect
                        x="1035"
                        y="263"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint10_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <path d="M631 252.5H230H0" stroke="#212538" />
                    <path
                      d="M620.5 182.5V185.5L574.5 231.5H564.5H509.328C508.798 231.5 508.289 231.711 507.914 232.086L499.086 240.914C498.711 241.289 498.202 241.5 497.672 241.5H414.315C413.793 241.5 413.291 241.296 412.917 240.93L370.083 199.07C369.709 198.704 369.207 198.5 368.685 198.5H325.328C324.798 198.5 324.289 198.711 323.914 199.086L278.586 244.414C278.211 244.789 277.702 245 277.172 245H229H199.5L199.5 447.5"
                      stroke="#212538"
                    />
                    <path
                      d="M599.5 323.5V298L599 297.5L574 272.5H531.828C531.298 272.5 530.789 272.289 530.414 271.914L521.586 263.086C521.211 262.711 520.702 262.5 520.172 262.5H372.828C372.298 262.5 371.789 262.711 371.414 263.086L328.586 305.914C328.211 306.289 327.702 306.5 327.172 306.5H268.328C267.798 306.5 267.289 306.289 266.914 305.914L226.5 265.5L199.5 238.5V175.5C199.5 173.291 197.709 171.5 195.5 171.5H38.5C36.2909 171.5 34.5 169.709 34.5 167.5V0"
                      stroke="#212538"
                    />
                    <path d="M110 172V171H128.5H147V172H128.5H110Z" fill="url(#paint11_linear_375_1247)" />
                    <g filter="url(#filter7_f_375_1247)">
                      <ellipse cx="128.5" cy="171.5" rx="6.5" ry="3.5" fill="url(#paint12_linear_375_1247)" />
                    </g>
                    <g filter="url(#filter8_f_375_1247)">
                      <circle cx="128.5" cy="171.5" r="4.5" fill="url(#paint13_radial_375_1247)" />
                    </g>
                    <g filter="url(#filter9_f_375_1247)">
                      <circle cx="128.5" cy="171.5" r="1.5" fill="white" />
                    </g>
                    <path d="M10 253V252H28.5H47V253H28.5H10Z" fill="url(#paint14_linear_375_1247)" />
                    <g filter="url(#filter10_f_375_1247)">
                      <ellipse cx="28.5" cy="252.5" rx="6.5" ry="3.5" fill="url(#paint15_linear_375_1247)" />
                    </g>
                    <g filter="url(#filter11_f_375_1247)">
                      <circle cx="28.5" cy="252.5" r="4.5" fill="url(#paint16_radial_375_1247)" />
                    </g>
                    <g filter="url(#filter12_f_375_1247)">
                      <circle cx="28.5" cy="252.5" r="1.5" fill="white" />
                    </g>
                    <path
                      d="M200 347L199 347L199 328.5L199 310L200 310L200 328.5L200 347Z"
                      fill="url(#paint17_linear_375_1247)"
                    />
                    <g filter="url(#filter13_f_375_1247)">
                      <ellipse
                        cx="199.5"
                        cy="328.5"
                        rx="6.5"
                        ry="3.5"
                        transform="rotate(-90 199.5 328.5)"
                        fill="url(#paint18_linear_375_1247)"
                      />
                    </g>
                    <g filter="url(#filter14_f_375_1247)">
                      <circle
                        cx="199.5"
                        cy="328.5"
                        r="4.5"
                        transform="rotate(-90 199.5 328.5)"
                        fill="url(#paint19_radial_375_1247)"
                      />
                    </g>
                    <g filter="url(#filter15_f_375_1247)">
                      <circle cx="199.5" cy="328.5" r="1.5" transform="rotate(-90 199.5 328.5)" fill="white" />
                    </g>
                    <g opacity="0.4">
                      <path
                        d="M950.983 101.455V108H950.216L946.649 102.861H946.585V108H945.793V101.455H946.56L950.139 106.607H950.203V101.455H950.983ZM957.043 103.5C956.973 103.285 956.88 103.092 956.765 102.922C956.652 102.749 956.517 102.602 956.359 102.48C956.204 102.359 956.027 102.266 955.829 102.202C955.631 102.138 955.413 102.107 955.177 102.107C954.789 102.107 954.437 102.207 954.119 102.407C953.802 102.607 953.549 102.902 953.362 103.292C953.174 103.682 953.08 104.161 953.08 104.727C953.08 105.294 953.175 105.772 953.365 106.162C953.554 106.552 953.811 106.847 954.135 107.048C954.459 107.248 954.823 107.348 955.228 107.348C955.603 107.348 955.933 107.268 956.219 107.108C956.506 106.946 956.73 106.718 956.89 106.424C957.052 106.128 957.133 105.78 957.133 105.379L957.376 105.43H955.407V104.727H957.9V105.43C957.9 105.969 957.785 106.438 957.555 106.837C957.327 107.235 957.011 107.544 956.609 107.763C956.208 107.981 955.748 108.089 955.228 108.089C954.649 108.089 954.139 107.953 953.7 107.68C953.264 107.408 952.923 107.02 952.678 106.517C952.435 106.014 952.313 105.418 952.313 104.727C952.313 104.21 952.383 103.744 952.521 103.331C952.662 102.915 952.86 102.561 953.116 102.27C953.371 101.978 953.674 101.754 954.023 101.598C954.373 101.443 954.757 101.365 955.177 101.365C955.522 101.365 955.844 101.417 956.142 101.522C956.443 101.624 956.71 101.77 956.944 101.96C957.181 102.147 957.378 102.372 957.536 102.634C957.693 102.894 957.802 103.183 957.862 103.5H957.043ZM959.257 108V101.455H960.05V107.297H963.093V108H959.257ZM966.301 108.089C965.863 108.089 965.475 108.012 965.138 107.856C964.804 107.699 964.543 107.482 964.355 107.207C964.168 106.93 964.075 106.615 964.077 106.261C964.075 105.984 964.129 105.729 964.24 105.494C964.351 105.258 964.502 105.061 964.694 104.903C964.888 104.743 965.104 104.642 965.343 104.599V104.561C965.029 104.48 964.78 104.304 964.595 104.034C964.409 103.761 964.318 103.451 964.32 103.104C964.318 102.771 964.402 102.474 964.572 102.212C964.743 101.95 964.977 101.743 965.276 101.592C965.576 101.441 965.918 101.365 966.301 101.365C966.681 101.365 967.02 101.441 967.318 101.592C967.616 101.743 967.85 101.95 968.021 102.212C968.194 102.474 968.281 102.771 968.283 103.104C968.281 103.451 968.186 103.761 967.999 104.034C967.813 104.304 967.567 104.48 967.26 104.561V104.599C967.497 104.642 967.71 104.743 967.9 104.903C968.089 105.061 968.24 105.258 968.353 105.494C968.466 105.729 968.524 105.984 968.526 106.261C968.524 106.615 968.428 106.93 968.238 107.207C968.051 107.482 967.79 107.699 967.455 107.856C967.123 108.012 966.738 108.089 966.301 108.089ZM966.301 107.386C966.598 107.386 966.853 107.338 967.069 107.243C967.284 107.147 967.45 107.011 967.567 106.837C967.684 106.662 967.744 106.457 967.746 106.223C967.744 105.976 967.68 105.757 967.554 105.568C967.429 105.378 967.257 105.229 967.04 105.12C966.825 105.012 966.578 104.957 966.301 104.957C966.022 104.957 965.773 105.012 965.554 105.12C965.336 105.229 965.165 105.378 965.039 105.568C964.915 105.757 964.855 105.976 964.857 106.223C964.855 106.457 964.911 106.662 965.026 106.837C965.143 107.011 965.311 107.147 965.528 107.243C965.745 107.338 966.003 107.386 966.301 107.386ZM966.301 104.28C966.536 104.28 966.744 104.233 966.925 104.139C967.108 104.045 967.252 103.914 967.356 103.746C967.461 103.578 967.514 103.381 967.516 103.155C967.514 102.933 967.462 102.74 967.359 102.576C967.257 102.41 967.115 102.282 966.934 102.193C966.753 102.101 966.542 102.055 966.301 102.055C966.056 102.055 965.842 102.101 965.659 102.193C965.476 102.282 965.334 102.41 965.234 102.576C965.134 102.74 965.085 102.933 965.087 103.155C965.085 103.381 965.135 103.578 965.237 103.746C965.342 103.914 965.485 104.045 965.669 104.139C965.852 104.233 966.063 104.28 966.301 104.28ZM969.955 108L972.883 102.209V102.158H969.508V101.455H973.701V102.196L970.786 108H969.955Z"
                        fill="#6E6D89"
                      />
                      <circle cx="942" cy="99" r="1" fill="url(#paint20_radial_375_1247)" />
                      <circle cx="942" cy="110" r="1" fill="url(#paint21_radial_375_1247)" />
                      <circle cx="977" cy="99" r="1" fill="url(#paint22_radial_375_1247)" />
                      <circle cx="977" cy="110" r="1" fill="url(#paint23_radial_375_1247)" />
                    </g>
                    <path d="M630.5 252.5H661" stroke="#212538" />
                    <path
                      d="M670.5 285.5H639H631.5L623.5 277.5V227.5L631.5 219.5H681.5L689.5 227.5V268V277.5L681.5 285.5H670.5Z"
                      stroke="#212538"
                    />
                    <g filter="url(#filter16_d_375_1247)">
                      <rect x="566" y="245" width="44" height="15" rx="3" fill="#232C3F" shape-rendering="crispEdges" />
                      <rect
                        x="566.5"
                        y="245.5"
                        width="43"
                        height="14"
                        rx="2.5"
                        stroke="url(#paint24_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                      <path
                        d="M570.793 256V249.455H574.743V250.158H571.585V252.369H574.538V253.072H571.585V255.297H574.794V256H570.793ZM576.555 249.455L578.243 252.178H578.294L579.981 249.455H580.914L578.856 252.727L580.914 256H579.981L578.294 253.328H578.243L576.555 256H575.622L577.731 252.727L575.622 249.455H576.555ZM581.946 256V249.455H584.158C584.671 249.455 585.091 249.547 585.417 249.733C585.745 249.916 585.988 250.164 586.146 250.477C586.303 250.79 586.382 251.14 586.382 251.526C586.382 251.911 586.303 252.262 586.146 252.577C585.99 252.892 585.749 253.144 585.423 253.331C585.097 253.517 584.68 253.609 584.17 253.609H582.585V252.906H584.145C584.496 252.906 584.779 252.846 584.992 252.724C585.205 252.603 585.359 252.439 585.455 252.232C585.553 252.023 585.602 251.788 585.602 251.526C585.602 251.263 585.553 251.029 585.455 250.822C585.359 250.616 585.204 250.454 584.989 250.337C584.773 250.217 584.488 250.158 584.132 250.158H582.739V256H581.946ZM593.182 252.727C593.182 253.418 593.057 254.014 592.808 254.517C592.558 255.02 592.216 255.408 591.782 255.68C591.347 255.953 590.851 256.089 590.292 256.089C589.734 256.089 589.238 255.953 588.803 255.68C588.368 255.408 588.026 255.02 587.777 254.517C587.528 254.014 587.403 253.418 587.403 252.727C587.403 252.037 587.528 251.44 587.777 250.938C588.026 250.435 588.368 250.047 588.803 249.774C589.238 249.501 589.734 249.365 590.292 249.365C590.851 249.365 591.347 249.501 591.782 249.774C592.216 250.047 592.558 250.435 592.808 250.938C593.057 251.44 593.182 252.037 593.182 252.727ZM592.415 252.727C592.415 252.161 592.32 251.682 592.13 251.292C591.943 250.902 591.688 250.607 591.366 250.407C591.047 250.207 590.689 250.107 590.292 250.107C589.896 250.107 589.537 250.207 589.215 250.407C588.896 250.607 588.641 250.902 588.451 251.292C588.264 251.682 588.17 252.161 588.17 252.727C588.17 253.294 588.264 253.772 588.451 254.162C588.641 254.552 588.896 254.847 589.215 255.048C589.537 255.248 589.896 255.348 590.292 255.348C590.689 255.348 591.047 255.248 591.366 255.048C591.688 254.847 591.943 254.552 592.13 254.162C592.32 253.772 592.415 253.294 592.415 252.727ZM594.514 256V249.455H596.726C597.237 249.455 597.657 249.542 597.985 249.717C598.313 249.889 598.556 250.127 598.714 250.429C598.872 250.732 598.95 251.076 598.95 251.462C598.95 251.847 598.872 252.189 598.714 252.488C598.556 252.786 598.314 253.02 597.988 253.191C597.662 253.359 597.246 253.443 596.739 253.443H594.949V252.727H596.713C597.063 252.727 597.344 252.676 597.557 252.574C597.772 252.472 597.928 252.327 598.024 252.139C598.122 251.95 598.171 251.724 598.171 251.462C598.171 251.2 598.122 250.971 598.024 250.775C597.926 250.578 597.769 250.427 597.554 250.321C597.339 250.212 597.054 250.158 596.7 250.158H595.307V256H594.514ZM597.595 253.06L599.206 256H598.286L596.7 253.06H597.595ZM599.913 250.158V249.455H604.822V250.158H602.764V256H601.971V250.158H599.913Z"
                        fill="#D0DAF8"
                      />
                    </g>
                    <g opacity="0.6">
                      <rect
                        x="890"
                        y="218"
                        width="7"
                        height="17"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint25_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="900"
                        y="218"
                        width="7"
                        height="17"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint26_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="910"
                        y="218"
                        width="7"
                        height="17"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint27_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="920"
                        y="218"
                        width="7"
                        height="17"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint28_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="930"
                        y="218"
                        width="7"
                        height="17"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint29_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path opacity="0.6" d="M937 222.5H944H971L983.5 235V241.5" stroke="#212538" />
                      <path opacity="0.6" d="M937 226.5H944H969.5L979.5 236.5V240.5L981.5 242.5" stroke="#212538" />
                      <path
                        opacity="0.6"
                        d="M937 230.5H940.5H944H967.5L975.5 238.5V241.5L978.5 244.5H981"
                        stroke="#212538"
                      />
                      <rect
                        x="892"
                        y="237"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint30_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="902"
                        y="237"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint31_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="912"
                        y="237"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint32_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="922"
                        y="237"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint33_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="932"
                        y="237"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint34_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <circle cx="983.5" cy="244.5" r="2.5" stroke="#8F9CDA" />
                      <path d="M983.5 247.5V249.5L984.5 250.5H992L997 255.5H1005" stroke="#212538" />
                      <path d="M985.5 246.5L986.5 247.5H993.5L998.5 252.5H1005" stroke="#212538" />
                      <path d="M986.5 244.5H995L1000 249.5H1005" stroke="#212538" />
                    </g>
                    <g filter="url(#filter17_ddi_375_1247)">
                      <rect
                        x="1005"
                        y="245"
                        width="46"
                        height="15"
                        rx="3"
                        fill="#232C3F"
                        shape-rendering="crispEdges"
                      />
                      <rect
                        x="1005.5"
                        y="245.5"
                        width="45"
                        height="14"
                        rx="2.5"
                        stroke="url(#paint35_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                      <path
                        d="M1015.32 252.727C1015.32 253.418 1015.19 254.014 1014.94 254.517C1014.69 255.02 1014.35 255.408 1013.92 255.68C1013.48 255.953 1012.98 256.089 1012.43 256.089C1011.87 256.089 1011.37 255.953 1010.94 255.68C1010.5 255.408 1010.16 255.02 1009.91 254.517C1009.66 254.014 1009.54 253.418 1009.54 252.727C1009.54 252.037 1009.66 251.44 1009.91 250.938C1010.16 250.435 1010.5 250.047 1010.94 249.774C1011.37 249.501 1011.87 249.365 1012.43 249.365C1012.98 249.365 1013.48 249.501 1013.92 249.774C1014.35 250.047 1014.69 250.435 1014.94 250.938C1015.19 251.44 1015.32 252.037 1015.32 252.727ZM1014.55 252.727C1014.55 252.161 1014.45 251.682 1014.26 251.292C1014.08 250.902 1013.82 250.607 1013.5 250.407C1013.18 250.207 1012.82 250.107 1012.43 250.107C1012.03 250.107 1011.67 250.207 1011.35 250.407C1011.03 250.607 1010.77 250.902 1010.59 251.292C1010.4 251.682 1010.3 252.161 1010.3 252.727C1010.3 253.294 1010.4 253.772 1010.59 254.162C1010.77 254.552 1011.03 254.847 1011.35 255.048C1011.67 255.248 1012.03 255.348 1012.43 255.348C1012.82 255.348 1013.18 255.248 1013.5 255.048C1013.82 254.847 1014.08 254.552 1014.26 254.162C1014.45 253.772 1014.55 253.294 1014.55 252.727ZM1020.94 249.455H1021.74V253.788C1021.74 254.236 1021.63 254.635 1021.42 254.987C1021.21 255.336 1020.92 255.612 1020.53 255.815C1020.15 256.015 1019.71 256.115 1019.19 256.115C1018.68 256.115 1018.23 256.015 1017.85 255.815C1017.47 255.612 1017.17 255.336 1016.96 254.987C1016.75 254.635 1016.65 254.236 1016.65 253.788V249.455H1017.44V253.724C1017.44 254.044 1017.51 254.328 1017.65 254.578C1017.79 254.825 1017.99 255.02 1018.25 255.163C1018.51 255.303 1018.83 255.374 1019.19 255.374C1019.56 255.374 1019.87 255.303 1020.13 255.163C1020.39 255.02 1020.59 254.825 1020.73 254.578C1020.87 254.328 1020.94 254.044 1020.94 253.724V249.455ZM1022.96 250.158V249.455H1027.87V250.158H1025.81V256H1025.02V250.158H1022.96ZM1029.09 256V249.455H1031.31C1031.82 249.455 1032.24 249.547 1032.56 249.733C1032.89 249.916 1033.14 250.164 1033.29 250.477C1033.45 250.79 1033.53 251.14 1033.53 251.526C1033.53 251.911 1033.45 252.262 1033.29 252.577C1033.14 252.892 1032.9 253.144 1032.57 253.331C1032.24 253.517 1031.83 253.609 1031.32 253.609H1029.73V252.906H1031.29C1031.64 252.906 1031.93 252.846 1032.14 252.724C1032.35 252.603 1032.51 252.439 1032.6 252.232C1032.7 252.023 1032.75 251.788 1032.75 251.526C1032.75 251.263 1032.7 251.029 1032.6 250.822C1032.51 250.616 1032.35 250.454 1032.14 250.337C1031.92 250.217 1031.64 250.158 1031.28 250.158H1029.89V256H1029.09ZM1039.1 249.455H1039.89V253.788C1039.89 254.236 1039.79 254.635 1039.58 254.987C1039.37 255.336 1039.07 255.612 1038.69 255.815C1038.31 256.015 1037.86 256.115 1037.35 256.115C1036.84 256.115 1036.39 256.015 1036.01 255.815C1035.63 255.612 1035.33 255.336 1035.12 254.987C1034.91 254.635 1034.81 254.236 1034.81 253.788V249.455H1035.6V253.724C1035.6 254.044 1035.67 254.328 1035.81 254.578C1035.95 254.825 1036.15 255.02 1036.41 255.163C1036.67 255.303 1036.99 255.374 1037.35 255.374C1037.71 255.374 1038.03 255.303 1038.29 255.163C1038.55 255.02 1038.75 254.825 1038.89 254.578C1039.03 254.328 1039.1 254.044 1039.1 253.724V249.455ZM1041.12 250.158V249.455H1046.03V250.158H1043.97V256H1043.18V250.158H1041.12Z"
                        fill="#E4E1E9"
                      />
                      <g filter="url(#filter18_d_375_1247)">
                        <rect
                          x="1007"
                          y="256"
                          width="2"
                          height="1"
                          rx="0.5"
                          fill="url(#paint36_linear_375_1247)"
                          shape-rendering="crispEdges"
                        />
                      </g>
                      <g filter="url(#filter19_d_375_1247)">
                        <rect
                          x="1045"
                          y="247"
                          width="2"
                          height="1"
                          rx="0.5"
                          fill="url(#paint37_linear_375_1247)"
                          shape-rendering="crispEdges"
                        />
                      </g>
                      <g filter="url(#filter20_d_375_1247)">
                        <rect
                          x="1043"
                          y="255"
                          width="2"
                          height="1"
                          rx="0.5"
                          fill="url(#paint38_linear_375_1247)"
                          shape-rendering="crispEdges"
                        />
                      </g>
                    </g>
                    <g opacity="0.4">
                      <g opacity="0.6">
                        <rect
                          x="584"
                          y="324"
                          width="31"
                          height="11"
                          rx="0.5"
                          fill="#232C3F"
                          stroke="url(#paint39_linear_375_1247)"
                          stroke-width="0.5"
                        />
                        <path
                          opacity="0.6"
                          d="M615 326.5H629.5L642.5 339.5H672L681 348.5H689L691.5 351V352"
                          stroke="#212538"
                        />
                        <path
                          opacity="0.6"
                          d="M615 329.5H628L641 342.5H670.5L679.5 351.5H688.5L689.5 352.5"
                          stroke="#212538"
                        />
                        <path opacity="0.6" d="M615 332.5H626.5L639.5 345.5H668.5L677.5 354.5H688.5" stroke="#212538" />
                        <rect
                          x="584"
                          y="339"
                          width="3"
                          height="7"
                          rx="0.5"
                          fill="#232C3F"
                          stroke="url(#paint40_linear_375_1247)"
                          stroke-width="0.5"
                        />
                        <rect
                          x="591"
                          y="339"
                          width="3"
                          height="7"
                          rx="0.5"
                          fill="#232C3F"
                          stroke="url(#paint41_linear_375_1247)"
                          stroke-width="0.5"
                        />
                        <rect
                          x="598"
                          y="339"
                          width="3"
                          height="7"
                          rx="0.5"
                          fill="#232C3F"
                          stroke="url(#paint42_linear_375_1247)"
                          stroke-width="0.5"
                        />
                        <rect
                          x="605"
                          y="339"
                          width="3"
                          height="7"
                          rx="0.5"
                          fill="#232C3F"
                          stroke="url(#paint43_linear_375_1247)"
                          stroke-width="0.5"
                        />
                        <rect
                          x="612"
                          y="339"
                          width="3"
                          height="7"
                          rx="0.5"
                          fill="#232C3F"
                          stroke="url(#paint44_linear_375_1247)"
                          stroke-width="0.5"
                        />
                        <circle cx="691.5" cy="354.5" r="2.5" stroke="#8F9CDA" />
                      </g>
                      <path
                        d="M635.793 365V358.455H638.004C638.516 358.455 638.935 358.542 639.263 358.717C639.592 358.889 639.835 359.127 639.992 359.429C640.15 359.732 640.229 360.076 640.229 360.462C640.229 360.847 640.15 361.189 639.992 361.488C639.835 361.786 639.593 362.02 639.267 362.191C638.941 362.359 638.524 362.443 638.017 362.443H636.227V361.727H637.991C638.341 361.727 638.622 361.676 638.835 361.574C639.05 361.472 639.206 361.327 639.302 361.139C639.4 360.95 639.449 360.724 639.449 360.462C639.449 360.2 639.4 359.971 639.302 359.775C639.204 359.578 639.047 359.427 638.832 359.321C638.617 359.212 638.332 359.158 637.979 359.158H636.585V365H635.793ZM638.874 362.06L640.484 365H639.564L637.979 362.06H638.874ZM641.549 365V358.455H645.474V359.158H642.342V361.369H645.18V362.072H642.342V365H641.549ZM646.717 365V364.425L648.877 362.06C649.131 361.783 649.339 361.542 649.504 361.337C649.668 361.131 649.789 360.937 649.868 360.756C649.949 360.572 649.989 360.381 649.989 360.18C649.989 359.95 649.934 359.751 649.823 359.583C649.714 359.414 649.565 359.284 649.376 359.193C649.186 359.101 648.973 359.055 648.737 359.055C648.485 359.055 648.266 359.108 648.078 359.212C647.893 359.314 647.749 359.458 647.647 359.643C647.547 359.829 647.496 360.046 647.496 360.295H646.742C646.742 359.912 646.831 359.575 647.007 359.286C647.184 358.996 647.425 358.77 647.73 358.608C648.037 358.446 648.381 358.365 648.762 358.365C649.146 358.365 649.485 358.446 649.782 358.608C650.078 358.77 650.31 358.988 650.478 359.263C650.647 359.538 650.731 359.844 650.731 360.18C650.731 360.421 650.687 360.657 650.6 360.887C650.515 361.115 650.365 361.369 650.152 361.651C649.941 361.93 649.648 362.271 649.273 362.673L647.803 364.246V364.297H650.846V365H646.717ZM654.377 365.089C653.956 365.089 653.58 365.017 653.249 364.872C652.921 364.727 652.66 364.526 652.466 364.268C652.275 364.008 652.17 363.707 652.153 363.364H652.958C652.975 363.575 653.048 363.757 653.176 363.91C653.304 364.061 653.471 364.179 653.678 364.262C653.884 364.345 654.113 364.386 654.365 364.386C654.646 364.386 654.895 364.337 655.113 364.239C655.33 364.141 655.5 364.005 655.624 363.83C655.748 363.656 655.809 363.453 655.809 363.223C655.809 362.982 655.75 362.77 655.63 362.587C655.511 362.402 655.336 362.257 655.106 362.152C654.876 362.048 654.595 361.996 654.262 361.996H653.738V361.293H654.262C654.522 361.293 654.75 361.246 654.946 361.152C655.145 361.058 655.299 360.926 655.41 360.756C655.523 360.585 655.579 360.385 655.579 360.155C655.579 359.933 655.53 359.74 655.432 359.576C655.334 359.412 655.196 359.284 655.017 359.193C654.84 359.101 654.631 359.055 654.39 359.055C654.164 359.055 653.951 359.097 653.751 359.18C653.553 359.261 653.391 359.379 653.265 359.535C653.14 359.688 653.071 359.874 653.061 360.091H652.294C652.306 359.748 652.41 359.447 652.604 359.19C652.798 358.93 653.051 358.727 653.364 358.582C653.68 358.437 654.026 358.365 654.403 358.365C654.808 358.365 655.155 358.447 655.445 358.611C655.735 358.773 655.957 358.987 656.113 359.254C656.268 359.52 656.346 359.808 656.346 360.116C656.346 360.485 656.249 360.799 656.055 361.059C655.864 361.319 655.603 361.499 655.272 361.599V361.651C655.686 361.719 656.009 361.895 656.241 362.178C656.473 362.459 656.589 362.808 656.589 363.223C656.589 363.579 656.492 363.898 656.298 364.182C656.107 364.463 655.844 364.685 655.512 364.847C655.18 365.009 654.801 365.089 654.377 365.089ZM658.011 365V358.455H658.804V364.297H661.847V365H658.011Z"
                        fill="#6E6D89"
                      />
                      <circle cx="632" cy="356" r="1" fill="url(#paint45_radial_375_1247)" />
                      <circle cx="632" cy="368" r="1" fill="url(#paint46_radial_375_1247)" />
                      <circle cx="664" cy="356" r="1" fill="url(#paint47_radial_375_1247)" />
                      <circle cx="664" cy="368" r="1" fill="url(#paint48_radial_375_1247)" />
                    </g>
                    <g opacity="0.2">
                      <rect opacity="0.4" x="612.5" y="166.5" width="16" height="16" rx="0.5" stroke="#8F9CDA" />
                      <path opacity="0.6" d="M629 171.5H641L653 159.5H669" stroke="#212538" />
                      <path opacity="0.6" d="M629 174.5H641H643L655 162.5H668.5L669.5 161.5" stroke="#212538" />
                      <path opacity="0.6" d="M612 174.5H557" stroke="#212538" />
                      <path opacity="0.6" d="M629 177.5H641H644.5L656.5 165.5H670L671.5 164V162" stroke="#212538" />
                      <rect
                        x="616"
                        y="170"
                        width="9"
                        height="9"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint49_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="554"
                        y="171"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint50_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="559"
                        y="171"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint51_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="564"
                        y="171"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint52_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="569"
                        y="171"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint53_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="574"
                        y="171"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint54_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="579"
                        y="171"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint55_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="584"
                        y="171"
                        width="7"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint56_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <circle cx="671.5" cy="159.5" r="2.5" stroke="#8F9CDA" />
                      <path d="M585 133.5H593" stroke="#212538" />
                      <rect
                        x="590"
                        y="126"
                        width="16"
                        height="15"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint57_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path opacity="0.6" d="M606 133.5H654L663 142.5L671.5 151V156.5" stroke="#212538" />
                      <path
                        opacity="0.6"
                        d="M543 131.5H513.5L495.5 149.5M543 135.5H515.5L498.5 152.5"
                        stroke="#212538"
                      />
                      <circle cx="495.5" cy="152.5" r="2.5" stroke="#8F9CDA" />
                      <rect
                        x="543"
                        y="126"
                        width="42"
                        height="15"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint58_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="551"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint59_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="551"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint60_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="547"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint61_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="547"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint62_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="555"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint63_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="555"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint64_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="559"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint65_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="559"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint66_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="563"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint67_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="563"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint68_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="567"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint69_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="567"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint70_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="571"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint71_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="571"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint72_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="575"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint73_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="575"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint74_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="579"
                        y="120"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint75_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="579"
                        y="143"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint76_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path
                        d="M504.585 170.455V177H503.793V170.455H504.585ZM511.441 172.5H510.649C510.602 172.272 510.52 172.072 510.403 171.899C510.288 171.727 510.147 171.582 509.981 171.464C509.817 171.345 509.635 171.256 509.434 171.196C509.234 171.136 509.025 171.107 508.808 171.107C508.412 171.107 508.053 171.207 507.731 171.407C507.411 171.607 507.157 171.902 506.967 172.292C506.78 172.682 506.686 173.161 506.686 173.727C506.686 174.294 506.78 174.772 506.967 175.162C507.157 175.552 507.411 175.847 507.731 176.048C508.053 176.248 508.412 176.348 508.808 176.348C509.025 176.348 509.234 176.318 509.434 176.259C509.635 176.199 509.817 176.11 509.981 175.993C510.147 175.874 510.288 175.728 510.403 175.555C510.52 175.381 510.602 175.18 510.649 174.955H511.441C511.382 175.289 511.273 175.588 511.116 175.853C510.958 176.117 510.762 176.342 510.527 176.527C510.293 176.71 510.03 176.85 509.738 176.946C509.448 177.042 509.138 177.089 508.808 177.089C508.25 177.089 507.753 176.953 507.319 176.68C506.884 176.408 506.542 176.02 506.293 175.517C506.043 175.014 505.919 174.418 505.919 173.727C505.919 173.037 506.043 172.44 506.293 171.938C506.542 171.435 506.884 171.047 507.319 170.774C507.753 170.501 508.25 170.365 508.808 170.365C509.138 170.365 509.448 170.413 509.738 170.509C510.03 170.605 510.293 170.745 510.527 170.931C510.762 171.114 510.958 171.338 511.116 171.602C511.273 171.864 511.382 172.163 511.441 172.5ZM512.812 177L515.739 171.209V171.158H512.364V170.455H516.558V171.196L513.643 177H512.812ZM519.782 177.089C519.513 177.085 519.245 177.034 518.976 176.936C518.708 176.838 518.463 176.673 518.241 176.441C518.019 176.206 517.842 175.89 517.707 175.491C517.573 175.091 517.506 174.588 517.506 173.983C517.506 173.403 517.56 172.89 517.669 172.442C517.778 171.993 517.935 171.615 518.142 171.308C518.349 170.999 518.598 170.765 518.89 170.605C519.184 170.445 519.515 170.365 519.884 170.365C520.25 170.365 520.576 170.439 520.862 170.586C521.149 170.73 521.384 170.933 521.565 171.193C521.746 171.453 521.863 171.752 521.916 172.091H521.137C521.064 171.797 520.924 171.553 520.715 171.359C520.506 171.165 520.229 171.068 519.884 171.068C519.377 171.068 518.977 171.289 518.685 171.73C518.396 172.171 518.25 172.79 518.247 173.587H518.299C518.418 173.406 518.56 173.251 518.724 173.123C518.89 172.993 519.073 172.893 519.273 172.823C519.474 172.752 519.686 172.717 519.909 172.717C520.284 172.717 520.627 172.811 520.938 172.999C521.25 173.184 521.499 173.441 521.686 173.769C521.874 174.095 521.968 174.469 521.968 174.891C521.968 175.295 521.877 175.666 521.696 176.003C521.515 176.337 521.26 176.604 520.932 176.802C520.606 176.998 520.223 177.094 519.782 177.089ZM519.782 176.386C520.05 176.386 520.291 176.319 520.504 176.185C520.719 176.051 520.888 175.871 521.012 175.645C521.138 175.419 521.201 175.168 521.201 174.891C521.201 174.62 521.14 174.374 521.018 174.152C520.899 173.929 520.734 173.751 520.523 173.619C520.314 173.487 520.076 173.42 519.807 173.42C519.605 173.42 519.416 173.461 519.241 173.542C519.067 173.621 518.913 173.729 518.781 173.868C518.651 174.006 518.549 174.165 518.474 174.344C518.4 174.521 518.362 174.707 518.362 174.903C518.362 175.163 518.423 175.406 518.545 175.632C518.668 175.858 518.837 176.04 519.05 176.179C519.265 176.317 519.509 176.386 519.782 176.386ZM523.339 177V170.455H524.132V176.297H527.175V177H523.339ZM528.402 177V170.455H529.195V173.702H529.271L532.212 170.455H533.247L530.499 173.408L533.247 177H532.288L530.013 173.957L529.195 174.878V177H528.402Z"
                        fill="#6E6D89"
                      />
                      <circle cx="502" cy="167" r="1" fill="url(#paint77_radial_375_1247)" />
                      <circle cx="502" cy="179" r="1" fill="url(#paint78_radial_375_1247)" />
                      <circle cx="535" cy="167" r="1" fill="url(#paint79_radial_375_1247)" />
                      <circle cx="535" cy="179" r="1" fill="url(#paint80_radial_375_1247)" />
                    </g>
                    <path d="M309 289.5H313" stroke="#212538" />
                    <path
                      d="M248.5 270.5V272.5C248.5 273.605 249.395 274.5 250.5 274.5H300.5C301.605 274.5 302.5 275.395 302.5 276.5V285"
                      stroke="#212538"
                    />
                    <circle cx="248.5" cy="267.5" r="2.5" stroke="#8F9CDA" />
                    <rect
                      x="271"
                      y="265"
                      width="4"
                      height="20"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint81_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="265"
                      y="265"
                      width="4"
                      height="20"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint82_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="277"
                      y="265"
                      width="4"
                      height="20"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint83_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="283"
                      y="265"
                      width="4"
                      height="20"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint84_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="289"
                      y="265"
                      width="4"
                      height="20"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint85_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="296"
                      y="285"
                      width="13"
                      height="9"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint86_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <path
                      d="M318.5 289.5H320.5C321.052 289.5 321.5 289.052 321.5 288.5V273.914C321.5 273.649 321.605 273.395 321.793 273.207L326.207 268.793C326.395 268.605 326.5 268.351 326.5 268.086V259"
                      stroke="#212538"
                    />
                    <path
                      d="M317.5 287.5L318.207 286.793C318.395 286.605 318.5 286.351 318.5 286.086V272.914C318.5 272.649 318.605 272.395 318.793 272.207L323.207 267.793C323.395 267.605 323.5 267.351 323.5 267.086V259"
                      stroke="#212538"
                    />
                    <path
                      d="M315.5 287V271.914C315.5 271.649 315.605 271.395 315.793 271.207L320.207 266.793C320.395 266.605 320.5 266.351 320.5 266.086V259"
                      stroke="#212538"
                    />
                    <circle cx="315.5" cy="289.5" r="2.5" stroke="#8F9CDA" />
                    <rect
                      opacity="0.4"
                      x="329.5"
                      y="211.5"
                      width="36"
                      height="16"
                      rx="0.5"
                      stroke="url(#paint87_linear_375_1247)"
                    />
                    <rect
                      x="333"
                      y="215"
                      width="29"
                      height="9"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint88_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <circle cx="367" cy="241" r="1" fill="url(#paint89_radial_375_1247)" />
                    <circle cx="367" cy="245" r="1" fill="url(#paint90_radial_375_1247)" />
                    <circle cx="371" cy="237" r="1" fill="url(#paint91_radial_375_1247)" />
                    <circle cx="367" cy="237" r="1" fill="url(#paint92_radial_375_1247)" />
                    <circle cx="371" cy="241" r="1" fill="url(#paint93_radial_375_1247)" />
                    <circle cx="371" cy="245" r="1" fill="url(#paint94_radial_375_1247)" />
                    <circle cx="375" cy="237" r="1" fill="url(#paint95_radial_375_1247)" />
                    <circle cx="379" cy="237" r="1" fill="url(#paint96_radial_375_1247)" />
                    <circle cx="375" cy="241" r="1" fill="url(#paint97_radial_375_1247)" />
                    <circle cx="379" cy="241" r="1" fill="url(#paint98_radial_375_1247)" />
                    <circle cx="375" cy="245" r="1" fill="url(#paint99_radial_375_1247)" />
                    <circle cx="379" cy="245" r="1" fill="url(#paint100_radial_375_1247)" />
                    <path
                      d="M344.5 228V230.586C344.5 230.851 344.395 231.105 344.207 231.293L340.293 235.207C340.105 235.395 339.851 235.5 339.586 235.5H326.914C326.649 235.5 326.395 235.605 326.207 235.793L317 245"
                      stroke="#212538"
                    />
                    <path
                      d="M347.5 228V232.086C347.5 232.351 347.395 232.605 347.207 232.793L341.793 238.207C341.605 238.395 341.351 238.5 341.086 238.5H327.914C327.649 238.5 327.395 238.605 327.207 238.793L321 245"
                      stroke="#212538"
                    />
                    <path
                      d="M350.5 228V233.586C350.5 233.851 350.395 234.105 350.207 234.293L343.293 241.207C343.105 241.395 342.851 241.5 342.586 241.5H328.914C328.649 241.5 328.395 241.605 328.207 241.793L325 245"
                      stroke="#212538"
                    />
                    <g filter="url(#filter21_d_375_1247)">
                      <rect x="301" y="245" width="45" height="15" rx="3" fill="#232C3F" shape-rendering="crispEdges" />
                      <rect
                        x="301.5"
                        y="245.5"
                        width="44"
                        height="14"
                        rx="2.5"
                        stroke="url(#paint101_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                      <path
                        d="M305.435 250.158V249.455H310.344V250.158H308.286V256H307.493V250.158H305.435ZM316.817 252.727C316.817 253.418 316.693 254.014 316.443 254.517C316.194 255.02 315.852 255.408 315.417 255.68C314.983 255.953 314.486 256.089 313.928 256.089C313.37 256.089 312.873 255.953 312.439 255.68C312.004 255.408 311.662 255.02 311.413 254.517C311.164 254.014 311.039 253.418 311.039 252.727C311.039 252.037 311.164 251.44 311.413 250.938C311.662 250.435 312.004 250.047 312.439 249.774C312.873 249.501 313.37 249.365 313.928 249.365C314.486 249.365 314.983 249.501 315.417 249.774C315.852 250.047 316.194 250.435 316.443 250.938C316.693 251.44 316.817 252.037 316.817 252.727ZM316.05 252.727C316.05 252.161 315.955 251.682 315.766 251.292C315.578 250.902 315.324 250.607 315.002 250.407C314.682 250.207 314.324 250.107 313.928 250.107C313.532 250.107 313.173 250.207 312.851 250.407C312.531 250.607 312.277 250.902 312.087 251.292C311.9 251.682 311.806 252.161 311.806 252.727C311.806 253.294 311.9 253.772 312.087 254.162C312.277 254.552 312.531 254.847 312.851 255.048C313.173 255.248 313.532 255.348 313.928 255.348C314.324 255.348 314.682 255.248 315.002 255.048C315.324 254.847 315.578 254.552 315.766 254.162C315.955 253.772 316.05 253.294 316.05 252.727ZM318.15 256V249.455H318.943V252.702H319.019L321.96 249.455H322.995L320.247 252.408L322.995 256H322.036L319.761 252.957L318.943 253.878V256H318.15ZM324.021 256V249.455H327.971V250.158H324.814V252.369H327.767V253.072H324.814V255.297H328.023V256H324.021ZM334.59 249.455V256H333.823L330.257 250.861H330.193V256H329.4V249.455H330.167L333.747 254.607H333.811V249.455H334.59ZM339.756 251.091C339.718 250.767 339.562 250.516 339.289 250.337C339.017 250.158 338.682 250.068 338.286 250.068C337.996 250.068 337.742 250.115 337.525 250.209C337.31 250.303 337.142 250.431 337.02 250.596C336.901 250.76 336.841 250.946 336.841 251.155C336.841 251.33 336.883 251.48 336.966 251.605C337.051 251.729 337.16 251.832 337.292 251.915C337.424 251.996 337.562 252.064 337.707 252.117C337.852 252.168 337.985 252.21 338.107 252.241L338.772 252.42C338.942 252.465 339.132 252.527 339.34 252.606C339.551 252.685 339.753 252.792 339.945 252.929C340.138 253.063 340.298 253.235 340.424 253.446C340.55 253.657 340.612 253.916 340.612 254.223C340.612 254.577 340.52 254.896 340.334 255.182C340.151 255.467 339.883 255.694 339.529 255.863C339.177 256.031 338.75 256.115 338.247 256.115C337.779 256.115 337.373 256.039 337.03 255.888C336.689 255.737 336.42 255.526 336.224 255.255C336.03 254.985 335.921 254.67 335.895 254.312H336.713C336.735 254.56 336.818 254.764 336.963 254.926C337.11 255.086 337.295 255.205 337.519 255.284C337.745 255.361 337.987 255.399 338.247 255.399C338.55 255.399 338.822 255.35 339.062 255.252C339.303 255.152 339.494 255.013 339.634 254.837C339.775 254.658 339.845 254.449 339.845 254.21C339.845 253.993 339.785 253.816 339.663 253.68C339.542 253.543 339.382 253.433 339.184 253.347C338.986 253.262 338.772 253.187 338.541 253.124L337.736 252.893C337.225 252.746 336.82 252.537 336.522 252.264C336.223 251.991 336.074 251.634 336.074 251.193C336.074 250.827 336.173 250.507 336.371 250.234C336.572 249.96 336.84 249.746 337.177 249.595C337.516 249.442 337.894 249.365 338.311 249.365C338.733 249.365 339.108 249.441 339.436 249.592C339.764 249.741 340.024 249.946 340.216 250.206C340.41 250.466 340.512 250.761 340.523 251.091H339.756Z"
                        fill="#D0DAF8"
                      />
                    </g>
                    <g opacity="0.4">
                      <path
                        d="M417.5 306.5H423.5H438.5L457.5 287.5V283M416.5 305.5L418.5 303.5H437.5L454.5 286.5V283"
                        stroke="#212538"
                      />
                      <path d="M347 351.5H357L399 309.5H409.5H411H412L413 308.5" stroke="#212538" />
                      <path
                        opacity="0.6"
                        d="M303 348.5H258.328C257.798 348.5 257.289 348.289 256.914 347.914L238.086 329.086C237.711 328.711 237.202 328.5 236.672 328.5H231.5"
                        stroke="#212538"
                      />
                      <path
                        opacity="0.6"
                        d="M303 351.5H256.828C256.298 351.5 255.789 351.289 255.414 350.914L236.586 332.086C236.211 331.711 235.702 331.5 235.172 331.5H231.5L230.5 330.5"
                        stroke="#212538"
                      />
                      <rect
                        x="303"
                        y="346"
                        width="44"
                        height="8"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint102_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path d="M347 348.5H355.5L397.5 306.5L412 306.5" stroke="#212538" />
                      <rect
                        x="308"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint103_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="308"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint104_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="312"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint105_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="312"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint106_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="316"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint107_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="316"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint108_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="320"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint109_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="320"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint110_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="324"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint111_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="324"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint112_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="328"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint113_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="328"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint114_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="332"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint115_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="332"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint116_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="336"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint117_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="336"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint118_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="340"
                        y="340"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint119_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="340"
                        y="356"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint120_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <circle cx="228.5" cy="328.5" r="2.5" stroke="#8F9CDA" />
                      <circle cx="414.5" cy="306.5" r="2.5" stroke="#8F9CDA" />
                      <rect
                        x="438"
                        y="272"
                        width="34"
                        height="11"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint121_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="399"
                        y="272"
                        width="4"
                        height="11"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint122_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="405"
                        y="272"
                        width="4"
                        height="11"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint123_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="411"
                        y="272"
                        width="4"
                        height="11"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint124_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="417"
                        y="272"
                        width="4"
                        height="11"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint125_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <circle cx="417" cy="350" r="1" fill="url(#paint126_radial_375_1247)" />
                      <path
                        d="M324.061 328H323.23L325.634 321.455H326.452L328.855 328H328.024L326.068 322.49H326.017L324.061 328ZM324.368 325.443H327.717V326.146H324.368V325.443ZM334.834 323.5H334.041C333.995 323.272 333.913 323.072 333.795 322.899C333.68 322.727 333.54 322.582 333.373 322.464C333.209 322.345 333.027 322.256 332.827 322.196C332.627 322.136 332.418 322.107 332.201 322.107C331.804 322.107 331.445 322.207 331.123 322.407C330.804 322.607 330.549 322.902 330.36 323.292C330.172 323.682 330.078 324.161 330.078 324.727C330.078 325.294 330.172 325.772 330.36 326.162C330.549 326.552 330.804 326.847 331.123 327.048C331.445 327.248 331.804 327.348 332.201 327.348C332.418 327.348 332.627 327.318 332.827 327.259C333.027 327.199 333.209 327.11 333.373 326.993C333.54 326.874 333.68 326.728 333.795 326.555C333.913 326.381 333.995 326.18 334.041 325.955H334.834C334.774 326.289 334.666 326.588 334.508 326.853C334.35 327.117 334.154 327.342 333.92 327.527C333.686 327.71 333.422 327.85 333.131 327.946C332.841 328.042 332.531 328.089 332.201 328.089C331.642 328.089 331.146 327.953 330.711 327.68C330.277 327.408 329.935 327.02 329.685 326.517C329.436 326.014 329.311 325.418 329.311 324.727C329.311 324.037 329.436 323.44 329.685 322.938C329.935 322.435 330.277 322.047 330.711 321.774C331.146 321.501 331.642 321.365 332.201 321.365C332.531 321.365 332.841 321.413 333.131 321.509C333.422 321.605 333.686 321.745 333.92 321.931C334.154 322.114 334.35 322.338 334.508 322.602C334.666 322.864 334.774 323.163 334.834 323.5ZM336.562 328.051C336.405 328.051 336.269 327.995 336.156 327.882C336.044 327.769 335.987 327.634 335.987 327.476C335.987 327.318 336.044 327.183 336.156 327.07C336.269 326.957 336.405 326.901 336.562 326.901C336.72 326.901 336.855 326.957 336.968 327.07C337.081 327.183 337.138 327.318 337.138 327.476C337.138 327.58 337.111 327.676 337.058 327.763C337.007 327.851 336.937 327.921 336.85 327.974C336.765 328.026 336.669 328.051 336.562 328.051ZM338.551 328L341.479 322.209V322.158H338.104V321.455H342.297V322.196L339.382 328H338.551ZM345.484 321.365C345.752 321.367 346.021 321.418 346.289 321.518C346.558 321.619 346.803 321.785 347.025 322.017C347.246 322.247 347.424 322.561 347.558 322.96C347.692 323.358 347.76 323.858 347.76 324.459C347.76 325.04 347.704 325.557 347.593 326.009C347.485 326.458 347.327 326.838 347.12 327.147C346.916 327.456 346.667 327.69 346.373 327.85C346.081 328.01 345.75 328.089 345.382 328.089C345.015 328.089 344.688 328.017 344.401 327.872C344.115 327.725 343.881 327.522 343.697 327.262C343.516 327 343.4 326.696 343.349 326.351H344.129C344.199 326.651 344.339 326.9 344.548 327.096C344.759 327.289 345.037 327.386 345.382 327.386C345.887 327.386 346.285 327.166 346.577 326.725C346.871 326.284 347.018 325.661 347.018 324.855H346.967C346.848 325.034 346.706 325.189 346.542 325.319C346.378 325.449 346.196 325.549 345.995 325.619C345.795 325.689 345.582 325.724 345.356 325.724C344.981 325.724 344.637 325.632 344.324 325.446C344.013 325.259 343.763 325.002 343.576 324.676C343.391 324.348 343.298 323.973 343.298 323.551C343.298 323.151 343.387 322.784 343.566 322.452C343.748 322.117 344.001 321.851 344.327 321.653C344.655 321.455 345.041 321.359 345.484 321.365ZM345.484 322.068C345.216 322.068 344.974 322.135 344.759 322.27C344.545 322.402 344.376 322.581 344.25 322.806C344.127 323.03 344.065 323.278 344.065 323.551C344.065 323.824 344.125 324.072 344.244 324.296C344.365 324.517 344.531 324.694 344.739 324.826C344.95 324.956 345.19 325.021 345.458 325.021C345.661 325.021 345.849 324.982 346.024 324.903C346.199 324.822 346.351 324.712 346.481 324.574C346.613 324.433 346.717 324.275 346.791 324.098C346.866 323.919 346.903 323.732 346.903 323.538C346.903 323.283 346.841 323.043 346.718 322.819C346.596 322.596 346.428 322.414 346.213 322.276C346 322.137 345.757 322.068 345.484 322.068ZM349.131 328V321.455H349.924V327.297H352.967V328H349.131Z"
                        fill="#6E6D89"
                      />
                      <circle cx="322" cy="318" r="1" fill="url(#paint127_radial_375_1247)" />
                      <circle cx="322" cy="330" r="1" fill="url(#paint128_radial_375_1247)" />
                      <circle cx="355" cy="318" r="1" fill="url(#paint129_radial_375_1247)" />
                      <circle cx="355" cy="330" r="1" fill="url(#paint130_radial_375_1247)" />
                      <circle cx="424" cy="350" r="1" fill="url(#paint131_radial_375_1247)" />
                    </g>
                    <g opacity="0.4">
                      <rect
                        opacity="0.4"
                        x="255.5"
                        y="196.5"
                        width="16"
                        height="16"
                        rx="0.5"
                        stroke="url(#paint132_linear_375_1247)"
                      />
                      <rect
                        x="259"
                        y="200"
                        width="9"
                        height="9"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint133_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="356"
                        y="167"
                        width="3"
                        height="6"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint134_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="353"
                        y="169"
                        width="1"
                        height="2"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint135_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="361"
                        y="169"
                        width="1"
                        height="2"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint136_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="343"
                        y="167"
                        width="3"
                        height="6"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint137_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="340"
                        y="169"
                        width="1"
                        height="2"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint138_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="348"
                        y="169"
                        width="1"
                        height="2"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint139_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="369"
                        y="167"
                        width="3"
                        height="6"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint140_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="366"
                        y="169"
                        width="1"
                        height="2"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint141_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="374"
                        y="169"
                        width="1"
                        height="2"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint142_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="262"
                        y="190"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint143_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="262"
                        y="216"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint144_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="249"
                        y="203"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint145_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path
                        opacity="0.6"
                        d="M272 202.5H283.672C284.202 202.5 284.711 202.289 285.086 201.914L307.914 179.086C308.289 178.711 308.798 178.5 309.328 178.5H338.172C338.702 178.5 339.211 178.289 339.586 177.914L344.5 173"
                        stroke="#212538"
                      />
                      <path
                        opacity="0.6"
                        d="M272 204.5H284.672C285.202 204.5 285.711 204.289 286.086 203.914L308.914 181.086C309.289 180.711 309.798 180.5 310.328 180.5H349.172C349.702 180.5 350.211 180.289 350.586 179.914L357.5 173"
                        stroke="#212538"
                      />
                      <path
                        opacity="0.6"
                        d="M272 206.5H285.672C286.202 206.5 286.711 206.289 287.086 205.914L309.914 183.086C310.289 182.711 310.798 182.5 311.328 182.5H360.672C361.202 182.5 361.711 182.289 362.086 181.914L370.5 173.5"
                        stroke="#212538"
                      />
                    </g>
                    <g opacity="0.4">
                      <rect
                        opacity="0.4"
                        x="970.5"
                        y="385.5"
                        width="16"
                        height="16"
                        rx="0.5"
                        transform="rotate(-180 970.5 385.5)"
                        stroke="url(#paint146_linear_375_1247)"
                      />
                      <rect
                        x="967"
                        y="382"
                        width="9"
                        height="9"
                        rx="0.5"
                        transform="rotate(-180 967 382)"
                        fill="#232C3F"
                        stroke="url(#paint147_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="870"
                        y="415"
                        width="3"
                        height="6"
                        rx="0.5"
                        transform="rotate(-180 870 415)"
                        fill="#232C3F"
                        stroke="url(#paint148_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="873"
                        y="413"
                        width="1"
                        height="2"
                        rx="0.5"
                        transform="rotate(-180 873 413)"
                        fill="#232C3F"
                        stroke="url(#paint149_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="865"
                        y="413"
                        width="1"
                        height="2"
                        rx="0.5"
                        transform="rotate(-180 865 413)"
                        fill="#232C3F"
                        stroke="url(#paint150_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="883"
                        y="415"
                        width="3"
                        height="6"
                        rx="0.5"
                        transform="rotate(-180 883 415)"
                        fill="#232C3F"
                        stroke="url(#paint151_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="886"
                        y="413"
                        width="1"
                        height="2"
                        rx="0.5"
                        transform="rotate(-180 886 413)"
                        fill="#232C3F"
                        stroke="url(#paint152_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="878"
                        y="413"
                        width="1"
                        height="2"
                        rx="0.5"
                        transform="rotate(-180 878 413)"
                        fill="#232C3F"
                        stroke="url(#paint153_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="857"
                        y="415"
                        width="3"
                        height="6"
                        rx="0.5"
                        transform="rotate(-180 857 415)"
                        fill="#232C3F"
                        stroke="url(#paint154_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="860"
                        y="413"
                        width="1"
                        height="2"
                        rx="0.5"
                        transform="rotate(-180 860 413)"
                        fill="#232C3F"
                        stroke="url(#paint155_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="852"
                        y="413"
                        width="1"
                        height="2"
                        rx="0.5"
                        transform="rotate(-180 852 413)"
                        fill="#232C3F"
                        stroke="url(#paint156_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="964"
                        y="392"
                        width="3"
                        height="3"
                        rx="0.5"
                        transform="rotate(-180 964 392)"
                        fill="#232C3F"
                        stroke="url(#paint157_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="964"
                        y="366"
                        width="3"
                        height="3"
                        rx="0.5"
                        transform="rotate(-180 964 366)"
                        fill="#232C3F"
                        stroke="url(#paint158_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="977"
                        y="379"
                        width="3"
                        height="3"
                        rx="0.5"
                        transform="rotate(-180 977 379)"
                        fill="#232C3F"
                        stroke="url(#paint159_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path
                        opacity="0.6"
                        d="M954 379.5L942.328 379.5C941.798 379.5 941.289 379.711 940.914 380.086L918.086 402.914C917.711 403.289 917.202 403.5 916.672 403.5L887.828 403.5C887.298 403.5 886.789 403.711 886.414 404.086L881.5 409"
                        stroke="#212538"
                      />
                      <path
                        opacity="0.6"
                        d="M954 377.5L941.328 377.5C940.798 377.5 940.289 377.711 939.914 378.086L917.086 400.914C916.711 401.289 916.202 401.5 915.672 401.5L876.828 401.5C876.298 401.5 875.789 401.711 875.414 402.086L868.5 409"
                        stroke="#212538"
                      />
                      <path
                        opacity="0.6"
                        d="M954 375.5L940.328 375.5C939.798 375.5 939.289 375.711 938.914 376.086L916.086 398.914C915.711 399.289 915.202 399.5 914.672 399.5L865.328 399.5C864.798 399.5 864.289 399.711 863.914 400.086L855.5 408.5"
                        stroke="#212538"
                      />
                    </g>
                    <rect
                      x="639"
                      y="283"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint160_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="639"
                      y="217"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint161_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="645"
                      y="283"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint162_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="645"
                      y="217"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint163_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="651"
                      y="283"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint164_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="651"
                      y="217"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint165_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="657"
                      y="283"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint166_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="657"
                      y="217"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint167_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="663"
                      y="283"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint168_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="663"
                      y="217"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint169_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="669"
                      y="283"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint170_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="669"
                      y="217"
                      width="3"
                      height="5"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint171_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="626"
                      y="236"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 626 236)"
                      fill="#232C3F"
                      stroke="url(#paint172_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="692"
                      y="236"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 692 236)"
                      fill="#232C3F"
                      stroke="url(#paint173_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="626"
                      y="242"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 626 242)"
                      fill="#232C3F"
                      stroke="url(#paint174_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="692"
                      y="242"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 692 242)"
                      fill="#232C3F"
                      stroke="url(#paint175_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="626"
                      y="248"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 626 248)"
                      fill="#232C3F"
                      stroke="url(#paint176_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="692"
                      y="248"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 692 248)"
                      fill="#232C3F"
                      stroke="url(#paint177_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="626"
                      y="254"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 626 254)"
                      fill="#232C3F"
                      stroke="url(#paint178_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="692"
                      y="254"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 692 254)"
                      fill="#232C3F"
                      stroke="url(#paint179_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="626"
                      y="260"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 626 260)"
                      fill="#232C3F"
                      stroke="url(#paint180_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="692"
                      y="260"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 692 260)"
                      fill="#232C3F"
                      stroke="url(#paint181_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="626"
                      y="266"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 626 266)"
                      fill="#232C3F"
                      stroke="url(#paint182_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="692"
                      y="266"
                      width="3"
                      height="5"
                      rx="0.5"
                      transform="rotate(90 692 266)"
                      fill="#232C3F"
                      stroke="url(#paint183_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect opacity="0.4" x="633.5" y="229.5" width="46" height="46" rx="0.5" stroke="#212538" />
                    <rect
                      x="637"
                      y="233"
                      width="39"
                      height="39"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint184_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <path
                      d="M646.585 261.455V268H645.793V261.455H646.585ZM653.697 264.727C653.697 265.418 653.573 266.014 653.323 266.517C653.074 267.02 652.732 267.408 652.297 267.68C651.863 267.953 651.366 268.089 650.808 268.089C650.25 268.089 649.753 267.953 649.319 267.68C648.884 267.408 648.542 267.02 648.293 266.517C648.043 266.014 647.919 265.418 647.919 264.727C647.919 264.037 648.043 263.44 648.293 262.938C648.542 262.435 648.884 262.047 649.319 261.774C649.753 261.501 650.25 261.365 650.808 261.365C651.366 261.365 651.863 261.501 652.297 261.774C652.732 262.047 653.074 262.435 653.323 262.938C653.573 263.44 653.697 264.037 653.697 264.727ZM652.93 264.727C652.93 264.161 652.835 263.682 652.646 263.292C652.458 262.902 652.204 262.607 651.882 262.407C651.562 262.207 651.204 262.107 650.808 262.107C650.412 262.107 650.053 262.207 649.731 262.407C649.411 262.607 649.157 262.902 648.967 263.292C648.78 263.682 648.686 264.161 648.686 264.727C648.686 265.294 648.78 265.772 648.967 266.162C649.157 266.552 649.411 266.847 649.731 267.048C650.053 267.248 650.412 267.348 650.808 267.348C651.204 267.348 651.562 267.248 651.882 267.048C652.204 266.847 652.458 266.552 652.646 266.162C652.835 265.772 652.93 265.294 652.93 264.727ZM654.915 268V267.425L657.075 265.06C657.329 264.783 657.538 264.542 657.702 264.337C657.866 264.131 657.987 263.937 658.066 263.756C658.147 263.572 658.188 263.381 658.188 263.18C658.188 262.95 658.132 262.751 658.021 262.583C657.913 262.414 657.764 262.284 657.574 262.193C657.384 262.101 657.171 262.055 656.935 262.055C656.683 262.055 656.464 262.108 656.276 262.212C656.091 262.314 655.947 262.458 655.845 262.643C655.745 262.829 655.695 263.046 655.695 263.295H654.94C654.94 262.912 655.029 262.575 655.206 262.286C655.383 261.996 655.623 261.77 655.928 261.608C656.235 261.446 656.579 261.365 656.96 261.365C657.344 261.365 657.684 261.446 657.98 261.608C658.276 261.77 658.508 261.988 658.677 262.263C658.845 262.538 658.929 262.844 658.929 263.18C658.929 263.421 658.885 263.657 658.798 263.887C658.713 264.115 658.564 264.369 658.351 264.651C658.14 264.93 657.847 265.271 657.472 265.673L656.002 267.246V267.297H659.044V268H654.915ZM662.41 268.089C662.035 268.089 661.697 268.015 661.396 267.866C661.096 267.717 660.855 267.512 660.674 267.252C660.493 266.992 660.394 266.696 660.377 266.364H661.144C661.174 266.66 661.308 266.905 661.547 267.099C661.787 267.29 662.075 267.386 662.41 267.386C662.678 267.386 662.917 267.324 663.125 267.198C663.336 267.072 663.502 266.9 663.621 266.68C663.742 266.458 663.803 266.208 663.803 265.929C663.803 265.643 663.74 265.389 663.614 265.165C663.491 264.939 663.32 264.761 663.103 264.631C662.886 264.501 662.638 264.435 662.358 264.433C662.158 264.431 661.953 264.462 661.742 264.526C661.531 264.588 661.357 264.668 661.221 264.766L660.479 264.676L660.875 261.455H664.276V262.158H661.54L661.31 264.088H661.348C661.483 263.982 661.651 263.893 661.853 263.823C662.056 263.752 662.267 263.717 662.486 263.717C662.887 263.717 663.244 263.813 663.557 264.005C663.872 264.195 664.119 264.455 664.298 264.785C664.48 265.115 664.57 265.492 664.57 265.916C664.57 266.334 664.476 266.707 664.289 267.035C664.103 267.361 663.848 267.619 663.522 267.808C663.196 267.996 662.825 268.089 662.41 268.089Z"
                      fill="#495B71"
                    />
                    <rect
                      x="635"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint185_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="635"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint186_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="641"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint187_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="641"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint188_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="647"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint189_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="647"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint190_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="653"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint191_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="653"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint192_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="659"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint193_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="659"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint194_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="665"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint195_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="665"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint196_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="671"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint197_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="671"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint198_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="677"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint199_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="677"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint200_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="638"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint201_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="638"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint202_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="644"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint203_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="644"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint204_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="650"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint205_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="650"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint206_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="656"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint207_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="656"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint208_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="662"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint209_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="662"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint210_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="668"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint211_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="668"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint212_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="674"
                      y="277"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint213_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="231"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 231)"
                      fill="#232C3F"
                      stroke="url(#paint214_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="237"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 237)"
                      fill="#232C3F"
                      stroke="url(#paint215_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="243"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 243)"
                      fill="#232C3F"
                      stroke="url(#paint216_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="249"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 249)"
                      fill="#232C3F"
                      stroke="url(#paint217_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="255"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 255)"
                      fill="#232C3F"
                      stroke="url(#paint218_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="261"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 261)"
                      fill="#232C3F"
                      stroke="url(#paint219_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="267"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 267)"
                      fill="#232C3F"
                      stroke="url(#paint220_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="273"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 273)"
                      fill="#232C3F"
                      stroke="url(#paint221_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="234"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 234)"
                      fill="#232C3F"
                      stroke="url(#paint222_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="240"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 240)"
                      fill="#232C3F"
                      stroke="url(#paint223_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="246"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 246)"
                      fill="#232C3F"
                      stroke="url(#paint224_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="252"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 252)"
                      fill="#232C3F"
                      stroke="url(#paint225_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="258"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 258)"
                      fill="#232C3F"
                      stroke="url(#paint226_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="264"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 264)"
                      fill="#232C3F"
                      stroke="url(#paint227_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="632"
                      y="270"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(90 632 270)"
                      fill="#232C3F"
                      stroke="url(#paint228_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="674"
                      y="225"
                      width="1"
                      height="3"
                      rx="0.5"
                      fill="#232C3F"
                      stroke="url(#paint229_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="274"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 274)"
                      fill="#232C3F"
                      stroke="url(#paint230_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="268"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 268)"
                      fill="#232C3F"
                      stroke="url(#paint231_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="262"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 262)"
                      fill="#232C3F"
                      stroke="url(#paint232_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="256"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 256)"
                      fill="#232C3F"
                      stroke="url(#paint233_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="250"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 250)"
                      fill="#232C3F"
                      stroke="url(#paint234_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="244"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 244)"
                      fill="#232C3F"
                      stroke="url(#paint235_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="238"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 238)"
                      fill="#232C3F"
                      stroke="url(#paint236_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="232"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 232)"
                      fill="#232C3F"
                      stroke="url(#paint237_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="271"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 271)"
                      fill="#232C3F"
                      stroke="url(#paint238_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="265"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 265)"
                      fill="#232C3F"
                      stroke="url(#paint239_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="259"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 259)"
                      fill="#232C3F"
                      stroke="url(#paint240_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="253"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 253)"
                      fill="#232C3F"
                      stroke="url(#paint241_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <g filter="url(#filter22_dddii_375_1247)">
                      <circle cx="199.5" cy="252.5" r="30.5" fill="#232C3F" />
                      <circle cx="199.5" cy="252.5" r="30" stroke="url(#paint242_linear_375_1247)" />
                    </g>
                    <g filter="url(#filter23_di_375_1247)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M192.084 238H185.222L196.069 252.5L185.222 267H192.084L199.5 257.087L202.931 252.5L199.5 247.913L192.084 238ZM213.778 238L204.481 250.428L201.05 245.842L206.916 238H213.778ZM204.481 254.571L201.05 259.158L206.916 267H213.778L204.481 254.571Z"
                        fill="#716CFF"
                      />
                    </g>
                    <g filter="url(#filter24_f_375_1247)">
                      <path
                        d="M220.488 242.379C224.459 251.323 223.232 262.121 219 264C214.768 265.879 215.971 254.944 212 246C208.029 237.056 199.768 232.379 204 230.5C208.232 228.621 216.517 233.434 220.488 242.379Z"
                        fill="#8F9CDA"
                      />
                    </g>
                    <g filter="url(#filter25_f_375_1247)">
                      <path
                        d="M217.645 244.701C219.854 249.993 219.526 256.112 217.71 256.87C215.895 257.628 216.085 251.686 213.875 246.394C211.666 241.103 208.414 236.967 210.229 236.209C212.045 235.451 215.436 239.41 217.645 244.701Z"
                        fill="#FFFEF9"
                      />
                    </g>
                    <g filter="url(#filter26_f_375_1247)">
                      <path
                        d="M180.061 265.709C182.828 270.05 191.457 275.788 193.346 274.514C195.234 273.24 188.958 269.356 184.715 263.067C180.473 256.778 179.872 250.466 177.983 251.74C176.095 253.013 177.294 261.367 180.061 265.709Z"
                        fill="#8F9CDA"
                      />
                    </g>
                    <g filter="url(#filter27_f_375_1247)">
                      <circle cx="199.5" cy="252.5" r="1.5" fill="#EFEFC2" />
                    </g>
                    <rect
                      x="681"
                      y="247"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 247)"
                      fill="#232C3F"
                      stroke="url(#paint243_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="241"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 241)"
                      fill="#232C3F"
                      stroke="url(#paint244_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <rect
                      x="681"
                      y="235"
                      width="1"
                      height="3"
                      rx="0.5"
                      transform="rotate(-90 681 235)"
                      fill="#232C3F"
                      stroke="url(#paint245_linear_375_1247)"
                      stroke-width="0.5"
                    />
                    <g opacity="0.2">
                      <path opacity="0.6" d="M920.5 143.5H851.5H764.5L739 169L739 181.5" stroke="#212538" />
                      <rect
                        x="904.5"
                        y="136"
                        width="16"
                        height="15"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint246_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path
                        d="M914 149V147C914.07 146.374 913.89 145.745 913.5 145.25C915 145.25 916.5 144.25 916.5 142.5C916.54 141.875 916.365 141.26 916 140.75C916.14 140.175 916.14 139.575 916 139C916 139 915.5 139 914.5 139.75C913.18 139.5 911.82 139.5 910.5 139.75C909.5 139 909 139 909 139C908.85 139.575 908.85 140.175 909 140.75C908.636 141.258 908.459 141.876 908.5 142.5C908.5 144.25 910 145.25 911.5 145.25C911.305 145.495 911.16 145.775 911.075 146.075C910.99 146.375 910.965 146.69 911 147V149"
                        stroke="#6E6D89"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M911 147C908.745 148 908.5 146 907.5 146"
                        stroke="#6E6D89"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <rect
                        x="857.5"
                        y="136"
                        width="42"
                        height="15"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint247_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="865.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint248_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="865.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint249_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="861.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint250_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="861.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint251_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="869.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint252_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="869.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint253_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="873.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint254_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="873.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint255_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="877.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint256_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="877.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint257_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="881.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint258_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="881.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint259_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="885.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint260_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="885.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint261_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="889.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint262_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="889.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint263_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="893.5"
                        y="130"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint264_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="893.5"
                        y="153"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint265_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path opacity="0.6" d="M857.5 138.5H851.5H762.5L734 167V181.5" stroke="#212538" />
                      <path opacity="0.6" d="M857.5 148.5H851.5L766.5 148.5L744 171V181.5" stroke="#212538" />
                    </g>
                    <g opacity="0.4">
                      <rect opacity="0.4" x="834.5" y="277.5" width="16" height="16" rx="0.5" stroke="#8F9CDA" />
                      <path opacity="0.6" d="M851 282.5H863L875 270.5H891" stroke="#212538" />
                      <path opacity="0.6" d="M851 285.5H863H865L877 273.5H890.5L891.5 272.5" stroke="#212538" />
                      <path opacity="0.6" d="M834 285.5H779" stroke="#212538" />
                      <path opacity="0.6" d="M851 288.5H863H866.5L878.5 276.5H892L893.5 275V273" stroke="#212538" />
                      <rect
                        x="838"
                        y="281"
                        width="9"
                        height="9"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint266_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="776"
                        y="282"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint267_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="781"
                        y="282"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint268_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="786"
                        y="282"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint269_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="791"
                        y="282"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint270_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="796"
                        y="282"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint271_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="801"
                        y="282"
                        width="3"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint272_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="806"
                        y="282"
                        width="7"
                        height="7"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint273_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <circle cx="893.5" cy="270.5" r="2.5" stroke="#8F9CDA" />
                      <path d="M807 244.5H815" stroke="#212538" />
                      <rect
                        x="812"
                        y="237"
                        width="16"
                        height="15"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint274_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path opacity="0.6" d="M828 244.5H876L885 253.5L893.5 262V267.5" stroke="#212538" />
                      <path
                        opacity="0.6"
                        d="M765 242.5H735.5L717.5 260.5M765 246.5H737.5L720.5 263.5"
                        stroke="#212538"
                      />
                      <circle cx="717.5" cy="263.5" r="2.5" stroke="#8F9CDA" />
                      <rect
                        x="765"
                        y="237"
                        width="42"
                        height="15"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint275_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="773"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint276_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="773"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint277_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="769"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint278_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="769"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint279_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="777"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint280_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="777"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint281_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="781"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint282_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="781"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint283_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="785"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint284_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="785"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint285_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="789"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint286_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="789"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint287_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="793"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint288_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="793"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint289_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="797"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint290_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="797"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint291_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="801"
                        y="231"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint292_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="801"
                        y="254"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill="#232C3F"
                        stroke="url(#paint293_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path
                        d="M726.585 281.455V288H725.793V281.455H726.585ZM733.441 283.5H732.649C732.602 283.272 732.52 283.072 732.403 282.899C732.288 282.727 732.147 282.582 731.981 282.464C731.817 282.345 731.635 282.256 731.434 282.196C731.234 282.136 731.025 282.107 730.808 282.107C730.412 282.107 730.053 282.207 729.731 282.407C729.411 282.607 729.157 282.902 728.967 283.292C728.78 283.682 728.686 284.161 728.686 284.727C728.686 285.294 728.78 285.772 728.967 286.162C729.157 286.552 729.411 286.847 729.731 287.048C730.053 287.248 730.412 287.348 730.808 287.348C731.025 287.348 731.234 287.318 731.434 287.259C731.635 287.199 731.817 287.11 731.981 286.993C732.147 286.874 732.288 286.728 732.403 286.555C732.52 286.381 732.602 286.18 732.649 285.955H733.441C733.382 286.289 733.273 286.588 733.116 286.853C732.958 287.117 732.762 287.342 732.527 287.527C732.293 287.71 732.03 287.85 731.738 287.946C731.448 288.042 731.138 288.089 730.808 288.089C730.25 288.089 729.753 287.953 729.319 287.68C728.884 287.408 728.542 287.02 728.293 286.517C728.043 286.014 727.919 285.418 727.919 284.727C727.919 284.037 728.043 283.44 728.293 282.938C728.542 282.435 728.884 282.047 729.319 281.774C729.753 281.501 730.25 281.365 730.808 281.365C731.138 281.365 731.448 281.413 731.738 281.509C732.03 281.605 732.293 281.745 732.527 281.931C732.762 282.114 732.958 282.338 733.116 282.602C733.273 282.864 733.382 283.163 733.441 283.5ZM734.454 286.658V286.006L737.33 281.455H737.803V282.464H737.484L735.31 285.903V285.955H739.184V286.658H734.454ZM737.535 288V286.46V286.156V281.455H738.289V288H737.535ZM740.586 288L743.514 282.209V282.158H740.139V281.455H744.332V282.196L741.417 288H740.586ZM745.638 288V281.455H746.431V287.297H749.474V288H745.638ZM750.701 288V281.455H751.493V284.702H751.57L754.51 281.455H755.546L752.797 284.408L755.546 288H754.587L752.312 284.957L751.493 285.878V288H750.701Z"
                        fill="#6E6D89"
                      />
                      <circle cx="724" cy="278" r="1" fill="url(#paint294_radial_375_1247)" />
                      <circle cx="724" cy="290" r="1" fill="url(#paint295_radial_375_1247)" />
                      <circle cx="757" cy="278" r="1" fill="url(#paint296_radial_375_1247)" />
                      <circle cx="757" cy="290" r="1" fill="url(#paint297_radial_375_1247)" />
                    </g>
                    <g opacity="0.6">
                      <circle cx="1123" cy="218" r="1" fill="url(#paint298_radial_375_1247)" />
                      <circle cx="1123" cy="222" r="1" fill="url(#paint299_radial_375_1247)" />
                      <circle cx="1123" cy="226" r="1" fill="url(#paint300_radial_375_1247)" />
                      <circle cx="1127" cy="218" r="1" fill="url(#paint301_radial_375_1247)" />
                      <circle cx="1127" cy="222" r="1" fill="url(#paint302_radial_375_1247)" />
                      <circle cx="1127" cy="226" r="1" fill="url(#paint303_radial_375_1247)" />
                      <circle cx="1131" cy="218" r="1" fill="url(#paint304_radial_375_1247)" />
                      <circle cx="1135" cy="218" r="1" fill="url(#paint305_radial_375_1247)" />
                      <circle cx="1131" cy="222" r="1" fill="url(#paint306_radial_375_1247)" />
                      <circle cx="1135" cy="222" r="1" fill="url(#paint307_radial_375_1247)" />
                      <circle cx="1131" cy="226" r="1" fill="url(#paint308_radial_375_1247)" />
                      <circle cx="1135" cy="226" r="1" fill="url(#paint309_radial_375_1247)" />
                    </g>
                    <g filter="url(#filter28_d_375_1247)">
                      <rect
                        x="1059"
                        y="250"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint310_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter29_d_375_1247)">
                      <rect
                        x="1065"
                        y="253"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint311_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter30_d_375_1247)">
                      <rect
                        x="1087"
                        y="251"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint312_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter31_d_375_1247)">
                      <rect
                        x="1121"
                        y="247"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint313_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter32_d_375_1247)">
                      <rect
                        x="1109"
                        y="254"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint314_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter33_d_375_1247)">
                      <rect
                        x="1146"
                        y="252"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint315_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter34_d_375_1247)">
                      <rect
                        x="1180"
                        y="249"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint316_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g filter="url(#filter35_d_375_1247)">
                      <rect
                        x="1189"
                        y="253"
                        width="2"
                        height="1"
                        rx="0.5"
                        fill="url(#paint317_linear_375_1247)"
                        shape-rendering="crispEdges"
                      />
                    </g>
                    <g clip-path="url(#clip1_375_1247)">
                      <mask id="mask1_375_1247" maskUnits="userSpaceOnUse" x="1065" y="244" width="24" height="2">
                        <rect x="1065" y="244" width="24" height="2" fill="url(#paint318_linear_375_1247)" />
                      </mask>
                      <g mask="url(#mask1_375_1247)">
                        <rect
                          x="1065"
                          y="244"
                          width="24"
                          height="2"
                          fill="url(#paint319_linear_375_1247)"
                          fill-opacity="0.15"
                        />
                      </g>
                    </g>
                    <g clip-path="url(#clip2_375_1247)">
                      <mask id="mask2_375_1247" maskUnits="userSpaceOnUse" x="1154" y="246" width="24" height="2">
                        <rect x="1154" y="246" width="24" height="2" fill="url(#paint320_linear_375_1247)" />
                      </mask>
                      <g mask="url(#mask2_375_1247)">
                        <rect
                          x="1154"
                          y="246"
                          width="24"
                          height="2"
                          fill="url(#paint321_linear_375_1247)"
                          fill-opacity="0.15"
                        />
                      </g>
                    </g>
                    <g clip-path="url(#clip3_375_1247)">
                      <mask id="mask3_375_1247" maskUnits="userSpaceOnUse" x="1077" y="253" width="24" height="2">
                        <rect x="1077" y="253" width="24" height="2" fill="url(#paint322_linear_375_1247)" />
                      </mask>
                      <g mask="url(#mask3_375_1247)">
                        <rect
                          x="1077"
                          y="253"
                          width="24"
                          height="2"
                          fill="url(#paint323_linear_375_1247)"
                          fill-opacity="0.15"
                        />
                      </g>
                    </g>
                    <g clip-path="url(#clip4_375_1247)">
                      <mask id="mask4_375_1247" maskUnits="userSpaceOnUse" x="1117" y="254" width="24" height="2">
                        <rect x="1117" y="254" width="24" height="2" fill="url(#paint324_linear_375_1247)" />
                      </mask>
                      <g mask="url(#mask4_375_1247)">
                        <rect
                          x="1117"
                          y="254"
                          width="24"
                          height="2"
                          fill="url(#paint325_linear_375_1247)"
                          fill-opacity="0.15"
                        />
                      </g>
                    </g>
                    <mask id="mask5_375_1247" maskUnits="userSpaceOnUse" x="1099" y="249" width="44" height="2">
                      <rect x="1099" y="249" width="44" height="2" fill="url(#paint326_linear_375_1247)" />
                    </mask>
                    <g mask="url(#mask5_375_1247)">
                      <rect
                        x="1099"
                        y="249"
                        width="44"
                        height="2"
                        fill="url(#paint327_linear_375_1247)"
                        fill-opacity="0.15"
                      />
                    </g>
                    <g opacity="0.2">
                      <path d="M673 418.5L665 418.5" stroke="#212538" />
                      <rect
                        x="668"
                        y="426"
                        width="16"
                        height="15"
                        rx="0.5"
                        transform="rotate(-180 668 426)"
                        fill="#232C3F"
                        stroke="url(#paint328_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <path
                        opacity="0.6"
                        d="M715 420.5L744.5 420.5L762.5 402.5M715 416.5L742.5 416.5L759.5 399.5"
                        stroke="#212538"
                      />
                      <circle cx="762.5" cy="399.5" r="2.5" transform="rotate(-180 762.5 399.5)" stroke="#8F9CDA" />
                      <rect
                        x="715"
                        y="426"
                        width="42"
                        height="15"
                        rx="0.5"
                        transform="rotate(-180 715 426)"
                        fill="#232C3F"
                        stroke="url(#paint329_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="707"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 707 432)"
                        fill="#232C3F"
                        stroke="url(#paint330_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="707"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 707 409)"
                        fill="#232C3F"
                        stroke="url(#paint331_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="711"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 711 432)"
                        fill="#232C3F"
                        stroke="url(#paint332_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="711"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 711 409)"
                        fill="#232C3F"
                        stroke="url(#paint333_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="703"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 703 432)"
                        fill="#232C3F"
                        stroke="url(#paint334_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="703"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 703 409)"
                        fill="#232C3F"
                        stroke="url(#paint335_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="699"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 699 432)"
                        fill="#232C3F"
                        stroke="url(#paint336_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="699"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 699 409)"
                        fill="#232C3F"
                        stroke="url(#paint337_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="695"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 695 432)"
                        fill="#232C3F"
                        stroke="url(#paint338_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="695"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 695 409)"
                        fill="#232C3F"
                        stroke="url(#paint339_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="691"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 691 432)"
                        fill="#232C3F"
                        stroke="url(#paint340_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="691"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 691 409)"
                        fill="#232C3F"
                        stroke="url(#paint341_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="687"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 687 432)"
                        fill="#232C3F"
                        stroke="url(#paint342_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="687"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 687 409)"
                        fill="#232C3F"
                        stroke="url(#paint343_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="683"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 683 432)"
                        fill="#232C3F"
                        stroke="url(#paint344_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="683"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 683 409)"
                        fill="#232C3F"
                        stroke="url(#paint345_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="679"
                        y="432"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 679 432)"
                        fill="#232C3F"
                        stroke="url(#paint346_linear_375_1247)"
                        stroke-width="0.5"
                      />
                      <rect
                        x="679"
                        y="409"
                        width="2"
                        height="4"
                        rx="0.5"
                        transform="rotate(-180 679 409)"
                        fill="#232C3F"
                        stroke="url(#paint347_linear_375_1247)"
                        stroke-width="0.5"
                      />
                    </g>
                  </g>
                  <defs>
                    <filter
                      id="filter0_d_375_1247"
                      x="1013.9"
                      y="231.9"
                      width="52.2"
                      height="41.2"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dx="1" />
                      <feGaussianBlur stdDeviation="6.05" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter1_df_375_1247"
                      x="1042.5"
                      y="241.5"
                      width="13"
                      height="22"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                      <feGaussianBlur stdDeviation="1.25" result="effect2_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter2_df_375_1247"
                      x="1019.5"
                      y="242.5"
                      width="36"
                      height="20"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                      <feGaussianBlur stdDeviation="1.25" result="effect2_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter3_d_375_1247"
                      x="1008.3"
                      y="240.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter4_d_375_1247"
                      x="1029.3"
                      y="258.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter5_d_375_1247"
                      x="1032.3"
                      y="239.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter6_d_375_1247"
                      x="1033.3"
                      y="261.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter7_f_375_1247"
                      x="113"
                      y="159"
                      width="31"
                      height="25"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="4.5" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter8_f_375_1247"
                      x="121"
                      y="164"
                      width="15"
                      height="15"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter9_f_375_1247"
                      x="125"
                      y="168"
                      width="7"
                      height="7"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter10_f_375_1247"
                      x="13"
                      y="240"
                      width="31"
                      height="25"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="4.5" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter11_f_375_1247"
                      x="21"
                      y="245"
                      width="15"
                      height="15"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter12_f_375_1247"
                      x="25"
                      y="249"
                      width="7"
                      height="7"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter13_f_375_1247"
                      x="187"
                      y="313"
                      width="25"
                      height="31"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="4.5" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter14_f_375_1247"
                      x="192"
                      y="321"
                      width="15"
                      height="15"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter15_f_375_1247"
                      x="196"
                      y="325"
                      width="7"
                      height="7"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter16_d_375_1247"
                      x="526"
                      y="205"
                      width="124"
                      height="95"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="20" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.896471 0 0 0 0 0.705882 0 0 0 0 0.917647 0 0 0 1 0"
                      />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter17_ddi_375_1247"
                      x="965"
                      y="205"
                      width="126"
                      height="95"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="20" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.896471 0 0 0 0 0.705882 0 0 0 0 0.917647 0 0 0 1 0"
                      />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="2" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.49 0" />
                      <feBlend mode="normal" in2="effect1_dropShadow_375_1247" result="effect2_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_375_1247" result="shape" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="2.35" />
                      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="shape" result="effect3_innerShadow_375_1247" />
                    </filter>
                    <filter
                      id="filter18_d_375_1247"
                      x="1005.3"
                      y="254.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter19_d_375_1247"
                      x="1043.3"
                      y="245.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter20_d_375_1247"
                      x="1041.3"
                      y="253.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter21_d_375_1247"
                      x="261.7"
                      y="205.7"
                      width="123.6"
                      height="93.6"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="19.65" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.896471 0 0 0 0 0.705882 0 0 0 0 0.917647 0 0 0 1 0"
                      />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter22_dddii_375_1247"
                      x="122.9"
                      y="175.9"
                      width="153.2"
                      height="153.2"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feMorphology
                        radius="5"
                        operator="dilate"
                        in="SourceAlpha"
                        result="effect1_dropShadow_375_1247"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="5.95" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.0387939 0 0 0 0 0.0685905 0 0 0 0 0.131494 0 0 0 1 0"
                      />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="23.05" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.815686 0 0 0 0 0.705882 0 0 0 0 0.917647 0 0 0 0.26 0"
                      />
                      <feBlend mode="normal" in2="effect1_dropShadow_375_1247" result="effect2_dropShadow_375_1247" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="18.35" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.32 0" />
                      <feBlend mode="normal" in2="effect2_dropShadow_375_1247" result="effect3_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_375_1247" result="shape" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="4" />
                      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0.675757 0 0 0 0 0.66434 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="shape" result="effect4_innerShadow_375_1247" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="3.15" />
                      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.88 0" />
                      <feBlend mode="normal" in2="effect4_innerShadow_375_1247" result="effect5_innerShadow_375_1247" />
                    </filter>
                    <filter
                      id="filter23_di_375_1247"
                      x="170.822"
                      y="223.6"
                      width="57.3569"
                      height="57.7998"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="7.2" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0.804977 0 0 0 0 0.798109 0 0 0 0 1 0 0 0 0.53 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="3.25" />
                      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="shape" result="effect2_innerShadow_375_1247" />
                    </filter>
                    <filter
                      id="filter24_f_375_1247"
                      x="197.525"
                      y="224.797"
                      width="30.6779"
                      height="44.716"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="2.65" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter25_f_375_1247"
                      x="205.699"
                      y="232.115"
                      width="17.4895"
                      height="28.8201"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter26_f_375_1247"
                      x="169.168"
                      y="243.674"
                      width="32.4236"
                      height="38.9206"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="3.95" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter27_f_375_1247"
                      x="194"
                      y="247"
                      width="11"
                      height="11"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur_375_1247" />
                    </filter>
                    <filter
                      id="filter28_d_375_1247"
                      x="1057.3"
                      y="248.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter29_d_375_1247"
                      x="1063.3"
                      y="251.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter30_d_375_1247"
                      x="1085.3"
                      y="249.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter31_d_375_1247"
                      x="1119.3"
                      y="245.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter32_d_375_1247"
                      x="1107.3"
                      y="252.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter33_d_375_1247"
                      x="1144.3"
                      y="250.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter34_d_375_1247"
                      x="1178.3"
                      y="247.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <filter
                      id="filter35_d_375_1247"
                      x="1187.3"
                      y="251.3"
                      width="5.4"
                      height="4.4"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.85" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_375_1247" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_375_1247" result="shape" />
                    </filter>
                    <linearGradient
                      id="paint0_linear_375_1247"
                      x1="1026.5"
                      y1="280.75"
                      x2="593.5"
                      y2="290.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#C1CFFA" />
                      <stop offset="1" stop-color="#212538" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_375_1247"
                      x1="1026.5"
                      y1="224.25"
                      x2="593.5"
                      y2="214.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#C1CFFA" />
                      <stop offset="1" stop-color="#212538" />
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear_375_1247"
                      x1="1048"
                      y1="252.5"
                      x2="1197"
                      y2="252.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="0.429267" stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint3_linear_375_1247"
                      x1="1124"
                      y1="243"
                      x2="1124"
                      y2="262"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#56C7FF" stop-opacity="0" />
                      <stop offset="0.478642" stop-color="#B0E5FF" />
                      <stop offset="1" stop-color="#56C7FF" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint4_linear_375_1247"
                      x1="1053"
                      y1="252.053"
                      x2="1031.05"
                      y2="252.053"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" stop-opacity="0.8" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint5_linear_375_1247"
                      x1="1053.5"
                      y1="265"
                      x2="1053.5"
                      y2="261"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" />
                    </linearGradient>
                    <linearGradient
                      id="paint6_linear_375_1247"
                      x1="1029.5"
                      y1="275.5"
                      x2="1029.5"
                      y2="260"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" />
                    </linearGradient>
                    <linearGradient
                      id="paint7_linear_375_1247"
                      x1="1012"
                      y1="242.5"
                      x2="1009"
                      y2="242.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint8_linear_375_1247"
                      x1="1033"
                      y1="260.5"
                      x2="1030"
                      y2="260.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint9_linear_375_1247"
                      x1="1036"
                      y1="241.5"
                      x2="1033"
                      y2="241.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint10_linear_375_1247"
                      x1="1037"
                      y1="263.5"
                      x2="1034"
                      y2="263.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint11_linear_375_1247"
                      x1="110"
                      y1="171.5"
                      x2="147"
                      y2="171.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#F24E1E" stop-opacity="0" />
                      <stop offset="0.5" stop-color="#F24E1E" />
                      <stop offset="1" stop-color="#F24E1E" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint12_linear_375_1247"
                      x1="122"
                      y1="171.5"
                      x2="134.071"
                      y2="171.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.360704" stop-color="#F24E1E" />
                      <stop offset="0.568083" stop-color="#F24E1E" />
                    </linearGradient>
                    <radialGradient
                      id="paint13_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(128.5 171.5) rotate(90) scale(4.5)"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="#F24E1E" stop-opacity="0" />
                    </radialGradient>
                    <linearGradient
                      id="paint14_linear_375_1247"
                      x1="10"
                      y1="252.5"
                      x2="47"
                      y2="252.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.02" stop-color="#CE9DFF" stop-opacity="0" />
                      <stop offset="0.496873" stop-color="#CE9DFF" />
                      <stop offset="1" stop-color="#CE9DFF" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint15_linear_375_1247"
                      x1="22"
                      y1="252.5"
                      x2="34.0714"
                      y2="252.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.360704" stop-color="#CE9DFF" />
                      <stop offset="0.568083" stop-color="#CE9DFF" />
                    </linearGradient>
                    <radialGradient
                      id="paint16_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(28.5 252.5) rotate(90) scale(4.5)"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="#EFEFC3" stop-opacity="0" />
                    </radialGradient>
                    <linearGradient
                      id="paint17_linear_375_1247"
                      x1="199.5"
                      y1="347"
                      x2="199.5"
                      y2="310"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.02" stop-color="#0DCD85" stop-opacity="0" />
                      <stop offset="0.496873" stop-color="#0DCD85" />
                      <stop offset="1" stop-color="#0DCD85" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint18_linear_375_1247"
                      x1="193"
                      y1="328.5"
                      x2="205.071"
                      y2="328.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.360704" stop-color="#0DCD85" />
                      <stop offset="0.568083" stop-color="#0DCD85" />
                    </linearGradient>
                    <radialGradient
                      id="paint19_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(199.5 328.5) rotate(90) scale(4.5)"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="#0DCD85" stop-opacity="0" />
                    </radialGradient>
                    <radialGradient
                      id="paint20_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(942 99) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint21_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(942 110) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint22_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(977 99) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint23_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(977 110) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <linearGradient
                      id="paint24_linear_375_1247"
                      x1="559.508"
                      y1="263.566"
                      x2="570.567"
                      y2="235.619"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#E5B4EA" />
                      <stop offset="1" stop-color="#ACA9FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint25_linear_375_1247"
                      x1="888.967"
                      y1="239.041"
                      x2="900.51"
                      y2="234.946"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint26_linear_375_1247"
                      x1="898.967"
                      y1="239.041"
                      x2="910.51"
                      y2="234.946"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint27_linear_375_1247"
                      x1="908.967"
                      y1="239.041"
                      x2="920.51"
                      y2="234.946"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint28_linear_375_1247"
                      x1="918.967"
                      y1="239.041"
                      x2="930.51"
                      y2="234.946"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint29_linear_375_1247"
                      x1="928.967"
                      y1="239.041"
                      x2="940.51"
                      y2="234.946"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint30_linear_375_1247"
                      x1="891.557"
                      y1="240.713"
                      x2="894.754"
                      y2="237.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint31_linear_375_1247"
                      x1="901.557"
                      y1="240.713"
                      x2="904.754"
                      y2="237.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint32_linear_375_1247"
                      x1="911.557"
                      y1="240.713"
                      x2="914.754"
                      y2="237.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint33_linear_375_1247"
                      x1="921.557"
                      y1="240.713"
                      x2="924.754"
                      y2="237.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint34_linear_375_1247"
                      x1="931.557"
                      y1="240.713"
                      x2="934.754"
                      y2="237.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint35_linear_375_1247"
                      x1="1047.23"
                      y1="249.795"
                      x2="1036.53"
                      y2="278.068"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#E5B4EA" />
                      <stop offset="1" stop-color="#ACA9FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint36_linear_375_1247"
                      x1="1009"
                      y1="256.5"
                      x2="1006"
                      y2="256.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint37_linear_375_1247"
                      x1="1047"
                      y1="247.5"
                      x2="1044"
                      y2="247.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint38_linear_375_1247"
                      x1="1045"
                      y1="255.5"
                      x2="1042"
                      y2="255.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint39_linear_375_1247"
                      x1="579.426"
                      y1="337.615"
                      x2="587.773"
                      y2="317.349"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint40_linear_375_1247"
                      x1="583.557"
                      y1="347.664"
                      x2="588.459"
                      y2="345.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint41_linear_375_1247"
                      x1="590.557"
                      y1="347.664"
                      x2="595.459"
                      y2="345.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint42_linear_375_1247"
                      x1="597.557"
                      y1="347.664"
                      x2="602.459"
                      y2="345.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint43_linear_375_1247"
                      x1="604.557"
                      y1="347.664"
                      x2="609.459"
                      y2="345.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint44_linear_375_1247"
                      x1="611.557"
                      y1="347.664"
                      x2="616.459"
                      y2="345.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <radialGradient
                      id="paint45_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(632 356) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint46_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(632 368) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint47_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(664 356) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint48_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(664 368) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <linearGradient
                      id="paint49_linear_375_1247"
                      x1="614.672"
                      y1="181.139"
                      x2="624.262"
                      y2="172.877"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint50_linear_375_1247"
                      x1="553.557"
                      y1="179.664"
                      x2="558.459"
                      y2="177.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint51_linear_375_1247"
                      x1="558.557"
                      y1="179.664"
                      x2="563.459"
                      y2="177.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint52_linear_375_1247"
                      x1="563.557"
                      y1="179.664"
                      x2="568.459"
                      y2="177.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint53_linear_375_1247"
                      x1="568.557"
                      y1="179.664"
                      x2="573.459"
                      y2="177.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint54_linear_375_1247"
                      x1="573.557"
                      y1="179.664"
                      x2="578.459"
                      y2="177.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint55_linear_375_1247"
                      x1="578.557"
                      y1="179.664"
                      x2="583.459"
                      y2="177.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint56_linear_375_1247"
                      x1="582.967"
                      y1="179.664"
                      x2="590.426"
                      y2="173.238"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint57_linear_375_1247"
                      x1="587.639"
                      y1="144.566"
                      x2="603.743"
                      y2="129.766"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint58_linear_375_1247"
                      x1="536.803"
                      y1="144.566"
                      x2="548.238"
                      y2="116.983"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint59_linear_375_1247"
                      x1="550.705"
                      y1="124.951"
                      x2="553.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint60_linear_375_1247"
                      x1="550.705"
                      y1="147.951"
                      x2="553.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint61_linear_375_1247"
                      x1="546.705"
                      y1="124.951"
                      x2="549.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint62_linear_375_1247"
                      x1="546.705"
                      y1="147.951"
                      x2="549.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint63_linear_375_1247"
                      x1="554.705"
                      y1="124.951"
                      x2="557.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint64_linear_375_1247"
                      x1="554.705"
                      y1="147.951"
                      x2="557.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint65_linear_375_1247"
                      x1="558.705"
                      y1="124.951"
                      x2="561.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint66_linear_375_1247"
                      x1="558.705"
                      y1="147.951"
                      x2="561.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint67_linear_375_1247"
                      x1="562.705"
                      y1="124.951"
                      x2="565.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint68_linear_375_1247"
                      x1="562.705"
                      y1="147.951"
                      x2="565.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint69_linear_375_1247"
                      x1="566.705"
                      y1="124.951"
                      x2="569.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint70_linear_375_1247"
                      x1="566.705"
                      y1="147.951"
                      x2="569.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint71_linear_375_1247"
                      x1="570.705"
                      y1="124.951"
                      x2="573.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint72_linear_375_1247"
                      x1="570.705"
                      y1="147.951"
                      x2="573.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint73_linear_375_1247"
                      x1="574.705"
                      y1="124.951"
                      x2="577.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint74_linear_375_1247"
                      x1="574.705"
                      y1="147.951"
                      x2="577.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint75_linear_375_1247"
                      x1="578.705"
                      y1="124.951"
                      x2="581.837"
                      y2="123.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint76_linear_375_1247"
                      x1="578.705"
                      y1="147.951"
                      x2="581.837"
                      y2="146.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <radialGradient
                      id="paint77_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(502 167) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint78_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(502 179) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint79_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(535 167) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint80_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(535 179) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <linearGradient
                      id="paint81_linear_375_1247"
                      x1="270.41"
                      y1="289.754"
                      x2="277.622"
                      y2="288.511"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint82_linear_375_1247"
                      x1="264.41"
                      y1="289.754"
                      x2="271.622"
                      y2="288.511"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint83_linear_375_1247"
                      x1="276.41"
                      y1="289.754"
                      x2="283.622"
                      y2="288.511"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint84_linear_375_1247"
                      x1="282.41"
                      y1="289.754"
                      x2="289.622"
                      y2="288.511"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint85_linear_375_1247"
                      x1="288.41"
                      y1="289.754"
                      x2="295.622"
                      y2="288.511"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint86_linear_375_1247"
                      x1="294.082"
                      y1="296.139"
                      x2="303.551"
                      y2="284.355"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint87_linear_375_1247"
                      x1="323.541"
                      y1="232.041"
                      x2="338.751"
                      y2="203.52"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#E5B4EA" />
                      <stop offset="1" stop-color="#ACA9FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint88_linear_375_1247"
                      x1="328.721"
                      y1="226.139"
                      x2="334.905"
                      y2="208.973"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <radialGradient
                      id="paint89_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(367 241) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint90_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(367 245) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint91_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(371 237) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint92_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(367 237) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint93_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(371 241) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint94_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(371 245) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint95_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(375 237) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint96_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(379 237) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint97_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(375 241) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint98_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(379 241) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint99_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(375 245) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint100_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(379 245) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <linearGradient
                      id="paint101_linear_375_1247"
                      x1="294.361"
                      y1="263.566"
                      x2="305.238"
                      y2="235.451"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#E5B4EA" />
                      <stop offset="1" stop-color="#ACA9FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint102_linear_375_1247"
                      x1="296.508"
                      y1="355.902"
                      x2="299.991"
                      y2="339.398"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint103_linear_375_1247"
                      x1="307.705"
                      y1="344.951"
                      x2="310.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint104_linear_375_1247"
                      x1="307.705"
                      y1="360.951"
                      x2="310.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint105_linear_375_1247"
                      x1="311.705"
                      y1="344.951"
                      x2="314.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint106_linear_375_1247"
                      x1="311.705"
                      y1="360.951"
                      x2="314.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint107_linear_375_1247"
                      x1="315.705"
                      y1="344.951"
                      x2="318.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint108_linear_375_1247"
                      x1="315.705"
                      y1="360.951"
                      x2="318.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint109_linear_375_1247"
                      x1="319.705"
                      y1="344.951"
                      x2="322.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint110_linear_375_1247"
                      x1="319.705"
                      y1="360.951"
                      x2="322.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint111_linear_375_1247"
                      x1="323.705"
                      y1="344.951"
                      x2="326.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint112_linear_375_1247"
                      x1="323.705"
                      y1="360.951"
                      x2="326.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint113_linear_375_1247"
                      x1="327.705"
                      y1="344.951"
                      x2="330.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint114_linear_375_1247"
                      x1="327.705"
                      y1="360.951"
                      x2="330.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint115_linear_375_1247"
                      x1="331.705"
                      y1="344.951"
                      x2="334.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint116_linear_375_1247"
                      x1="331.705"
                      y1="360.951"
                      x2="334.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint117_linear_375_1247"
                      x1="335.705"
                      y1="344.951"
                      x2="338.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint118_linear_375_1247"
                      x1="335.705"
                      y1="360.951"
                      x2="338.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint119_linear_375_1247"
                      x1="339.705"
                      y1="344.951"
                      x2="342.837"
                      y2="343.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint120_linear_375_1247"
                      x1="339.705"
                      y1="360.951"
                      x2="342.837"
                      y2="359.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint121_linear_375_1247"
                      x1="432.984"
                      y1="285.615"
                      x2="440.785"
                      y2="264.841"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint122_linear_375_1247"
                      x1="398.41"
                      y1="285.615"
                      x2="405.172"
                      y2="283.496"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint123_linear_375_1247"
                      x1="404.41"
                      y1="285.615"
                      x2="411.172"
                      y2="283.496"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint124_linear_375_1247"
                      x1="410.41"
                      y1="285.615"
                      x2="417.172"
                      y2="283.496"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint125_linear_375_1247"
                      x1="416.41"
                      y1="285.615"
                      x2="423.172"
                      y2="283.496"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <radialGradient
                      id="paint126_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(417 350) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint127_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(322 318) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint128_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(322 330) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint129_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(355 318) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint130_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(355 330) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint131_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(424 350) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <linearGradient
                      id="paint132_linear_375_1247"
                      x1="252.492"
                      y1="217.041"
                      x2="270.607"
                      y2="201.434"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#E5B4EA" />
                      <stop offset="1" stop-color="#ACA9FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint133_linear_375_1247"
                      x1="257.672"
                      y1="211.139"
                      x2="267.262"
                      y2="202.877"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint134_linear_375_1247"
                      x1="355.557"
                      y1="174.426"
                      x2="360.255"
                      y2="172.403"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint135_linear_375_1247"
                      x1="352.852"
                      y1="171.475"
                      x2="354.418"
                      y2="170.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint136_linear_375_1247"
                      x1="360.852"
                      y1="171.475"
                      x2="362.418"
                      y2="170.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint137_linear_375_1247"
                      x1="342.557"
                      y1="174.426"
                      x2="347.255"
                      y2="172.403"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint138_linear_375_1247"
                      x1="339.852"
                      y1="171.475"
                      x2="341.418"
                      y2="170.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint139_linear_375_1247"
                      x1="347.852"
                      y1="171.475"
                      x2="349.418"
                      y2="170.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint140_linear_375_1247"
                      x1="368.557"
                      y1="174.426"
                      x2="373.255"
                      y2="172.403"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint141_linear_375_1247"
                      x1="365.852"
                      y1="171.475"
                      x2="367.418"
                      y2="170.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint142_linear_375_1247"
                      x1="373.852"
                      y1="171.475"
                      x2="375.418"
                      y2="170.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint143_linear_375_1247"
                      x1="261.557"
                      y1="193.713"
                      x2="264.754"
                      y2="190.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint144_linear_375_1247"
                      x1="261.557"
                      y1="219.713"
                      x2="264.754"
                      y2="216.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint145_linear_375_1247"
                      x1="248.557"
                      y1="206.713"
                      x2="251.754"
                      y2="203.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint146_linear_375_1247"
                      x1="968.492"
                      y1="407.041"
                      x2="986.607"
                      y2="391.434"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#E5B4EA" />
                      <stop offset="1" stop-color="#ACA9FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint147_linear_375_1247"
                      x1="965.672"
                      y1="393.139"
                      x2="975.262"
                      y2="384.877"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint148_linear_375_1247"
                      x1="869.557"
                      y1="422.426"
                      x2="874.255"
                      y2="420.403"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint149_linear_375_1247"
                      x1="872.852"
                      y1="415.475"
                      x2="874.418"
                      y2="414.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint150_linear_375_1247"
                      x1="864.852"
                      y1="415.475"
                      x2="866.418"
                      y2="414.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint151_linear_375_1247"
                      x1="882.557"
                      y1="422.426"
                      x2="887.255"
                      y2="420.403"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint152_linear_375_1247"
                      x1="885.852"
                      y1="415.475"
                      x2="887.418"
                      y2="414.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint153_linear_375_1247"
                      x1="877.852"
                      y1="415.475"
                      x2="879.418"
                      y2="414.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint154_linear_375_1247"
                      x1="856.557"
                      y1="422.426"
                      x2="861.255"
                      y2="420.403"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint155_linear_375_1247"
                      x1="859.852"
                      y1="415.475"
                      x2="861.418"
                      y2="414.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint156_linear_375_1247"
                      x1="851.852"
                      y1="415.475"
                      x2="853.418"
                      y2="414.801"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint157_linear_375_1247"
                      x1="963.557"
                      y1="395.713"
                      x2="966.754"
                      y2="392.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint158_linear_375_1247"
                      x1="963.557"
                      y1="369.713"
                      x2="966.754"
                      y2="366.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint159_linear_375_1247"
                      x1="976.557"
                      y1="382.713"
                      x2="979.754"
                      y2="379.959"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint160_linear_375_1247"
                      x1="638.557"
                      y1="289.189"
                      x2="642.952"
                      y2="286.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint161_linear_375_1247"
                      x1="638.557"
                      y1="223.189"
                      x2="642.952"
                      y2="220.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint162_linear_375_1247"
                      x1="644.557"
                      y1="289.189"
                      x2="648.952"
                      y2="286.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint163_linear_375_1247"
                      x1="644.557"
                      y1="223.189"
                      x2="648.952"
                      y2="220.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint164_linear_375_1247"
                      x1="650.557"
                      y1="289.189"
                      x2="654.952"
                      y2="286.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint165_linear_375_1247"
                      x1="650.557"
                      y1="223.189"
                      x2="654.952"
                      y2="220.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint166_linear_375_1247"
                      x1="656.557"
                      y1="289.189"
                      x2="660.952"
                      y2="286.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint167_linear_375_1247"
                      x1="656.557"
                      y1="223.189"
                      x2="660.952"
                      y2="220.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint168_linear_375_1247"
                      x1="662.557"
                      y1="289.189"
                      x2="666.952"
                      y2="286.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint169_linear_375_1247"
                      x1="662.557"
                      y1="223.189"
                      x2="666.952"
                      y2="220.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint170_linear_375_1247"
                      x1="668.557"
                      y1="289.189"
                      x2="672.952"
                      y2="286.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint171_linear_375_1247"
                      x1="668.557"
                      y1="223.189"
                      x2="672.952"
                      y2="220.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint172_linear_375_1247"
                      x1="625.557"
                      y1="242.189"
                      x2="629.952"
                      y2="239.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint173_linear_375_1247"
                      x1="691.557"
                      y1="242.189"
                      x2="695.952"
                      y2="239.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint174_linear_375_1247"
                      x1="625.557"
                      y1="248.189"
                      x2="629.952"
                      y2="245.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint175_linear_375_1247"
                      x1="691.557"
                      y1="248.189"
                      x2="695.952"
                      y2="245.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint176_linear_375_1247"
                      x1="625.557"
                      y1="254.189"
                      x2="629.952"
                      y2="251.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint177_linear_375_1247"
                      x1="691.557"
                      y1="254.189"
                      x2="695.952"
                      y2="251.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint178_linear_375_1247"
                      x1="625.557"
                      y1="260.189"
                      x2="629.952"
                      y2="257.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint179_linear_375_1247"
                      x1="691.557"
                      y1="260.189"
                      x2="695.952"
                      y2="257.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint180_linear_375_1247"
                      x1="625.557"
                      y1="266.189"
                      x2="629.952"
                      y2="263.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint181_linear_375_1247"
                      x1="691.557"
                      y1="266.189"
                      x2="695.952"
                      y2="263.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint182_linear_375_1247"
                      x1="625.557"
                      y1="272.189"
                      x2="629.952"
                      y2="269.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint183_linear_375_1247"
                      x1="691.557"
                      y1="272.189"
                      x2="695.952"
                      y2="269.917"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint184_linear_375_1247"
                      x1="631.246"
                      y1="281.27"
                      x2="672.803"
                      y2="245.467"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint185_linear_375_1247"
                      x1="634.852"
                      y1="280.713"
                      x2="636.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint186_linear_375_1247"
                      x1="634.852"
                      y1="228.713"
                      x2="636.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint187_linear_375_1247"
                      x1="640.852"
                      y1="280.713"
                      x2="642.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint188_linear_375_1247"
                      x1="640.852"
                      y1="228.713"
                      x2="642.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint189_linear_375_1247"
                      x1="646.852"
                      y1="280.713"
                      x2="648.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint190_linear_375_1247"
                      x1="646.852"
                      y1="228.713"
                      x2="648.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint191_linear_375_1247"
                      x1="652.852"
                      y1="280.713"
                      x2="654.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint192_linear_375_1247"
                      x1="652.852"
                      y1="228.713"
                      x2="654.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint193_linear_375_1247"
                      x1="658.852"
                      y1="280.713"
                      x2="660.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint194_linear_375_1247"
                      x1="658.852"
                      y1="228.713"
                      x2="660.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint195_linear_375_1247"
                      x1="664.852"
                      y1="280.713"
                      x2="666.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint196_linear_375_1247"
                      x1="664.852"
                      y1="228.713"
                      x2="666.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint197_linear_375_1247"
                      x1="670.852"
                      y1="280.713"
                      x2="672.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint198_linear_375_1247"
                      x1="670.852"
                      y1="228.713"
                      x2="672.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint199_linear_375_1247"
                      x1="676.852"
                      y1="280.713"
                      x2="678.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint200_linear_375_1247"
                      x1="676.852"
                      y1="228.713"
                      x2="678.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint201_linear_375_1247"
                      x1="637.852"
                      y1="280.713"
                      x2="639.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint202_linear_375_1247"
                      x1="637.852"
                      y1="228.713"
                      x2="639.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint203_linear_375_1247"
                      x1="643.852"
                      y1="280.713"
                      x2="645.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint204_linear_375_1247"
                      x1="643.852"
                      y1="228.713"
                      x2="645.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint205_linear_375_1247"
                      x1="649.852"
                      y1="280.713"
                      x2="651.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint206_linear_375_1247"
                      x1="649.852"
                      y1="228.713"
                      x2="651.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint207_linear_375_1247"
                      x1="655.852"
                      y1="280.713"
                      x2="657.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint208_linear_375_1247"
                      x1="655.852"
                      y1="228.713"
                      x2="657.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint209_linear_375_1247"
                      x1="661.852"
                      y1="280.713"
                      x2="663.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint210_linear_375_1247"
                      x1="661.852"
                      y1="228.713"
                      x2="663.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint211_linear_375_1247"
                      x1="667.852"
                      y1="280.713"
                      x2="669.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint212_linear_375_1247"
                      x1="667.852"
                      y1="228.713"
                      x2="669.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint213_linear_375_1247"
                      x1="673.852"
                      y1="280.713"
                      x2="675.568"
                      y2="280.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint214_linear_375_1247"
                      x1="631.852"
                      y1="234.713"
                      x2="633.568"
                      y2="234.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint215_linear_375_1247"
                      x1="631.852"
                      y1="240.713"
                      x2="633.568"
                      y2="240.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint216_linear_375_1247"
                      x1="631.852"
                      y1="246.713"
                      x2="633.568"
                      y2="246.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint217_linear_375_1247"
                      x1="631.852"
                      y1="252.713"
                      x2="633.568"
                      y2="252.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint218_linear_375_1247"
                      x1="631.852"
                      y1="258.713"
                      x2="633.568"
                      y2="258.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint219_linear_375_1247"
                      x1="631.852"
                      y1="264.713"
                      x2="633.568"
                      y2="264.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint220_linear_375_1247"
                      x1="631.852"
                      y1="270.713"
                      x2="633.568"
                      y2="270.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint221_linear_375_1247"
                      x1="631.852"
                      y1="276.713"
                      x2="633.568"
                      y2="276.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint222_linear_375_1247"
                      x1="631.852"
                      y1="237.713"
                      x2="633.568"
                      y2="237.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint223_linear_375_1247"
                      x1="631.852"
                      y1="243.713"
                      x2="633.568"
                      y2="243.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint224_linear_375_1247"
                      x1="631.852"
                      y1="249.713"
                      x2="633.568"
                      y2="249.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint225_linear_375_1247"
                      x1="631.852"
                      y1="255.713"
                      x2="633.568"
                      y2="255.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint226_linear_375_1247"
                      x1="631.852"
                      y1="261.713"
                      x2="633.568"
                      y2="261.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint227_linear_375_1247"
                      x1="631.852"
                      y1="267.713"
                      x2="633.568"
                      y2="267.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint228_linear_375_1247"
                      x1="631.852"
                      y1="273.713"
                      x2="633.568"
                      y2="273.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint229_linear_375_1247"
                      x1="673.852"
                      y1="228.713"
                      x2="675.568"
                      y2="228.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint230_linear_375_1247"
                      x1="680.852"
                      y1="277.713"
                      x2="682.568"
                      y2="277.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint231_linear_375_1247"
                      x1="680.852"
                      y1="271.713"
                      x2="682.568"
                      y2="271.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint232_linear_375_1247"
                      x1="680.852"
                      y1="265.713"
                      x2="682.568"
                      y2="265.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint233_linear_375_1247"
                      x1="680.852"
                      y1="259.713"
                      x2="682.568"
                      y2="259.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint234_linear_375_1247"
                      x1="680.852"
                      y1="253.713"
                      x2="682.568"
                      y2="253.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint235_linear_375_1247"
                      x1="680.852"
                      y1="247.713"
                      x2="682.568"
                      y2="247.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint236_linear_375_1247"
                      x1="680.852"
                      y1="241.713"
                      x2="682.568"
                      y2="241.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint237_linear_375_1247"
                      x1="680.852"
                      y1="235.713"
                      x2="682.568"
                      y2="235.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint238_linear_375_1247"
                      x1="680.852"
                      y1="274.713"
                      x2="682.568"
                      y2="274.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint239_linear_375_1247"
                      x1="680.852"
                      y1="268.713"
                      x2="682.568"
                      y2="268.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint240_linear_375_1247"
                      x1="680.852"
                      y1="262.713"
                      x2="682.568"
                      y2="262.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint241_linear_375_1247"
                      x1="680.852"
                      y1="256.713"
                      x2="682.568"
                      y2="256.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint242_linear_375_1247"
                      x1="160"
                      y1="297.5"
                      x2="225"
                      y2="241.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#E5B4EA" />
                      <stop offset="1" stop-color="#ACA9FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint243_linear_375_1247"
                      x1="680.852"
                      y1="250.713"
                      x2="682.568"
                      y2="250.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint244_linear_375_1247"
                      x1="680.852"
                      y1="244.713"
                      x2="682.568"
                      y2="244.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint245_linear_375_1247"
                      x1="680.852"
                      y1="238.713"
                      x2="682.568"
                      y2="238.221"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint246_linear_375_1247"
                      x1="902.139"
                      y1="154.566"
                      x2="918.243"
                      y2="139.766"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint247_linear_375_1247"
                      x1="851.303"
                      y1="154.566"
                      x2="862.738"
                      y2="126.983"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint248_linear_375_1247"
                      x1="865.205"
                      y1="134.951"
                      x2="868.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint249_linear_375_1247"
                      x1="865.205"
                      y1="157.951"
                      x2="868.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint250_linear_375_1247"
                      x1="861.205"
                      y1="134.951"
                      x2="864.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint251_linear_375_1247"
                      x1="861.205"
                      y1="157.951"
                      x2="864.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint252_linear_375_1247"
                      x1="869.205"
                      y1="134.951"
                      x2="872.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint253_linear_375_1247"
                      x1="869.205"
                      y1="157.951"
                      x2="872.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint254_linear_375_1247"
                      x1="873.205"
                      y1="134.951"
                      x2="876.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint255_linear_375_1247"
                      x1="873.205"
                      y1="157.951"
                      x2="876.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint256_linear_375_1247"
                      x1="877.205"
                      y1="134.951"
                      x2="880.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint257_linear_375_1247"
                      x1="877.205"
                      y1="157.951"
                      x2="880.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint258_linear_375_1247"
                      x1="881.205"
                      y1="134.951"
                      x2="884.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint259_linear_375_1247"
                      x1="881.205"
                      y1="157.951"
                      x2="884.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint260_linear_375_1247"
                      x1="885.205"
                      y1="134.951"
                      x2="888.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint261_linear_375_1247"
                      x1="885.205"
                      y1="157.951"
                      x2="888.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint262_linear_375_1247"
                      x1="889.205"
                      y1="134.951"
                      x2="892.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint263_linear_375_1247"
                      x1="889.205"
                      y1="157.951"
                      x2="892.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint264_linear_375_1247"
                      x1="893.205"
                      y1="134.951"
                      x2="896.337"
                      y2="133.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint265_linear_375_1247"
                      x1="893.205"
                      y1="157.951"
                      x2="896.337"
                      y2="156.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint266_linear_375_1247"
                      x1="836.672"
                      y1="292.139"
                      x2="846.262"
                      y2="283.877"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint267_linear_375_1247"
                      x1="775.557"
                      y1="290.664"
                      x2="780.459"
                      y2="288.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint268_linear_375_1247"
                      x1="780.557"
                      y1="290.664"
                      x2="785.459"
                      y2="288.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint269_linear_375_1247"
                      x1="785.557"
                      y1="290.664"
                      x2="790.459"
                      y2="288.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint270_linear_375_1247"
                      x1="790.557"
                      y1="290.664"
                      x2="795.459"
                      y2="288.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint271_linear_375_1247"
                      x1="795.557"
                      y1="290.664"
                      x2="800.459"
                      y2="288.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint272_linear_375_1247"
                      x1="800.557"
                      y1="290.664"
                      x2="805.459"
                      y2="288.854"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint273_linear_375_1247"
                      x1="804.967"
                      y1="290.664"
                      x2="812.426"
                      y2="284.238"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint274_linear_375_1247"
                      x1="809.639"
                      y1="255.566"
                      x2="825.743"
                      y2="240.766"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint275_linear_375_1247"
                      x1="758.803"
                      y1="255.566"
                      x2="770.238"
                      y2="227.983"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint276_linear_375_1247"
                      x1="772.705"
                      y1="235.951"
                      x2="775.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint277_linear_375_1247"
                      x1="772.705"
                      y1="258.951"
                      x2="775.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint278_linear_375_1247"
                      x1="768.705"
                      y1="235.951"
                      x2="771.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint279_linear_375_1247"
                      x1="768.705"
                      y1="258.951"
                      x2="771.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint280_linear_375_1247"
                      x1="776.705"
                      y1="235.951"
                      x2="779.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint281_linear_375_1247"
                      x1="776.705"
                      y1="258.951"
                      x2="779.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint282_linear_375_1247"
                      x1="780.705"
                      y1="235.951"
                      x2="783.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint283_linear_375_1247"
                      x1="780.705"
                      y1="258.951"
                      x2="783.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint284_linear_375_1247"
                      x1="784.705"
                      y1="235.951"
                      x2="787.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint285_linear_375_1247"
                      x1="784.705"
                      y1="258.951"
                      x2="787.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint286_linear_375_1247"
                      x1="788.705"
                      y1="235.951"
                      x2="791.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint287_linear_375_1247"
                      x1="788.705"
                      y1="258.951"
                      x2="791.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint288_linear_375_1247"
                      x1="792.705"
                      y1="235.951"
                      x2="795.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint289_linear_375_1247"
                      x1="792.705"
                      y1="258.951"
                      x2="795.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint290_linear_375_1247"
                      x1="796.705"
                      y1="235.951"
                      x2="799.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint291_linear_375_1247"
                      x1="796.705"
                      y1="258.951"
                      x2="799.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint292_linear_375_1247"
                      x1="800.705"
                      y1="235.951"
                      x2="803.837"
                      y2="234.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint293_linear_375_1247"
                      x1="800.705"
                      y1="258.951"
                      x2="803.837"
                      y2="257.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <radialGradient
                      id="paint294_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(724 278) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint295_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(724 290) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint296_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(757 278) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint297_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(757 290) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint298_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1123 218) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint299_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1123 222) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint300_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1123 226) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint301_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1127 218) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint302_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1127 222) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint303_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1127 226) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint304_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1131 218) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint305_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1135 218) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint306_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1131 222) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint307_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1135 222) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint308_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1131 226) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <radialGradient
                      id="paint309_radial_375_1247"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(1135 226) rotate(90) scale(1.5)"
                    >
                      <stop stop-color="#0A1122" />
                      <stop offset="1" stop-color="#8F9CDA" />
                    </radialGradient>
                    <linearGradient
                      id="paint310_linear_375_1247"
                      x1="1061"
                      y1="250.5"
                      x2="1058"
                      y2="250.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint311_linear_375_1247"
                      x1="1067"
                      y1="253.5"
                      x2="1064"
                      y2="253.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint312_linear_375_1247"
                      x1="1089"
                      y1="251.5"
                      x2="1086"
                      y2="251.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint313_linear_375_1247"
                      x1="1123"
                      y1="247.5"
                      x2="1120"
                      y2="247.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint314_linear_375_1247"
                      x1="1111"
                      y1="254.5"
                      x2="1108"
                      y2="254.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint315_linear_375_1247"
                      x1="1148"
                      y1="252.5"
                      x2="1145"
                      y2="252.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint316_linear_375_1247"
                      x1="1182"
                      y1="249.5"
                      x2="1179"
                      y2="249.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint317_linear_375_1247"
                      x1="1191"
                      y1="253.5"
                      x2="1188"
                      y2="253.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint318_linear_375_1247"
                      x1="1065"
                      y1="245"
                      x2="1089"
                      y2="245"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" stop-opacity="0" />
                      <stop offset="0.454411" stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint319_linear_375_1247"
                      x1="1077"
                      y1="244"
                      x2="1077"
                      y2="246"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#56C7FF" stop-opacity="0" />
                      <stop offset="0.478642" stop-color="white" />
                      <stop offset="1" stop-color="#56C7FF" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint320_linear_375_1247"
                      x1="1154"
                      y1="247"
                      x2="1178"
                      y2="247"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" stop-opacity="0" />
                      <stop offset="0.454411" stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint321_linear_375_1247"
                      x1="1166"
                      y1="246"
                      x2="1166"
                      y2="248"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#56C7FF" stop-opacity="0" />
                      <stop offset="0.478642" stop-color="white" />
                      <stop offset="1" stop-color="#56C7FF" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint322_linear_375_1247"
                      x1="1077"
                      y1="254"
                      x2="1101"
                      y2="254"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" stop-opacity="0" />
                      <stop offset="0.454411" stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint323_linear_375_1247"
                      x1="1089"
                      y1="253"
                      x2="1089"
                      y2="255"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#56C7FF" stop-opacity="0" />
                      <stop offset="0.478642" stop-color="white" />
                      <stop offset="1" stop-color="#56C7FF" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint324_linear_375_1247"
                      x1="1117"
                      y1="255"
                      x2="1141"
                      y2="255"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" stop-opacity="0" />
                      <stop offset="0.454411" stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint325_linear_375_1247"
                      x1="1129"
                      y1="254"
                      x2="1129"
                      y2="256"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#56C7FF" stop-opacity="0" />
                      <stop offset="0.478642" stop-color="white" />
                      <stop offset="1" stop-color="#56C7FF" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint326_linear_375_1247"
                      x1="1099"
                      y1="250"
                      x2="1143"
                      y2="250"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="white" stop-opacity="0" />
                      <stop offset="0.454411" stop-color="white" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint327_linear_375_1247"
                      x1="1121"
                      y1="249"
                      x2="1121"
                      y2="251"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#56C7FF" stop-opacity="0" />
                      <stop offset="0.478642" stop-color="white" />
                      <stop offset="1" stop-color="#56C7FF" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="paint328_linear_375_1247"
                      x1="665.639"
                      y1="444.566"
                      x2="681.743"
                      y2="429.766"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint329_linear_375_1247"
                      x1="708.803"
                      y1="444.566"
                      x2="720.238"
                      y2="416.983"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint330_linear_375_1247"
                      x1="706.705"
                      y1="436.951"
                      x2="709.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint331_linear_375_1247"
                      x1="706.705"
                      y1="413.951"
                      x2="709.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint332_linear_375_1247"
                      x1="710.705"
                      y1="436.951"
                      x2="713.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint333_linear_375_1247"
                      x1="710.705"
                      y1="413.951"
                      x2="713.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint334_linear_375_1247"
                      x1="702.705"
                      y1="436.951"
                      x2="705.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint335_linear_375_1247"
                      x1="702.705"
                      y1="413.951"
                      x2="705.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint336_linear_375_1247"
                      x1="698.705"
                      y1="436.951"
                      x2="701.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint337_linear_375_1247"
                      x1="698.705"
                      y1="413.951"
                      x2="701.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint338_linear_375_1247"
                      x1="694.705"
                      y1="436.951"
                      x2="697.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint339_linear_375_1247"
                      x1="694.705"
                      y1="413.951"
                      x2="697.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint340_linear_375_1247"
                      x1="690.705"
                      y1="436.951"
                      x2="693.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint341_linear_375_1247"
                      x1="690.705"
                      y1="413.951"
                      x2="693.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint342_linear_375_1247"
                      x1="686.705"
                      y1="436.951"
                      x2="689.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint343_linear_375_1247"
                      x1="686.705"
                      y1="413.951"
                      x2="689.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint344_linear_375_1247"
                      x1="682.705"
                      y1="436.951"
                      x2="685.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint345_linear_375_1247"
                      x1="682.705"
                      y1="413.951"
                      x2="685.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint346_linear_375_1247"
                      x1="678.705"
                      y1="436.951"
                      x2="681.837"
                      y2="435.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <linearGradient
                      id="paint347_linear_375_1247"
                      x1="678.705"
                      y1="413.951"
                      x2="681.837"
                      y2="412.602"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="1" stop-color="#8F9CDA" />
                    </linearGradient>
                    <clipPath id="clip0_375_1247">
                      <rect width="1200" height="448" fill="white" />
                    </clipPath>
                    <clipPath id="clip1_375_1247">
                      <rect width="24" height="2" fill="white" transform="translate(1065 244)" />
                    </clipPath>
                    <clipPath id="clip2_375_1247">
                      <rect width="24" height="2" fill="white" transform="translate(1154 246)" />
                    </clipPath>
                    <clipPath id="clip3_375_1247">
                      <rect width="24" height="2" fill="white" transform="translate(1077 253)" />
                    </clipPath>
                    <clipPath id="clip4_375_1247">
                      <rect width="24" height="2" fill="white" transform="translate(1117 254)" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <ScrollArea className=" flex-[0_0_100%] h-full min-w-0 p-8 overflow-y-hidden relative">
                <Welcome />
              </ScrollArea>
              <ScrollArea className=" flex-[0_0_100%] h-full min-w-0 p-8 overflow-y-hidden relative">
                <Setup />
              </ScrollArea>
              <ScrollArea className={`flex-[0_0_100%] h-full min-w-0 p-8 pb-0 relative `}>
                <Export tailwindCSSOutput={tailwindCSSOutput} exportFormat={formValues.exportFormat} />
              </ScrollArea>
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
