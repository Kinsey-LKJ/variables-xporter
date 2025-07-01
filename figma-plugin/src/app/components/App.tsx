import { useState, useCallback, useEffect, createContext, useRef } from 'react';
import { TVariableCollection, TextData } from '@/src/types/app';
import { TVariable } from '@/src/types/app';
import { createFormContext, useForm } from '@mantine/form';
import { VariableFormProvider, useVariableForm } from './variables-export-form-context';
import useEmblaCarousel from 'embla-carousel-react';
import AutoHeight from 'embla-carousel-auto-height';
import SelectVariableGroups from './selectVariableGroups';
import Nav from './home-tab-button';
import { useCarouselApi } from '../../lib/hooks';
import Export from './export';
import {
  ConnectGithubFormProvider,
  ConnectGithubFormValues,
  useConnectGithubForm,
} from './connect-github-form-context';
import ConnectGithub from './connect-github';
import { useDisclosure } from '@mantine/hooks';
import { Badge, Button, Checkbox, Drawer, Menu, Modal, Select, Tooltip } from '@mantine/core';
import { ArrowLeft, BookText, ChevronLeftIcon, ChevronsDown, CircleAlert, EarthIcon, Github, Info, Settings } from 'lucide-react';
import { sendInstallationIdAndRepo } from '../../lib/action';
import gh from 'parse-github-url';
import ExportPage, { ExportPageHandles } from './export-page';
import { Result } from 'parse-github-url';
import { set } from 'zod';
import { notifications } from '@mantine/notifications';
import cn from '../zh.json';
import en from '../en.json';
import { translations } from '../dictionary';
import { Locale, defaultLocale, allLanguages } from '../dictionary';
import Setting from './setting';
import { Resizable } from 'react-resizable';
import AspectRatioResizable from './aspect-ratio-resizable';

const validateGithubURL = (url) => gh(url);

export interface GithubDataProps {
  installationId: string;
  repoUrl: string;
  repoName: '';
  repoOwner: '';
}

type GithubState = 'successful' | 'failed' | 'not-connected' | 'checking-in';

type GithubStateText = {
  [key in GithubState]: {
    value: string;
    color: string;
  };
};

const githubStateText: GithubStateText = {
  successful: {
    value: '已连接',
    color: '#16a34a',
  },
  failed: {
    value: '连接失败',
    color: '#ef4444',
  },
  'not-connected': {
    value: '未连接',
    color: '#94a3b8',
  },
  'checking-in': {
    value: '正在检查',
    color: '#3b82f6',
  },
};

interface ExtendedResult extends Result {
  installationID: string;
}

interface AppContextProps {
  language: Locale;
  textData: TextData;
  connectGithubState: GithubState;
  setConnectGithubState: React.Dispatch<React.SetStateAction<GithubState>>;
  connectedRepoInfo?: ExtendedResult;
  setConnectedRepoInfo: React.Dispatch<React.SetStateAction<Result>>;
  collections?: TVariableCollection[];
  variables?: TVariable[];
  openDrawer?: () => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export const AppContext = createContext<AppContextProps>({
  language: defaultLocale,
  textData: translations[defaultLocale],
  connectGithubState: 'not-connected',
  currentStep: 0,
  setConnectGithubState: () => {},
  setConnectedRepoInfo: () => {},
  setCurrentStep: () => {},
});

function App() {
  const [size, setSize] = useState({ width: 500, height: 625 });
  const [language, setLanguage] = useState<Locale>(defaultLocale);
  const [textData, setTextData] = useState(translations[language]);
  const [collections, setCollections] = useState<TVariableCollection[] | undefined>(undefined);
  const [variables, setVariables] = useState<TVariable[] | undefined>(undefined);
  const [connectGithubState, setConnectGithubState] = useState<GithubState>('not-connected');
  const [connectedRepoInfo, setConnectedRepoInfo] = useState<ExtendedResult>(undefined);

  const [currentStep, setCurrentStep] = useState(0);
  const exportPageRef = useRef<ExportPageHandles>();

  console.log(translations);

  useEffect(() => {
    setTextData(translations[language]);
  }, [language]);
  

  onmessage = async (event: MessageEvent) => {
    const msg = event.data.pluginMessage;
    switch (msg.type) {
      // case 'github-data-got':
      //   if (msg.githubData) {
      //     const formValues = msg.githubData;
      //     checkAuthStatus(formValues);
      //     connectGithubForm.setValues(formValues);
      //   }
      //   break;
      case 'get-variables-data':
        setCollections(msg.data.collections);
        setVariables(msg.data.variables);
        break;
      

      // case 'webhookDataGot':
      //   if (msg.webhookData) {
      //     this.setState({
      //       webhookData: msg.webhookData
      //     })
      //   }
      //   break
    }
  };



  const connectGithubForm = useConnectGithubForm({
    initialValues: {
      installationID: '',
      repoUrl: '',
    },
    validate: {
      installationID: (value: string) => {
        if (!value) {
          return '安装 ID 不能为空';
        }
        if (!/^\d+$/.test(value)) {
          return '安装 ID 应为数字';
        }
      },
      repoUrl: (value: string) => {
        if (!value) {
          return '仓库地址不能为空';
        }
        if (!/^https:\/\/github.com\/.*\/.*$/.test(value)) {
          return '请输入正确的仓库地址';
        }
      },
    },
  });

  const checkAuthStatus = async (data: ConnectGithubFormValues) => {
    setConnectGithubState('checking-in');
    try {
      const { name, owner } = validateGithubURL(data.repoUrl);
      const { installationID, repoUrl } = data;
      const res = await sendInstallationIdAndRepo(installationID, repoUrl, owner, name, 'check-auth');
      if (res) {
        setConnectGithubState('successful');
        setConnectedRepoInfo({ ...validateGithubURL(repoUrl), installationID: installationID });
        return true;
      } else {
        setConnectGithubState('failed');
        return false;
      }
    } catch (error) {
      setConnectGithubState('failed');

      console.error('检查连接状态时出现错误：', error);
      return false;
    }
  };

  console.log('App 重新渲染');

  return (
    <AppContext.Provider
      value={{
        language,
        textData,
        connectGithubState,
        setConnectGithubState,
        connectedRepoInfo,
        collections,
        variables,
        setConnectedRepoInfo,
        openDrawer: open,
        currentStep,
        setCurrentStep,
      }}
    >
      {/* <AspectRatioResizable> */}
        <div className="h-full grid grid-rows-[auto_1fr] relative overflow-hidden">
          <div className=" flex justify-between items-center p-2">
            <Button
              variant="subtle"
              leftSection={<ChevronLeftIcon />}
              className="!pl-1 !pr-3 nav-back-button"
              style={{
                opacity: currentStep === 0 ? 0 : 1,
                pointerEvents: currentStep === 0 ? 'none' : 'auto',
              }}
              onClick={() => {
                exportPageRef.current.onPrevButtonClick();
              }}
            >
              {textData.back}
            </Button>
            <div>
              <Button size="xs" variant="subtle" className=" text-xs">
                <BookText size={16} className=" mr-2" />
                {textData.documentation}
              </Button>

              <Button
                size="xs"
                variant="subtle"
                onClick={() => {
                  exportPageRef.current.openSetting();
                }}
              >
                <Settings size={16} className=" mr-2" />
                {textData.setting}
              </Button>
              <Menu>
                <Menu.Target>
                  <Button size="xs" variant="subtle">
                    <EarthIcon size={16} className=" mr-2" /> {translations[language].language}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  {Object.keys(translations).map((lang) => (
                    <Menu.Item key={lang} onClick={() => setLanguage(lang)}>
                      {translations[lang].language}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </div>

            {/* <ConnectGithubFormProvider form={connectGithubForm}>
            <Drawer.Root
              opened={opened}
              onClose={close}
              size={'80%'}
              position="top"
              className=" flex flex-col connect-github-drawer"
            >
              <ConnectGithub checkAuthStatus={checkAuthStatus} />
            </Drawer.Root>

            <Button variant="transparent" onClick={open} className="!p-0 !w-fit justify-self-end ">
              <Badge
                size="lg"
                leftSection={<Github size={16} />}
                style={{
                  borderColor: githubStateText[connectGithubState].color,
                  backgroundColor: `${githubStateText[connectGithubState].color}19`,
                  color: githubStateText[connectGithubState].color,
                }}
              >
                {githubStateText[connectGithubState].value}
              </Badge>
            </Button>
          </ConnectGithubFormProvider> */}
          </div>

          <ExportPage ref={exportPageRef}  />
        </div>
      {/* </AspectRatioResizable> */}
    </AppContext.Provider>
  );
}

export default App;
