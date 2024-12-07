import { Button, Checkbox, Tooltip } from '@mantine/core';

import { Info, RefreshCcw } from 'lucide-react';
import { useVariableFormContext } from './variables-export-form-context';
import { useState, useCallback, useEffect, useContext } from 'react';
import { notifications } from '@mantine/notifications';
import { AppContext } from './App';
import SpecialButton from './special-button/special-button';

export interface NavProps {
  selectedSnap: number;
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
  formattingOutput: boolean;
  handleExport: () => void;
}

const HomeTabButton = (props: NavProps) => {
  const {
    selectedSnap,
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
    formattingOutput,
    handleExport,
  } = props;
  const { connectGithubState, openDrawer,textData } = useContext(AppContext);
  const form = useVariableFormContext();
  return (
    <div className=" grid gap-2 p-4 z-10 bg-gradient-to-t from-[#1A1A1A] from-80% to-100% absolute bottom-0 w-full">
      {selectedSnap === 2 ? (
        <div className=" grid gap-1  ">
          <Checkbox
            size="xs"
            defaultChecked={form.values.useRemUnit}
            label={textData.use_rem_as_unit}
            {...form.getInputProps('useRemUnit')}
          />
          <Checkbox
            size="xs"
            defaultChecked={form.values.ignoreTailwindColor}
            label={
              <div className=" flex gap-1">
                {textData.ignore_tailwind_css_default_palette}
                <Tooltip
                  multiline
                  w={220}
                  withArrow
                  transitionProps={{ duration: 200 }}
                  label={textData.ignore_default_palette_description}
                >
                  <Info size={16} />
                </Tooltip>
              </div>
            }
            {...form.getInputProps('ignoreTailwindColor')}
          />
        </div>
      ) : null}

      <div className="flex gap-4">
        {selectedSnap === 0 ? (
          <SpecialButton
            size="lg"
            fullWidth
            loaderProps={{
              size: 'sm',
            }}
            onClick={onNextButtonClick}
          >
            {textData.get_started}
          </SpecialButton>
        ) : null}

        {selectedSnap === 1 ? (
          <SpecialButton
            size="lg"
            fullWidth
            loaderProps={{
              size: 'sm',
            }}
            loading={formattingOutput}
            onClick={handleExport}
          >
            {textData.export}
          </SpecialButton>
        ) : null}

        {/* {selectedSnap === 1 ? (
          <SpecialButton
            size="lg"
            fullWidth
            // type="submit"
            leftSection={<RefreshCcw />}
            onClick={() => {
              if (connectGithubState !== 'successful') {
                openDrawer();
              } else {
                onNextButtonClick();
              }
            }}
          >
            GitHub
          </SpecialButton>
        ) : null}

        {selectedSnap === 2 ? (
          <SpecialButton type="submit" fullWidth size="lg">
            创建 Pull Request
          </SpecialButton>
        ) : null} */}
      </div>
    </div>
  );
};

export default HomeTabButton;
