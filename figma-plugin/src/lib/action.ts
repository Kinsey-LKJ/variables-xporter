import { z } from 'zod';
import { FileContent } from '../types/app';

export const formSchema = z.object({
  selectCollectionID: z.string(),
  useRemUnit: z.boolean(),
});

// export async function sendInstallationIdAndRepo(
//   installationId: string,
//   repoUrl: string,
//   repoOwner: string,
//   repoName: string,
//   apiUrl: "submit" | "check-auth"
// ) {
//   fetch(`http://localhost:3000/api/${apiUrl}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ installationId, repoUrl, repoOwner, repoName }),
//   })
//     .then(async (response) => {
//       const responseData = await response.json();
//       if (response.ok) {
//         console.log("请求成功:", responseData.message);
//       } else {
//         console.log("请求失败:", responseData.error);
//       }
//     })
//     .catch((error) => {
//       console.error("请求错误:", error);
//     });
// }

export async function sendInstallationIdAndRepo(
  installationId: string,
  repoUrl: string,
  repoOwner: string,
  repoName: string,
  apiUrl: 'submit' | 'check-auth'
) {
  try {
    console.log({ installationId, repoOwner, repoName });
    const response = await fetch(`http://localhost:3000/api/${apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ installationId, repoOwner, repoName }),
    });

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      console.error('Server returned an error:', errorData);
      return false;
    }
  } catch (error) {
    console.error('请求错误:', error);
    return false;
  }
}

export async function submitFormAction(
  repoOwner: string,
  repoName: string,
  fileName: string,
  updateMessage: string,
  fileContents: FileContent[],
  installationId: string
) {
  try {
     await fetch('http://localhost:3000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoOwner,
        repoName,
        fileName,
        updateMessage,
        fileContents,
        installationId,
      }),
    });

    console.log("提交成功！")
  } catch (error) {
    throw error;
  }
}
