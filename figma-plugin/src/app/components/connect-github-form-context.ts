// form-context.ts file
import { createFormContext } from '@mantine/form';

export interface ConnectGithubFormValues {
  installationID: string;
  repoUrl:string
}

// You can give context variables any name
export const [ConnectGithubFormProvider, useConnectGithubFormContext, useConnectGithubForm] = createFormContext<ConnectGithubFormValues>();
