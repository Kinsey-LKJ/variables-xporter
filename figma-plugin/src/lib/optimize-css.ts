// 引入 css-tree
import * as csstree from 'css-tree';

/**
 * 通用 CSS 变量引用链优化 - 不依赖任何特定变量名
 */
export function optimizeCSSVariableReferences(cssText: string) {
  try {
    // 解析 CSS 为 AST
    const ast = csstree.parse(cssText);

    // 1. 构建完整的变量引用图谱
    const directRefs = new Map(); // 变量 -> 它直接引用的变量
    const reverseRefs = new Map(); // 变量 -> 直接引用它的变量
    const selectorVars = new Map(); // 选择器 -> 它定义的变量集合
    const rootVars = new Set(); // 根选择器中定义的所有变量
    
    // 2. 为每个变量构建完整的引用链（从根到叶）
    const completeChain = new Map(); // 变量 -> 引用它的所有上层变量链(从直接到间接)
    
    // 遍历所有规则和声明，构建基础引用关系
    csstree.walk(ast, {
      visit: 'Rule',
      enter: function(rule) {
        let selector;
        try {
          selector = csstree.generate(rule.prelude);
        } catch (e) {
          return;
        }
        
        const isRoot = selector === ':root' || selector === '@theme' || selector.includes('inline');
        
        if (!selectorVars.has(selector)) {
          selectorVars.set(selector, new Set());
        }
        
        // 处理该选择器中的所有变量声明
        csstree.walk(rule.block, {
          visit: 'Declaration',
          enter: function(decl) {
            if (decl.property.startsWith('--')) {
              const varName = decl.property;
              
              // 记录此选择器定义了此变量
              selectorVars.get(selector).add(varName);
              
              // 如果是根选择器，记录为根变量
              if (isRoot) {
                rootVars.add(varName);
              }
              
              // 提取变量值中的引用
              const value = csstree.generate(decl.value);
              const varRefs = value.match(/var\(--[^)]+\)/g) || [];
              
              if (varRefs.length > 0) {
                if (!directRefs.has(varName)) {
                  directRefs.set(varName, new Set());
                }
                
                varRefs.forEach(ref => {
                  // 提取引用的变量名
                  const varMatch = ref.match(/--[^,)]+/);
                  if (!varMatch) return;
                  
                  const refVarName = varMatch[0];
                  
                  // 记录直接引用
                  directRefs.get(varName).add(refVarName);
                  
                  // 记录反向引用
                  if (!reverseRefs.has(refVarName)) {
                    reverseRefs.set(refVarName, new Set());
                  }
                  reverseRefs.get(refVarName).add(varName);
                });
              }
            }
          }
        });
      }
    });
    
    console.log('直接引用关系构建完成，共', directRefs.size, '个变量有引用');
    console.log('反向引用关系构建完成，共', reverseRefs.size, '个变量被引用');
    
    // 3. 为每个变量构建完整的引用链
    // 从任何被引用的变量开始，递归查找所有引用它的上层变量
    function buildReferenceChain(varName, chain = new Set()) {
      if (!reverseRefs.has(varName)) {
        return chain; // 没有变量引用它，返回空链
      }
      
      // 获取所有直接引用此变量的变量
      const directlyReferencing = reverseRefs.get(varName);
      
      // 将所有直接引用加入链中
      for (const refVar of directlyReferencing) {
        chain.add(refVar);
        
        // 递归查找引用 refVar 的变量，将它们也加入链中
        buildReferenceChain(refVar, chain);
      }
      
      return chain;
    }
    
    // 为所有被引用的变量构建引用链
    for (const varName of reverseRefs.keys()) {
      completeChain.set(varName, buildReferenceChain(varName));
    }
    
    console.log('完整引用链构建完成，共', completeChain.size, '个变量');
    
    // 4. 分析每个非根选择器，检测其引用链断裂并准备注入
    const injectionsNeeded = new Map();
    
    for (const [selector, vars] of selectorVars.entries()) {
      // 跳过根选择器
      if (selector === ':root' || selector === '@theme' || selector.includes('inline')) {
        continue;
      }
      
      console.log(`分析选择器 ${selector} 中的 ${vars.size} 个变量`);
      
      // 从该选择器中声明的每个变量开始分析
      for (const varName of vars) {
        // 如果这个变量被其他变量引用，检查引用链
        if (reverseRefs.has(varName)) {
          console.log(`  检查变量 ${varName} 的引用链`);
          
          // 获取所有引用这个变量的变量（直接和间接）
          const allReferencingVars = completeChain.get(varName) || new Set();
          
          // 对于每个引用，检查是否需要在当前选择器中添加
          for (const refVar of allReferencingVars) {
            // 如果是根变量，并且当前选择器没有定义它，可能需要添加
            if (rootVars.has(refVar) && !vars.has(refVar)) {
              // 进一步检查：确保引用链中的中间变量已经在此选择器中定义
              
              // 检查此引用变量是否直接引用我们的变量
              let isDirectReference = false;
              if (directRefs.has(refVar)) {
                isDirectReference = directRefs.get(refVar).has(varName);
              }
              
              // 如果是直接引用，或者存在间接引用链，添加到注入列表
              if (isDirectReference) {
                console.log(`    添加直接引用: ${refVar} -> ${varName}`);
                
                if (!injectionsNeeded.has(selector)) {
                  injectionsNeeded.set(selector, new Map());
                }
                if (!injectionsNeeded.get(selector).has(varName)) {
                  injectionsNeeded.get(selector).set(varName, new Set());
                }
                injectionsNeeded.get(selector).get(varName).add(refVar);
              } else {
                // 寻找间接引用链中的最接近中间变量
                const indirectPath = findIndirectReferencePath(refVar, varName, directRefs);
                
                if (indirectPath.length > 0) {
                  // 找到间接引用路径
                  const intermediateVar = indirectPath[0]; // 取最近的一个中间变量
                  
                  console.log(`    添加间接引用: ${refVar} -> ${intermediateVar} -> ... -> ${varName}`);
                  
                  if (!injectionsNeeded.has(selector)) {
                    injectionsNeeded.set(selector, new Map());
                  }
                  if (!injectionsNeeded.get(selector).has(intermediateVar)) {
                    injectionsNeeded.get(selector).set(intermediateVar, new Set());
                  }
                  injectionsNeeded.get(selector).get(intermediateVar).add(refVar);
                }
              }
            }
          }
        }
      }
    }
    
    // 辅助函数：找出两个变量之间的引用路径（从refVar到varName）
    function findIndirectReferencePath(refVar, varName, directRefs, path = [], visited = new Set()) {
      // 防止循环引用
      if (visited.has(refVar)) {
        return [];
      }
      visited.add(refVar);
      
      // 检查是否有直接引用
      if (directRefs.has(refVar)) {
        const refs = directRefs.get(refVar);
        
        // 直接命中目标变量
        if (refs.has(varName)) {
          return [refVar, ...path];
        }
        
        // 尝试所有可能的引用路径
        for (const intermediateVar of refs) {
          const result = findIndirectReferencePath(
            intermediateVar, 
            varName, 
            directRefs, 
            [refVar, ...path], 
            new Set(visited)
          );
          
          if (result.length > 0) {
            return result;
          }
        }
      }
      
      return []; // 没有找到路径
    }
    
    console.log('需要注入的变量:', injectionsNeeded);
    
    // 5. 注入必要的中间变量引用
    for (const [selector, injections] of injectionsNeeded.entries()) {
      // 查找对应的规则
      csstree.walk(ast, {
        visit: 'Rule',
        enter: function(rule) {
          let ruleSelector;
          try {
            ruleSelector = csstree.generate(rule.prelude);
          } catch (e) {
            return;
          }
          
          if (ruleSelector === selector) {
            // 找到目标选择器，注入必要的变量引用
            for (const [refVar, upperVars] of injections.entries()) {
              for (const upperVar of upperVars) {
                try {
                  // 创建新的声明
                  const newDecl = {
                    type: 'Declaration',
                    property: upperVar,
                    value: {
                      type: 'Raw',
                      value: `var(${refVar})`
                    }
                  };
                  
                  // 将新声明添加到规则中
                  rule.block.children.push(csstree.fromPlainObject(newDecl));
                } catch (e) {
                  console.error('创建声明时出错:', e);
                  
                  // 备选方案：使用字符串解析
                  try {
                    const newDeclText = `${upperVar}: var(${refVar});`;
                    const newDeclAST = csstree.parse(newDeclText, {
                      context: 'declaration'
                    });
                    
                    // 将新声明添加到规则中
                    rule.block.children.push(newDeclAST);
                  } catch (innerE) {
                    console.error('备选方案也失败:', innerE);
                  }
                }
              }
            }
          }
        }
      });
    }
    
    // 6. 生成优化后的 CSS
    console.log('CSS 变量引用优化完成');
    return csstree.generate(ast);
  } catch (error) {
    console.error('CSS 处理出错:', error);
    return cssText; // 出错时返回原始 CSS
  }
}