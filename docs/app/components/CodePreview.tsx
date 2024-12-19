import React from 'react';
import { Tabs } from 'nextra/components';

interface CodePreviewProps {
  before: string;
  after: string;
  language?: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  before,
  after,
  language = 'css'
}) => {
  return (
    <Tabs items={['变量定义', '导出结果']}>
      <Tabs.Tab>
        ```{language}
        {before}
        ```
      </Tabs.Tab>
      <Tabs.Tab>
        ```{language}
        {after}
        ```
      </Tabs.Tab>
    </Tabs>
  );
};
