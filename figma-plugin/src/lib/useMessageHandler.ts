import { useState, useEffect } from "react";

export function useMessageHandler<T>(
  messageType: string,
  initialState?: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const pluginMessage = event.data.pluginMessage;
      if (pluginMessage.type === messageType) {
        console.log("设置了")
        setState(pluginMessage.data);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [messageType]);

  return [state, setState];
}
