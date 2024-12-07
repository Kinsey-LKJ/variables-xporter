/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************************!*\
  !*** ./src/plugin/controller.ts ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
figma.showUI(__html__, { height: 500, width: 400 });
// get github settings
function getLocalData(key) {
    console.log(key);
    console.log(figma.clientStorage.getAsync(key));
    return figma.clientStorage.getAsync(key);
}
// set github settings
function setLocalData(key, data) {
    figma.clientStorage.setAsync(key, data);
}
// send github data to UI
function init() {
    getLocalData('github-data')
        .then(githubData => {
        figma.ui.postMessage({ type: 'github-data-got', githubData });
    });
    // getLocalData('webhookData')
    //   .then(webhookData => {
    //     figma.ui.postMessage({ type: 'webhookDataGot', webhookData })
    //   })
}
// init()
figma.ui.onmessage = msg => {
    switch (msg.type) {
        case 'set-github-data':
            console.log(msg);
            setLocalData('github-data', msg.githubData);
            break;
        case 'cancel':
            figma.closePlugin();
            break;
    }
};
figma.variables.getLocalVariableCollectionsAsync().then((collections) => {
    const simplifiedCollections = collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        hiddenFromPublishing: collection.hiddenFromPublishing,
        remote: collection.remote,
        variableIds: collection.variableIds,
        modes: collection.modes,
        defaultModeId: collection.defaultModeId,
        key: collection.key,
    }));
    figma.variables.getLocalVariablesAsync().then((variables) => {
        const simplifiedVariables = variables.map((variable) => ({
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5qcyIsIm1hcHBpbmdzIjoiOztVQUFBO1VBQ0E7Ozs7O1dDREE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7QUNOQSx5QkFBeUIseUJBQXlCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IscUNBQXFDO0FBQ3BFLEtBQUs7QUFDTDtBQUNBO0FBQ0Esa0NBQWtDLHFDQUFxQztBQUN2RSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNTO0FBQ1Y7QUFDQSw0QkFBNEIscUNBQXFDO0FBQ2pFLElBQUk7QUFDSjtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmlnbWEtcGx1Z2luL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2ZpZ21hLXBsdWdpbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2ZpZ21hLXBsdWdpbi8uL3NyYy9wbHVnaW4vY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgcmVxdWlyZSBzY29wZVxudmFyIF9fd2VicGFja19yZXF1aXJlX18gPSB7fTtcblxuIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IGhlaWdodDogNTAwLCB3aWR0aDogNDAwIH0pO1xuLy8gZ2V0IGdpdGh1YiBzZXR0aW5nc1xuZnVuY3Rpb24gZ2V0TG9jYWxEYXRhKGtleSkge1xuICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgY29uc29sZS5sb2coZmlnbWEuY2xpZW50U3RvcmFnZS5nZXRBc3luYyhrZXkpKTtcbiAgICByZXR1cm4gZmlnbWEuY2xpZW50U3RvcmFnZS5nZXRBc3luYyhrZXkpO1xufVxuLy8gc2V0IGdpdGh1YiBzZXR0aW5nc1xuZnVuY3Rpb24gc2V0TG9jYWxEYXRhKGtleSwgZGF0YSkge1xuICAgIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoa2V5LCBkYXRhKTtcbn1cbi8vIHNlbmQgZ2l0aHViIGRhdGEgdG8gVUlcbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgZ2V0TG9jYWxEYXRhKCdnaXRodWItZGF0YScpXG4gICAgICAgIC50aGVuKGdpdGh1YkRhdGEgPT4ge1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IHR5cGU6ICdnaXRodWItZGF0YS1nb3QnLCBnaXRodWJEYXRhIH0pO1xuICAgIH0pO1xuICAgIC8vIGdldExvY2FsRGF0YSgnd2ViaG9va0RhdGEnKVxuICAgIC8vICAgLnRoZW4od2ViaG9va0RhdGEgPT4ge1xuICAgIC8vICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IHR5cGU6ICd3ZWJob29rRGF0YUdvdCcsIHdlYmhvb2tEYXRhIH0pXG4gICAgLy8gICB9KVxufVxuLy8gaW5pdCgpXG5maWdtYS51aS5vbm1lc3NhZ2UgPSBtc2cgPT4ge1xuICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2V0LWdpdGh1Yi1kYXRhJzpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICAgICAgICBzZXRMb2NhbERhdGEoJ2dpdGh1Yi1kYXRhJywgbXNnLmdpdGh1YkRhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbCc6XG4gICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcbmZpZ21hLnZhcmlhYmxlcy5nZXRMb2NhbFZhcmlhYmxlQ29sbGVjdGlvbnNBc3luYygpLnRoZW4oKGNvbGxlY3Rpb25zKSA9PiB7XG4gICAgY29uc3Qgc2ltcGxpZmllZENvbGxlY3Rpb25zID0gY29sbGVjdGlvbnMubWFwKChjb2xsZWN0aW9uKSA9PiAoe1xuICAgICAgICBpZDogY29sbGVjdGlvbi5pZCxcbiAgICAgICAgbmFtZTogY29sbGVjdGlvbi5uYW1lLFxuICAgICAgICBoaWRkZW5Gcm9tUHVibGlzaGluZzogY29sbGVjdGlvbi5oaWRkZW5Gcm9tUHVibGlzaGluZyxcbiAgICAgICAgcmVtb3RlOiBjb2xsZWN0aW9uLnJlbW90ZSxcbiAgICAgICAgdmFyaWFibGVJZHM6IGNvbGxlY3Rpb24udmFyaWFibGVJZHMsXG4gICAgICAgIG1vZGVzOiBjb2xsZWN0aW9uLm1vZGVzLFxuICAgICAgICBkZWZhdWx0TW9kZUlkOiBjb2xsZWN0aW9uLmRlZmF1bHRNb2RlSWQsXG4gICAgICAgIGtleTogY29sbGVjdGlvbi5rZXksXG4gICAgfSkpO1xuICAgIGZpZ21hLnZhcmlhYmxlcy5nZXRMb2NhbFZhcmlhYmxlc0FzeW5jKCkudGhlbigodmFyaWFibGVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbXBsaWZpZWRWYXJpYWJsZXMgPSB2YXJpYWJsZXMubWFwKCh2YXJpYWJsZSkgPT4gKHtcbiAgICAgICAgICAgIGlkOiB2YXJpYWJsZS5pZCxcbiAgICAgICAgICAgIG5hbWU6IHZhcmlhYmxlLm5hbWUsXG4gICAgICAgICAgICByZW1vdGU6IHZhcmlhYmxlLnJlbW90ZSxcbiAgICAgICAgICAgIGtleTogdmFyaWFibGUua2V5LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhcmlhYmxlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgaGlkZGVuRnJvbVB1Ymxpc2hpbmc6IHZhcmlhYmxlLmhpZGRlbkZyb21QdWJsaXNoaW5nLFxuICAgICAgICAgICAgdmFsdWVzQnlNb2RlOiB2YXJpYWJsZS52YWx1ZXNCeU1vZGUsXG4gICAgICAgICAgICB2YXJpYWJsZUNvbGxlY3Rpb25JZDogdmFyaWFibGUudmFyaWFibGVDb2xsZWN0aW9uSWQsXG4gICAgICAgICAgICByZXNvbHZlZFR5cGU6IHZhcmlhYmxlLnJlc29sdmVkVHlwZSxcbiAgICAgICAgICAgIHNjb3BlczogdmFyaWFibGUuc2NvcGVzLFxuICAgICAgICAgICAgY29kZVN5bnRheDogdmFyaWFibGUuY29kZVN5bnRheCxcbiAgICAgICAgfSkpO1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiBcImdldC12YXJpYWJsZXMtZGF0YVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBzaW1wbGlmaWVkQ29sbGVjdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiBzaW1wbGlmaWVkVmFyaWFibGVzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbmV4cG9ydCB7fTtcbi8vIGZpZ21hLmNsaWVudFN0b3JhZ2UuZ2V0QXN5bmMoXCJnaXRodWItZGF0YVwiKS50aGVuKChnaXRodWJEYXRhKSA9PiB7XG4vLyAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHsgdHlwZTogJ2dpdGh1Yi1kYXRhLWdvdCcsIGdpdGh1YkRhdGEgfSlcbi8vIH0pXG4vLyBjb25zdCBzZWxlY3RDb2xsZWN0aW9uID0gY29sbGVjdGlvbnNbMF1cbi8vIGNvbnN0IHNlbGVjdFZhcyA9IGZpZ21hLnZhcmlhYmxlcy5nZXRMb2NhbFZhcmlhYmxlcygpLmZpbHRlcihpdGVtID0+IGl0ZW0udmFyaWFibGVDb2xsZWN0aW9uSWQgPT09IHNlbGVjdENvbGxlY3Rpb24uaWQpXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=