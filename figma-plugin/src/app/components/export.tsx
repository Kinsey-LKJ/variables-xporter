import { Button, Checkbox, Tooltip, Tabs, Modal, Card, Text, Divider, ScrollArea } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ColorProcessor, UnitConverter } from '../../lib/utils';
import * as changeCase from 'change-case';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboardAsync, copyToClipboard } from 'figx';
import { Clipboard, ClipboardList, Info } from 'lucide-react';
import prettier from 'prettier/standalone';
import parserEstree from 'prettier/plugins/estree';
import parserBabel from 'prettier/plugins/babel';
import { ExportFormat, TVariable, TVariableCollection } from '@/src/types/app';
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
  const { tailwindCSSOutput, exportFormat = 'Tailwind CSS V4' } = props;
  const { textData } = useContext(AppContext);
  const [opened, { open, close }] = useDisclosure(false);


  return (
    <div className=" grid gap-4 flex-[0_0_100%] h-full min-w-0 p-6 overflow-y-hidden relative">
      <div className="grid gap-3 text-center">
        <div className="text-4xl font-bold special-text">{textData.export_successful}</div>
      </div>

      {tailwindCSSOutput ? (
        <>
          <Text size="xs" className="text-center">
            <span> {textData.export_feedback_message_part1}</span>
            <span>
              <a
                href="https://github.com/Kinsey-LKJ/variables-xporter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300"
              >
                {textData.buy_me_coffee_link}
              </a>
            </span>
            <span> {textData.export_feedback_message_part2}</span>
            <span>
              <a
                href="https://variables-xporter.com/docs/organizing-your-variables"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300"
              >
                {textData.organization_guide_link}
              </a>
            </span>
            <span> {textData.export_feedback_message_part3}</span>
            <span>
              <a
                href="https://github.com/Kinsey-LKJ/variables-xporter/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300"
              >
                {textData.github_link}
              </a>
            </span>
            <span> {textData.export_feedback_message_part4}</span>
          </Text>
          {exportFormat === 'Tailwind CSS V3' || exportFormat === 'shadcn/ui (Tailwind CSS V3)' ? (
            <Tabs key={'tailwindCSSOutput'} defaultValue="tw-config" className="h-auto !flex !flex-col overflow-hidden">
              <Tabs.List className="sticky top-0 z-10">
                <Tabs.Tab value="tw-config">tailwind.config.js</Tabs.Tab>
                <Tabs.Tab value="tw-css">global.css</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="tw-config" className=" overflow-hidden relative">
                <ScrollArea
                  style={{
                    background: 'rgb(32 37 46)',
                    borderRadius: '0 0 0.5rem 0.5rem',
                  }}
                >
                  <div className="w-full h-full rounded-b-sm flex  justify-center relative overflow-x-hidden">
                    <div className="w-full h-full">
                      <SyntaxHighlighter
                        language="javascript"
                        wrapLongLines={true}
                        style={coldarkDark}
                        customStyle={
                          {
                            padding: '1rem',
                            background: 'transparent',
                            margin: 0,
                          } as React.CSSProperties
                        }
                      >
                        {tailwindCSSOutput.config}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </ScrollArea>
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="!absolute top-2 right-4 p-0! size-9!"
                  onClick={() => {
                    copyToClipboard(`${tailwindCSSOutput.config}`);
                  }}
                >
                  <ClipboardList />
                </Button>
              </Tabs.Panel>

              <Tabs.Panel value="tw-css" className=" overflow-hidden relative">
                <ScrollArea
                  style={{
                    background: 'rgb(32 37 46)',
                    borderRadius: '0 0 0.5rem 0.5rem',
                  }}
                >
                  <div className="w-full h-full rounded-b-sm flex justify-center relative overflow-x-hidden">
                    <div className="w-full">
                      <SyntaxHighlighter
                        language="css"
                        style={coldarkDark}
                        customStyle={
                          {
                            padding: '1rem',
                            background: 'transparent',
                            margin: 0,
                          } as React.CSSProperties
                        }
                      >
                        {tailwindCSSOutput.globalsCSS}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </ScrollArea>
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="!absolute top-2 right-4 p-0! size-9!"
                  onClick={() => {
                    copyToClipboard(`${tailwindCSSOutput.globalsCSS}`);
                  }}
                >
                  <ClipboardList />
                </Button>
              </Tabs.Panel>
            </Tabs>
          ) : (
            <Tabs key={'cssOutput'} defaultValue="css" className="h-auto !flex !flex-col overflow-hidden">
              <Tabs.List className="sticky top-0 z-10">
                <Tabs.Tab value="css">css</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="css" className=" overflow-hidden relative">
                <ScrollArea
                  style={{
                    background: 'rgb(32 37 46)',
                    borderRadius: '0 0 0.5rem 0.5rem',
                  }}
                >
                  <div className="w-full h-full rounded-b-sm flex  justify-center relative overflow-x-hidden">
                    <div className="w-full">
                      <SyntaxHighlighter
                        language="css"
                        style={coldarkDark}
                        customStyle={
                          {
                            padding: '1rem',
                            background: 'transparent',
                            margin: 0,
                          } as React.CSSProperties
                        }
                      >
                        {tailwindCSSOutput.globalsCSS}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </ScrollArea>
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="!absolute top-2 right-4 p-0! size-9!"
                  onClick={() => {
                    copyToClipboard(`${tailwindCSSOutput.globalsCSS}`);
                  }}
                >
                  <ClipboardList />
                </Button>
              </Tabs.Panel>
            </Tabs>
          )}
        </>
      ) : null}
    </div>
  );
};

export default React.memo(Export);
