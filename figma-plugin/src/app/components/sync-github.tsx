import { useContext } from 'react';
import { AppContext } from './App';
import { Button, TextInput } from '@mantine/core';
import { useVariableFormContext } from './variables-export-form-context';

const SyncGithub = () => {
  const { connectGithubState, connectedRepoInfo } = useContext(AppContext);
  const form = useVariableFormContext();
  return (
    <div className="grid gap-4 justify-items-center">
      <div className=" text-center">准备向 {connectedRepoInfo?.name} 发起 Pull Request</div>
      <TextInput className=" w-full" placeholder="文件名" {...form.getInputProps('fileName')} />
      <TextInput className=" w-full" placeholder="更新说明" {...form.getInputProps('updateMessage')} />
    </div>
  );
};

export default SyncGithub;
