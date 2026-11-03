window.__ModuleLoader__.load({
  id: 'dsh-plugin-global-persona',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'global-persona'
    const ENTRY_ID = 'global-persona'

    const en = {
      title: 'Global Persona',
      description: 'This persona is appended to the system prompt of every conversation. Saving applies it from the next turn on.',
      enabled: 'Enable global persona',
      personaLabel: 'Persona',
      placeholder: 'Describe how the assistant should speak and behave…',
      hint: 'Plain text; the “## 全局人格” heading is added automatically.',
      chars: '{count} characters',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved.',
      saveFailed: 'Could not save. Check the configuration and try again.',
      discard: 'Discard',
      loading: 'Reading configuration…',
      unavailable: 'This entry is not configurable in the current session. Make sure the plugin is enabled, then refresh the page.',
      readOnly: 'This configuration is read-only in the current session.',
      empty: 'The persona is empty, so nothing is injected right now.',
      summary: 'Enabled',
      summaryOff: 'Disabled',
    }

    const zh = {
      title: '全局人格',
      description: '这段人格会加入每个会话的系统提示；保存后从下一轮对话开始生效。',
      enabled: '启用全局人格',
      personaLabel: '人格设定',
      placeholder: '描述助手应该如何表达与行动……',
      hint: '纯文本；保存时会自动加上“## 全局人格”标题。',
      chars: '{count} 字',
      save: '保存',
      saving: '保存中…',
      saved: '已保存。',
      saveFailed: '保存失败，请检查配置后重试。',
      discard: '放弃修改',
      loading: '正在读取配置…',
      unavailable: '当前会话无法配置该条目。请确认插件已启用，然后刷新页面。',
      readOnly: '当前配置为只读，无法在此修改。',
      empty: '人格内容为空，当前不会注入任何内容。',
      summary: '已启用',
      summaryOff: '已关闭',
    }

    const card = {
      display: 'grid',
      gap: 10,
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 12,
      padding: '16px 18px',
      background: 'var(--dsw-alias-bg-layer-1)',
      color: 'var(--dsw-alias-label-primary)',
    }
    const header = {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }
    const title = { margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.4 }
    const description = {
      margin: '4px 0 0',
      fontSize: 12,
      lineHeight: 1.6,
      color: 'var(--dsw-alias-label-secondary)',
    }
    const toggle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    }
    const fieldLabel = { fontSize: 13, fontWeight: 600 }
    const textarea = {
      width: '100%',
      boxSizing: 'border-box',
      minHeight: 180,
      resize: 'vertical',
      padding: '10px 12px',
      borderRadius: 8,
      border: '1px solid var(--dsw-alias-border-l2)',
      background: 'var(--dsw-alias-bg-base)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: 13,
      lineHeight: 1.6,
    }
    const metaRow = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    }
    const muted = {
      margin: 0,
      fontSize: 12,
      lineHeight: 1.6,
      color: 'var(--dsw-alias-label-tertiary)',
    }
    const warn = { margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--dsw-alias-state-warn-primary)' }
    const okText = { margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--dsw-alias-state-success-primary)' }
    const errorText = { margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--dsw-alias-state-error-primary)' }
    const actions = { display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }

    function actionStyle(primary, off) {
      return {
        appearance: 'none',
        border: primary ? '1px solid var(--dsw-alias-brand-primary)' : '1px solid var(--dsw-alias-border-l2)',
        borderRadius: 8,
        padding: '7px 16px',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? 0.5 : 1,
        background: primary ? 'var(--dsw-alias-brand-primary)' : 'transparent',
        color: primary ? 'var(--dsw-alias-bg-base)' : 'var(--dsw-alias-label-primary)',
      }
    }

    function GlobalPersonaPanel(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key
      const scope = props.scope
      const [snapshot, setSnapshot] = React.useState(() => (
        scope
          ? scope.getSnapshot()
          : { status: 'unavailable', value: undefined, revision: undefined, writable: false }
      ))
      const [override, setOverride] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [saving, setSaving] = React.useState(false)

      React.useEffect(() => {
        if (!scope) return undefined
        setSnapshot(scope.getSnapshot())
        return scope.subscribe(() => setSnapshot(scope.getSnapshot()))
      }, [scope])

      const ready = snapshot.status === 'ready'
      const acceptedPersona = ready && typeof snapshot.value?.persona === 'string' ? snapshot.value.persona : ''
      const acceptedEnabled = ready ? snapshot.value?.enabled !== false : true
      const draft = override ?? { persona: acceptedPersona, enabled: acceptedEnabled }
      const dirty = override !== null
        && (override.persona !== acceptedPersona || override.enabled !== acceptedEnabled)
      const writable = ready && snapshot.writable === true
      const disabled = !writable || saving

      function editPersona(value) {
        setNotice(null)
        setOverride({ persona: value, enabled: draft.enabled })
      }

      function editEnabled(value) {
        setNotice(null)
        setOverride({ persona: draft.persona, enabled: value })
      }

      async function save() {
        if (!scope || disabled || !dirty) return
        const operations = []
        if (draft.persona !== acceptedPersona) {
          operations.push({ op: 'set', path: ['persona'], value: draft.persona })
        }
        if (draft.enabled !== acceptedEnabled) {
          operations.push({ op: 'set', path: ['enabled'], value: draft.enabled })
        }
        if (operations.length === 0) {
          setOverride(null)
          return
        }
        setSaving(true)
        setNotice(null)
        try {
          const accepted = await scope.mutate(operations)
          if (accepted) {
            setOverride(null)
            setNotice({ kind: 'ok', text: t('saved') })
          } else {
            setNotice({ kind: 'error', text: t('saveFailed') })
          }
        } catch (error) {
          setNotice({ kind: 'error', text: t('saveFailed') })
        } finally {
          setSaving(false)
        }
      }

      function discard() {
        setOverride(null)
        setNotice(null)
      }

      if (props.view === 'summary') {
        const enabled = ready ? acceptedEnabled : false
        return h('span', {
          style: { color: 'var(--dsw-alias-label-secondary)', fontSize: 12 },
        }, t(enabled ? 'summary' : 'summaryOff'))
      }

      if (!ready) {
        return h('section', { style: card },
          h('h3', { style: title }, t('title')),
          h('p', { style: muted }, t(snapshot.status === 'loading' ? 'loading' : 'unavailable')))
      }

      return h('section', { style: card, 'aria-label': t('title') },
        h('div', { style: header },
          h('div', { style: { minWidth: 0 } },
            h('h3', { style: title }, t('title')),
            h('p', { style: description }, t('description'))),
          h('label', { style: toggle },
            h('input', {
              type: 'checkbox',
              checked: draft.enabled,
              disabled,
              onChange: (event) => editEnabled(event.target.checked),
            }),
            h('span', null, t('enabled')))),
        h('label', { htmlFor: 'global-persona-text', style: fieldLabel }, t('personaLabel')),
        h('textarea', {
          id: 'global-persona-text',
          value: draft.persona,
          rows: 12,
          spellCheck: false,
          disabled,
          placeholder: t('placeholder'),
          onChange: (event) => editPersona(event.target.value),
          style: textarea,
        }),
        h('div', { style: metaRow },
          h('span', { style: muted }, t('hint')),
          h('span', { style: muted }, t('chars').replace('{count}', String(draft.persona.length)))),
        draft.enabled && draft.persona.trim() === '' && h('p', { style: warn }, t('empty')),
        !writable && h('p', { style: warn }, t('readOnly')),
        notice && h('p', {
          role: 'status',
          style: notice.kind === 'ok' ? okText : errorText,
        }, notice.text),
        h('div', { style: actions },
          h('button', {
            type: 'button',
            onClick: save,
            disabled: disabled || !dirty,
            style: actionStyle(true, disabled || !dirty),
          }, saving ? t('saving') : t('save')),
          h('button', {
            type: 'button',
            onClick: discard,
            disabled: disabled || !dirty,
            style: actionStyle(false, disabled || !dirty),
          }, t('discard'))))
    }

    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        ctx.effect(() => {
          const disposers = [
            ctx.locale.register(NS, 'en', en),
            ctx.locale.register(NS, 'zh', zh),
          ]
          return () => {
            for (const dispose of disposers) dispose()
          }
        })
        const scope = ctx.configForms.get(ENTRY_ID)
        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: 'dsh-plugin-global-persona',
          locale: NS,
          inject: () => ({ scope }),
        }, GlobalPersonaPanel))
      },
    }
  },
})
