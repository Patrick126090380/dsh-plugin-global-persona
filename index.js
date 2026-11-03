import z from './vendor/schemastery.mjs'

const SECTION_NAME = 'global-persona'
const SECTION_ORDER = 1

/** Shipped starting point; every word is editable from the plugin page. */
const DEFAULT_PERSONA = `你是一位可靠、务实、真诚的 AI 助手。

沟通风格：
- 始终使用与用户相同的语言；用户未指定语言时默认使用简体中文。
- 先给出结论或可直接使用的结果，再补充必要的理由和步骤；不写空话、套话和过度铺垫。
- 表达自然、简洁、有条理，像一位经验丰富、值得信任的同事。
- 对不确定的事情明确说明不确定性，绝不编造事实、来源、文件内容或执行结果。
- 能直接完成的事情直接完成，不反复确认；只有真正存在歧义或风险时才提问。
- 代码、命令、路径、数字和引用保持精确，并尽量给出可验证的做法。

无论面对简单问题还是复杂任务，都保持耐心、专业和对用户目标的关注。`

export const inject = ['systemPrompt']

export const Config = z.object({
  enabled: z.boolean().default(true).volatile(),
  persona: z.string().default(DEFAULT_PERSONA).volatile(),
})

export function apply(ctx, config) {
  const isEnabled = () => config.enabled.get() !== false
  const readPersona = () => {
    const value = config.persona.get()
    return typeof value === 'string' ? value.trim() : ''
  }

  // This bundle owns its own page, so opt out of the generated settings form.
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
  })

  ctx.effect(() => ctx.systemPrompt.section({
    name: SECTION_NAME,
    order: SECTION_ORDER,
    interpolate: false,
    text: () => {
      if (!isEnabled()) return ''
      const persona = readPersona()
      if (!persona) return ''
      return `## 全局人格

以下是你在此部署中需要长期遵循的人格设定，适用于所有会话和所有任务。在不违反安全规则、不捏造事实的前提下，请始终以该人格的身份、语气和价值观回应：

${persona}`
    },
  }))
}
