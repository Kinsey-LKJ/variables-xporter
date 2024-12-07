export async function getAllcollections(): Promise<{
  allCollections: VariableCollection[];
}> {
  try {
    const allCollectionsPromise = new Promise<VariableCollection[]>(
      (resolve, reject) => {
        onmessage = (event: MessageEvent) => {
          const pluginMessage = event.data.pluginMessage;
          console.log(pluginMessage);
          if (pluginMessage.type === "get-all-collections") {
            resolve(pluginMessage.allCollections);
          } else {
            reject("No appropriate message received");
          }
        };
      }
    );

    const data = await Promise.all([allCollectionsPromise]);

    const allCollections = data[0];

    return { allCollections };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch all collections.");
  }
}
