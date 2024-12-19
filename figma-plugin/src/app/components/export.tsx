import { Button, Checkbox, Tooltip, Tabs, Modal } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import { useContext, useEffect, useMemo, useState } from 'react';
import { processColorValue as rgbObjectToColorString, processConstantValue as getCssValue } from '../../lib/utils2';
import * as changeCase from 'change-case';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboardAsync, copyToClipboard } from 'figx';
import { Clipboard, ClipboardList, Info } from 'lucide-react';
import prettier from 'prettier/standalone';
import parserEstree from 'prettier/plugins/estree';
import parserBabel from 'prettier/plugins/babel';
import { ExportFormat, TVariable, TVariableCollection } from '@/src/lib/type';
import React from 'react';
import { AppContext } from './App';
import { useDisclosure } from '@mantine/hooks';

interface ExportProps {
  tailwindCSSOutput: {
    config?: string;
    globalsCSS?: string;
  };
  exportFormat: ExportFormat;
}

const Export = (props: ExportProps) => {
  const { tailwindCSSOutput, exportFormat } = props;
  const { textData } = useContext(AppContext);
  const [opened, { open, close }] = useDisclosure(false);
  console.log(exportFormat);
  return (
    <div className=" grid gap-4">
      <div className="grid gap-3 text-center">
        <div className="text-4xl font-bold special-text">{textData.export_successful}</div>
        {exportFormat === 'Tailwind CSS' ? (
          <div className=" text-sm">{textData.import_as_tailwind_css_presets}</div>
        ) : null}
      </div>

      {tailwindCSSOutput ? (
        exportFormat === 'Tailwind CSS' ? (
          <Tabs
            key={'tailwindCSSOutput'}
            defaultValue="tw-config"
            className="h-auto grid gap-6 overflow-visible"
          >
            <Tabs.List className=' sticky top-0 bg-background z-10'>
              <Tabs.Tab value="tw-config">tailwind.config</Tabs.Tab>
              <Tabs.Tab value="tw-css">css</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="tw-config" className=" overflow-hidden">
              <div className="w-full h-full pb-8 rounded-b-sm flex items-center justify-center relative overflow-x-hidden">
                <div className="w-full h-full">
                  <Button
                    type="button"
                    variant="subtle"
                    size="icon"
                    className="!absolute top-2 right-2 !p-0 !size-9"
                    onClick={() => {
                      copyToClipboard(`${tailwindCSSOutput.config}`);
                    }}
                  >
                    <ClipboardList />
                  </Button>

                  <SyntaxHighlighter
                    language="javascript"
                    wrapLongLines={true}
                    style={coldarkDark}
                    customStyle={
                      {
                        padding: '1rem',
                        marginTop: 0,
                        background: 'rgb(43 43 42)',
                        borderRadius: '0.5rem',
                      } as React.CSSProperties
                    }
                  >
                    {tailwindCSSOutput.config}
                  </SyntaxHighlighter>
                </div>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="tw-css" className=" overflow-hidden">
              <div className="w-full h-full pb-8 rounded-b-sm flex items-center justify-center relative overflow-x-hidden">
                <div className="w-full">
                  <Button
                    type="button"
                    variant="subtle"
                    size="icon"
                    className="!absolute top-2 right-2 !p-0 !size-9"
                    onClick={() => {
                      copyToClipboard(`${tailwindCSSOutput.globalsCSS}`);
                    }}
                  >
                    <ClipboardList />
                  </Button>
                  <SyntaxHighlighter
                    language="css"
                    style={coldarkDark}
                    customStyle={
                      {
                        padding: '1rem',
                        marginTop: 0,
                        background: 'rgb(43 43 42)',
                        borderRadius: '0.5rem',
                      } as React.CSSProperties
                    }
                  >
                    {tailwindCSSOutput.globalsCSS}
                  </SyntaxHighlighter>
                </div>
              </div>
            </Tabs.Panel>
          </Tabs>
        ) : (
          <Tabs key={'cssOutput'} defaultValue="css" className="h-auto grid gap-6 overflow-visible">
            <Tabs.List className='sticky top-0 bg-background z-10'>
              <Tabs.Tab value="css">css</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="css" className=" overflow-hidden">
              <div className="w-full h-full pb-8 rounded-b-sm flex items-center justify-center relative overflow-x-hidden">
                <div className="w-full">
                  <Button
                    type="button"
                    variant="subtle"
                    size="icon"
                    className="!absolute top-2 right-2 !p-0 !size-9"
                    onClick={() => {
                      copyToClipboard(`${tailwindCSSOutput.globalsCSS}`);
                    }}
                  >
                    <ClipboardList />
                  </Button>
                  <SyntaxHighlighter
                    language="css"
                    style={coldarkDark}
                    customStyle={
                      {
                        padding: '1rem',
                        marginTop: 0,
                        background: 'rgb(43 43 42)',
                        borderRadius: '0.5rem',
                      } as React.CSSProperties
                    }
                  >
                    {tailwindCSSOutput.globalsCSS}
                  </SyntaxHighlighter>
                </div>
              </div>
            </Tabs.Panel>
          </Tabs>
        )
      ) : null}
    </div>
  );
};

export default React.memo(Export);
