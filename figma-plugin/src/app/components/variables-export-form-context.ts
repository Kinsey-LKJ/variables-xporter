// form-context.ts file
import { ExportFormat } from '@/src/types/app';
import { createFormContext } from '@mantine/form';

interface VariableFormValues {
  selectCollectionID: string;
  useRemUnit: boolean;
  selectVariableGroup: string[];
  ignoreTailwindColor: boolean;
  fileName: string;
  updateMessage: string;
  exportFormat:ExportFormat;
  rootElementSize: number;
  windowSize: 'large' | 'medium' | 'small';
}

// You can give context variables any name
export const [VariableFormProvider, useVariableFormContext, useVariableForm] = createFormContext<VariableFormValues>();
