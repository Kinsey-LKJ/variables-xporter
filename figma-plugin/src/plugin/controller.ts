import { TVariableCollection, TVariable } from '../lib/type';

figma.showUI(__html__, { height: 500, width: 400 });

figma.payments.setPaymentStatusInDevelopment({
  type: 'UNPAID',
})

// get github settings
function getLocalData (key) {
  console.log(key)
  console.log(figma.clientStorage.getAsync(key))
  return figma.clientStorage.getAsync(key)
}

// set github settings
function setLocalData (key, data) {
  figma.clientStorage.setAsync(key, data)
}

// send github data to UI
function init () {
  getLocalData('github-data')
    .then(githubData => {
      figma.ui.postMessage({ type: 'github-data-got', githubData })
    })
  // getLocalData('webhookData')
  //   .then(webhookData => {
  //     figma.ui.postMessage({ type: 'webhookDataGot', webhookData })
  //   })
}

// init()


async function checkAndRunPaidFeatureCode(message: string, paidFeature: string, paidSuccess: string, paidError: string) {
  console.log(figma.payments.status.type)
  if (figma.payments.status.type === "UNPAID") {
    figma.notify(`${message} ${paidFeature}`)
    await figma.payments.initiateCheckoutAsync({
      interstitial: "PAID_FEATURE",
    })
    if (figma.payments.status.type === "UNPAID") {
      figma.notify(message)
      figma.ui.postMessage({ type: 'check-and-run-paid-feature-code-result', result: false })
    }else if(figma.payments.status.type === "NOT_SUPPORTED") {
      figma.notify(paidError)
      figma.ui.postMessage({ type: 'check-and-run-paid-feature-code-result', result: false })
    }
  }

  if (figma.payments.status.type === "PAID") {
    figma.notify(paidSuccess)
    figma.ui.postMessage({ type: 'check-and-run-paid-feature-code-result', result: true })
  }


}

figma.ui.onmessage = msg => {
  switch (msg.type) {
    case 'set-github-data':
      console.log(msg)
      setLocalData('github-data', msg.githubData)
      break

    case 'check-and-run-paid-feature-code':
      checkAndRunPaidFeatureCode(msg.message, msg.paidFeature, msg.paidSuccess, msg.paidError)
      break

    case 'cancel':
      figma.closePlugin()
      break
  }
}


figma.variables.getLocalVariableCollectionsAsync().then((collections) => {
  const simplifiedCollections: TVariableCollection[] = collections.map(
    (collection) => ({
      id: collection.id,
      name: collection.name,
      hiddenFromPublishing: collection.hiddenFromPublishing,
      remote: collection.remote,
      variableIds: collection.variableIds,
      modes: collection.modes,
      defaultModeId: collection.defaultModeId,
      key: collection.key,
    })
  );


  figma.variables.getLocalVariablesAsync().then((variables) => {
    const simplifiedVariables: TVariable[] = variables.map((variable) => ({
      id: variable.id,
      name: variable.name,
      remote: variable.remote,
      key: variable.key,
      description: variable.description,
      hiddenFromPublishing: variable.hiddenFromPublishing,
      valuesByMode: variable.valuesByMode,
      variableCollectionId: variable.variableCollectionId,
      resolvedType: variable.resolvedType,
      scopes: variable.scopes,
      codeSyntax: variable.codeSyntax,
    }));
    figma.ui.postMessage({
      type: "get-variables-data",
      data: {
        collections: simplifiedCollections,
        variables: simplifiedVariables,
      },
    });
  });
});

// figma.clientStorage.getAsync("github-data").then((githubData) => {
//   figma.ui.postMessage({ type: 'github-data-got', githubData })
// })

// const selectCollection = collections[0]
// const selectVas = figma.variables.getLocalVariables().filter(item => item.variableCollectionId === selectCollection.id)
