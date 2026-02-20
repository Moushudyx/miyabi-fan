import {
  CREATE_COMMENT,
  createCallExpression,
  createCompoundExpression,
  createConditionalExpression,
  createSequenceExpression,
  createSimpleExpression,
  createStructuralDirectiveTransform,
  createVNodeCall,
  FRAGMENT,
  processIf,
  traverseNode,
  type NodeTransform,
  type RootNode,
  type TemplateChildNode
} from '@vue/compiler-core'
// import { createCommentVNode } from 'vue'
// import { ssrTransformIf } from '@vue/compiler-ssr'

/** @vue/compiler-ssr 没有导出 ssrTransformIf, 但需要它来处理 SSR 场景 */
export const ssrTransformIf: NodeTransform = createStructuralDirectiveTransform(
  /^(?:if|else|else-if)$/,
  processIf,
)

/** PatchFlags.STABLE_FRAGMENT, Vue3 的静态优化机制, 见 https://github.com/vuejs/core/blob/main/packages/shared/src/patchFlags.ts */
const STABLE_FRAGMENT = 1 << 6

/** 用于获取唯一索引键 */
const getIndexedKeyCache = new WeakMap<RootNode, number>()

/** 获取一个不会重复的索引键 */
function getIndexedKey(contextRoot: RootNode) {
  let current = getIndexedKeyCache.get(contextRoot)
  if (current === undefined) current = 0
  getIndexedKeyCache.set(contextRoot, current + 1)
  return current
}

/**
 * 实现懒加载的 v-show 功能, 请将此功能添加进 `vue.compilerOptions.nodeTransforms` 中\
 * 如果发生 Typescript 报错(我也不想的), 请使用 `as any`\
 * 警告: 请勿使用 `v-if.lazy` 的写法, 因为这会导致指令解析失败, 目前的实现只能识别 `v-lazy-if` `v-lazy-show` `v-show.lazy` 的写法
 */
export const transformLazyIf = createStructuralDirectiveTransform(
  /^(?:lazy-(?:if|show)|(?:if|show))$/,
  (node, dir, context) => {
    // 特殊场景: 不是 lazy 的指令正常处理
    const isLazy = dir.name.startsWith('lazy-') || dir.modifiers.some((item) => item.content === 'lazy')
    if (!isLazy) return () => node.props.push(dir)

    // 预处理: 指令名称, 用于报错和警告
    const directiveName = /^lazy-(?:if|show)$/.test(dir.name) ? dir.name : dir.name + '.lazy'

    // 预处理: 参数清洗
    if (!dir.exp) throw new Error(`Directive ${directiveName} requires an expression.`)
    const originExp = dir.exp
    if (originExp.loc.source) dir.exp = createSimpleExpression(originExp.loc.source)
    node.props
      .forEach((prop) => {
        // 不处理事件绑定
        if (prop.name === 'on') return
        // AttributeNode 没有 exp
        // CompoundExpressionNode 没有 exp.content
        if ('exp' in prop && prop.exp && 'content' in prop.exp && prop.exp.loc.source) {
          prop.exp = createSimpleExpression(prop.exp.loc.source)
        }
      })

    // 特殊场景处理: 如果用在 template 上或者 SSR 时, 则转换为 v-if, 因为这两种场景下无法实现 v-show 的效果
    const isTemplate = node.tag === 'template'
    const isSSR = context.inSSR || context.ssr
    // 特殊场景: 如果用在 template 上则转换为 v-if
    // 未来计划: 智能降级策略, 如果 template 下只有一个元素且其上没有 v-show 或 v-if, 则直接在该元素上添加
    // const originIsShow = dir.name.endsWith('show')
    if (isTemplate) {
      // if (originIsShow) throw new Error(`Directive lazy-show can not be used on <template>`)
      // 弹出警告
      console.warn(`Directive ${directiveName} can not be used on <template>, fallback to v-if`)
      node.props.push({
        ...dir,
        name: 'if',
        modifiers: dir.modifiers.filter((item) => item.content !== 'lazy'),
      })
      if (isSSR) ssrTransformIf(node, context)
      return
    }

    // 特殊场景: SSR 时, 转换为 v-if
    if (isSSR) {
      node.props.push({
        ...dir,
        // name: originIsShow ? 'show' : 'if',
        name: 'if',
        modifiers: dir.modifiers.filter((item) => item.content !== 'lazy'),
      })
      // console.log(context.nodeTransforms)
      ssrTransformIf(node, context)
      // context.nodeTransforms[1]!(node, context)
      return
    }

    // 具体处理: 添加一个唯一的键, 指示当前元素是否展示过, 如果没有展示过则是类似 v-if 逻辑, 展示过则是 v-show 逻辑
    // 类 v-if 逻辑: 当没有渲染过且输入值为 假值 时, 渲染一个注释节点, 否则生成一个 Fragment 包裹的节点
    // v-show 逻辑: 直接添加 show 指令到节点上
    const indexedKey = '_lz_if_' + getIndexedKey(context.root)
    /** 实现一个 Fragment 包裹的节点 */
    const wrappedNode = createVNodeCall(
      context,
      context.helper(FRAGMENT),
      undefined, // 没有 props
      [node],
      STABLE_FRAGMENT, // PatchFlags.STABLE_FRAGMENT, Vue3 的静态优化机制
      undefined, // 没有 dynamicProps
      undefined, // 没有 directives
      true, // isBlock, Vue3 的静态优化机制
      false, // disableTracking
      false, // isComponent
      node.loc,
    )
    // 类 v-if 逻辑: 用三元表达式模拟一个 v-if
    const wrapper = createConditionalExpression(
      // 编译的结果是: _cache.{indexedKey} || 原表达式
      createCompoundExpression([`_cache.${indexedKey}`, '||', originExp]),
      // 逗号表达式, 展示前执行一次赋值, 将缓存的值设置为 true
      createSequenceExpression([
        createCompoundExpression([`_cache.${indexedKey} = true`]),
        wrappedNode,
      ]),
      // 这里不写 createVNodeCall 是因为嫌麻烦
      createCallExpression(context.helper(CREATE_COMMENT), [
        '"lazy-load-placeholder"',
        'true', // isBlock, Vue3 的静态优化机制
      ]),
    )
    // v-show 逻辑
    node.props.push({
      ...dir,
      name: 'show',
      modifiers: dir.modifiers.filter(modifier => modifier.content !== 'lazy'),
    })
    // 替换节点
    context.replaceNode(wrapper as unknown as TemplateChildNode)

    // 确保子节点能得到正确处理
    const storageContext = { ...context }
    return () => {
      if (!node.codegenNode) traverseNode(node, storageContext)
    }
  }
)
