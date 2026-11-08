window.__ModuleLoader__.load({
  id: 'dsh-teaching-material-workbench',
  factory(require) {
    const React = require('react')
    const { useCallback, useEffect, useMemo, useState } = React
    const h = React.createElement

    const API = '/teaching-workbench/api'
    const FILES = [
      'lesson.yml', 'profile.yml', 'language.md', 'pages.json',
      'sources.csv', 'claims.csv', 'knowledge.csv', 'alignment.csv',
      'rubric.csv', 'timeline.csv', 'glossary.csv', 'misconceptions.csv',
      'figures.json', 'palette.json', 'teacher-pack.md',
      'build/outline.md', 'build/handout.md', 'build/deck.md', 'build/storyboard.md',
      'gate-report.md', 'verification/grounding-report.md',
      'verification/rights-report.md', 'verification/repro.json',
    ]
    const C = {
      bg: 'var(--dsw-alias-bg-base, #ffffff)',
      layer: 'var(--dsw-alias-bg-layer-1, #f7f8fa)',
      layer2: 'var(--dsw-alias-bg-layer-2, #eef1f4)',
      border: 'var(--dsw-alias-border-l1, #e3e6ea)',
      text: 'var(--dsw-alias-label-primary, #1b1f24)',
      muted: 'var(--dsw-alias-label-secondary, #66707a)',
      brand: 'var(--dsw-alias-brand-primary, #3a6ff7)',
      error: 'var(--dsw-alias-state-error-primary, #d93025)',
      warn: 'var(--dsw-alias-state-warn-primary, #b26a00)',
      ok: 'var(--dsw-alias-state-success-primary, #1e8e3e)',
    }

    async function call(path, options = {}) {
      const response = await fetch(`${API}${path}`, { headers: { 'content-type': 'application/json' }, ...options })
      const data = await response.json().catch(() => ({ ok: false, error: `HTTP ${response.status}` }))
      if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`)
      return data
    }

    function Button(props) {
      const { children, onClick, primary, disabled, title } = props
      return h('button', {
        type: 'button', title, onClick, disabled,
        style: {
          padding: '4px 11px', borderRadius: 6, fontSize: 12, lineHeight: '18px', cursor: disabled ? 'not-allowed' : 'pointer',
          border: `1px solid ${primary ? C.brand : C.border}`,
          background: primary ? C.brand : C.layer,
          color: primary ? '#fff' : C.text,
          opacity: disabled ? 0.5 : 1,
        },
      }, children)
    }

    function Hint(props) {
      return h('div', { style: { fontSize: 12, color: C.muted, margin: '4px 0' } }, props.children)
    }

    function rowField(key, row, index, update) {
      return h('input', {
        value: row[key] ?? '',
        placeholder: key,
        onChange: (event) => update(index, key, event.target.value),
        style: { padding: '4px 6px', borderRadius: 5, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, minWidth: 0 },
      })
    }

    function rowSelect(key, row, index, update, options) {
      return h('select', {
        value: row[key] ?? options[0],
        onChange: (event) => update(index, key, event.target.value),
        style: { padding: '4px 6px', borderRadius: 5, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 },
      }, options.map((option) => h('option', { key: option, value: option }, option)))
    }

    function Markdownish(props) {
      const lines = String(props.text ?? '').split(/\r?\n/)
      return h('div', null, lines.map((line, index) => {
        if (line.startsWith('### ')) return h('h4', { key: index, style: { margin: '8px 0 4px', fontSize: 14 } }, line.slice(4))
        if (line.startsWith('## ')) return h('h3', { key: index, style: { margin: '10px 0 4px', fontSize: 16 } }, line.slice(3))
        if (line.startsWith('# ')) return h('h2', { key: index, style: { margin: '12px 0 6px', fontSize: 19 } }, line.slice(2))
        if (line.startsWith('- ')) return h('div', { key: index, style: { fontSize: 13, marginLeft: 14 } }, `• ${line.slice(2)}`)
        if (line.startsWith('|')) return h('div', { key: index, style: { fontSize: 12, fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'pre-wrap' } }, line)
        if (!line.trim()) return h('div', { key: index, style: { height: 6 } })
        return h('p', { key: index, style: { fontSize: 13, lineHeight: 1.6, margin: '4px 0' } }, line)
      }))
    }

    function Workbench() {
      const [root, setRoot] = useState(() => localStorage.getItem('tmw.root') || '')
      const [cases, setCases] = useState([])
      const [selected, setSelected] = useState('')
      const [caseData, setCaseData] = useState(null)
      const [mode, setMode] = useState('pages')
      const [busy, setBusy] = useState(false)
      const [message, setMessage] = useState('')

      const [file, setFile] = useState('lesson.yml')
      const [content, setContent] = useState('')
      const [dirtyFile, setDirtyFile] = useState(false)
      const [language, setLanguage] = useState(null)

      const [pages, setPages] = useState([])
      const [revision, setRevision] = useState(0)
      const [pageIndex, setPageIndex] = useState(0)
      const [pagesDirty, setPagesDirty] = useState(false)
      const [pageCheck, setPageCheck] = useState(null)
      const [exportResult, setExportResult] = useState(null)

      const [checks, setChecks] = useState(null)
      const [history, setHistory] = useState([])
      const [sourceRows, setSourceRows] = useState([])
      const [diff, setDiff] = useState(null)
      const [assets, setAssets] = useState({ figures: [], assets: [] })
      const [wizardOpen, setWizardOpen] = useState(false)
      const [wizardBusy, setWizardBusy] = useState(false)
      const [wizard, setWizard] = useState({ id: '', title: '', subject: '', level: '', audience: '', setting: '现场授课', duration_min: 45, assessment_regime: '无正式评估' })
      const [wizardSources, setWizardSources] = useState([{ id: 'S01', title: '', publisher: '', locator: '', license: '', verified: 'no', type: 'primary' }])
      const [wizardTimeline, setWizardTimeline] = useState([{ start: '0', end: '10', segment: '导入', teacher: '', student: '', output: '' }])

      const page = pages[pageIndex] ?? null

      const loadCases = useCallback(async (value) => {
        const nextRoot = String(value ?? root).trim()
        if (!nextRoot) return
        setBusy(true)
        setMessage('')
        try {
          const data = await call(`/cases?root=${encodeURIComponent(nextRoot)}`)
          setCases(data.cases || [])
          localStorage.setItem('tmw.root', nextRoot)
          setMessage(`找到 ${data.cases.length} 个案例`)
        } catch (error) {
          setCases([])
          setMessage(`载入失败：${error.message}`)
        } finally { setBusy(false) }
      }, [root])

      const setPage = (patch) => {
        setPages((current) => current.map((item, index) => index === pageIndex ? { ...item, ...patch } : item))
        setPagesDirty(true)
      }

      const loadPages = useCallback(async (dir) => {
        const data = await call(`/pages?dir=${encodeURIComponent(dir)}`)
        if (data.saved?.pages?.length) {
          setPages(data.saved.pages)
          setRevision(data.saved.revision ?? 0)
        } else {
          setPages(data.draft?.pages ?? [])
          setRevision(0)
        }
        setPageIndex(0)
        setPagesDirty(false)
        setPageCheck(null)
        setExportResult(null)
      }, [])

      const openCase = useCallback(async (dir) => {
        if (!dir) return
        setBusy(true)
        setMessage('')
        try {
          const data = await call(`/case?dir=${encodeURIComponent(dir)}`)
          setCaseData(data.case)
          setSelected(dir)
          const available = FILES.find((name) => Object.prototype.hasOwnProperty.call(data.case.files, name))
          const nextFile = available || 'lesson.yml'
          setFile(nextFile)
          setContent(data.case.files[nextFile] ?? '')
          setDirtyFile(false)
          setLanguage(null)
          setChecks(null)
          setDiff(null)
          await loadPages(dir)
          try {
            const sources = await call(`/sources?dir=${encodeURIComponent(dir)}`)
            setSourceRows(sources.rows ?? [])
          } catch {
            setSourceRows([])
          }
          try {
            const assetData = await call(`/assets?dir=${encodeURIComponent(dir)}`)
            setAssets({ figures: assetData.figures ?? [], assets: assetData.assets ?? [] })
          } catch {
            setAssets({ figures: [], assets: [] })
          }
        } catch (error) {
          setMessage(`打开失败：${error.message}`)
        } finally { setBusy(false) }
      }, [loadPages])

      useEffect(() => {
        if (root) loadCases(root)
        // run once with the remembered root
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      const refreshCase = async () => {
        if (!caseData) return
        const data = await call(`/case?dir=${encodeURIComponent(caseData.dir)}`)
        setCaseData(data.case)
      }

      const saveFile = async () => {
        if (!caseData) return
        setBusy(true)
        try {
          await call('/save', { method: 'POST', body: JSON.stringify({ dir: caseData.dir, file, content }) })
          setCaseData((current) => current ? { ...current, files: { ...current.files, [file]: content } } : current)
          setDirtyFile(false)
          setMessage(`已保存 ${file}`)
        } catch (error) { setMessage(`保存失败：${error.message}`) } finally { setBusy(false) }
      }

      const savePageModel = async () => {
        if (!caseData) return
        setBusy(true)
        try {
          const result = await call('/pages', { method: 'POST', body: JSON.stringify({ dir: caseData.dir, pages, revision }) })
          setRevision(result.revision)
          setPagesDirty(false)
          setMessage(`已保存 pages.json，revision ${result.revision}；版本 ${result.version_id}`)
          await refreshCase()
        } catch (error) { setMessage(`保存页失败：${error.message}`) } finally { setBusy(false) }
      }

      const draftFromTimeline = async () => {
        if (!caseData) return
        setBusy(true)
        try {
          const data = await call('/pages/from-timeline', { method: 'POST', body: JSON.stringify({ dir: caseData.dir, mode: 'preview' }) })
          setPages(data.pages)
          setPageIndex(0)
          setPagesDirty(true)
          setMessage(`已按时间轴生成 ${data.pages.length} 页草稿；确认后保存`)
        } catch (error) { setMessage(`生成失败：${error.message}`) } finally { setBusy(false) }
      }

      const runExport = async () => {
        if (!caseData) return
        setBusy(true)
        setExportResult(null)
        try {
          const data = await call('/export', { method: 'POST', body: JSON.stringify({ dir: caseData.dir, targets: ['all'] }) })
          setExportResult(data)
          setMessage(`导出 ${data.artifacts.length} 个文件${data.degraded_reason.length ? '；有降级项' : ''}`)
          await refreshCase()
        } catch (error) { setMessage(`导出失败：${error.message}`) } finally { setBusy(false) }
      }

      const checkPageLanguage = async () => {
        if (!page) return
        setBusy(true)
        setPageCheck(null)
        try {
          const text = [page.title, ...(page.slide?.bullets ?? []), ...(page.handout?.paragraphs ?? []), page.notes].filter(Boolean).join('\n')
          const data = await call('/language', { method: 'POST', body: JSON.stringify({ text, name: `page:${page.id}` }) })
          setPageCheck(data)
          setMessage(`本页语言检查：${data.violations.length} 处`)
        } catch (error) { setMessage(`语言检查失败：${error.message}`) } finally { setBusy(false) }
      }

      const checkLanguageFile = async () => {
        setBusy(true)
        setLanguage(null)
        try {
          const data = await call('/language', { method: 'POST', body: JSON.stringify({ text: content, name: file }) })
          setLanguage(data)
          setMessage(`语言检查：${data.violations.length} 处`)
        } catch (error) { setMessage(`语言检查失败：${error.message}`) } finally { setBusy(false) }
      }

      const runChecks = async () => {
        if (!caseData) return
        setBusy(true)
        try {
          const data = await call(`/checks?dir=${encodeURIComponent(caseData.dir)}`)
          setChecks(data)
          setMessage(`检查完成：门禁 ${data.gate.summary.pass} 通过 / ${data.gate.summary.fail} 不通过 / ${data.gate.summary.skip} 未执行`)
        } catch (error) { setMessage(`检查失败：${error.message}`) } finally { setBusy(false) }
      }

      const loadHistory = async () => {
        if (!caseData) return
        setBusy(true)
        try {
          const data = await call(`/history?dir=${encodeURIComponent(caseData.dir)}`)
          setHistory(data.versions ?? [])
          setMessage(`历史版本 ${data.versions.length} 个`)
        } catch (error) { setMessage(`读取历史失败：${error.message}`) } finally { setBusy(false) }
      }

      const restore = async (version) => {
        if (!caseData) return
        setBusy(true)
        try {
          await call('/history/restore', { method: 'POST', body: JSON.stringify({ dir: caseData.dir, version }) })
          setMessage(`已恢复版本 ${version}；当前状态已另存为备份`)
          await openCase(caseData.dir)
          await loadHistory()
        } catch (error) { setMessage(`恢复失败：${error.message}`) } finally { setBusy(false) }
      }

      const openDiff = async (version) => {
        if (!caseData) return
        setBusy(true)
        try {
          const data = await call(`/history/diff?dir=${encodeURIComponent(caseData.dir)}&version=${encodeURIComponent(version)}&file=pages.json`)
          setDiff(data)
          setMessage(`对比版本 ${version} 与当前 pages.json`)
        } catch (error) { setMessage(`读取差异失败：${error.message}`) } finally { setBusy(false) }
      }

      const updateSource = (index, key, value) => {
        setSourceRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row))
      }

      const saveSources = async () => {
        if (!caseData) return
        setBusy(true)
        try {
          const data = await call('/sources', { method: 'POST', body: JSON.stringify({ dir: caseData.dir, rows: sourceRows }) })
          setSourceRows(data.rows)
          setMessage(`来源已保存：${data.counts.total} 条，未核验 ${data.counts.unverified} 条，受限 ${data.counts.restricted} 条`)
          await refreshCase()
        } catch (error) { setMessage(`来源保存失败：${error.message}`) } finally { setBusy(false) }
      }

      const attachSource = (sentence, sourceId) => {
        if (!page || !sourceId) return
        const paragraphs = (page.handout?.paragraphs ?? []).map((paragraph) => paragraph.includes(sentence) ? paragraph.replace(sentence, `${sentence} [${sourceId}]`) : paragraph)
        setPage({ handout: { ...(page.handout ?? {}), paragraphs }, sources: Array.from(new Set([...(page.sources ?? []), sourceId])) })
      }

      const uncoveredSentences = useMemo(() => {
        if (!page) return []
        const sentences = []
        for (const paragraph of page.handout?.paragraphs ?? []) {
          for (const sentence of String(paragraph).split(/(?<=[。！？!?；;])/)) {
            const text = sentence.trim()
            if (text.length < 16) continue
            if (/\[S\d+\]/.test(text)) continue
            sentences.push(text)
          }
        }
        return sentences
      }, [page])

      const pageDiffRows = useMemo(() => {
        if (!diff) return []
        try {
          const before = JSON.parse(diff.previous || '{"pages":[]}').pages ?? []
          const after = JSON.parse(diff.current || '{"pages":[]}').pages ?? []
          const ids = Array.from(new Set([...before, ...after].map((item) => item.id)))
          const rows = []
          for (const id of ids) {
            const oldPage = before.find((item) => item.id === id)
            const newPage = after.find((item) => item.id === id)
            if (!oldPage || !newPage) {
              rows.push({ page: id, field: '整页', before: oldPage ? '存在' : '不存在', after: newPage ? '存在' : '不存在' })
              continue
            }
            const fields = [
              ['title', oldPage.title, newPage.title],
              ['minutes', oldPage.minutes, newPage.minutes],
              ['layout', oldPage.layout, newPage.layout],
              ['slide.bullets', (oldPage.slide?.bullets ?? []).join(' / '), (newPage.slide?.bullets ?? []).join(' / ')],
              ['handout.paragraphs', (oldPage.handout?.paragraphs ?? []).join(' / '), (newPage.handout?.paragraphs ?? []).join(' / ')],
              ['notes', oldPage.notes, newPage.notes],
              ['sources', (oldPage.sources ?? []).join('、'), (newPage.sources ?? []).join('、')],
              ['slide.visual', JSON.stringify(oldPage.slide?.visual ?? null), JSON.stringify(newPage.slide?.visual ?? null)],
            ]
            for (const [field, oldValue, newValue] of fields) {
              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) rows.push({ page: id, field, before: oldValue ?? '', after: newValue ?? '' })
            }
          }
          return rows
        } catch {
          return []
        }
      }, [diff])

      const setVisual = (visual) => setPage({ slide: { ...(page.slide ?? {}), visual } })

      const visualValue = page?.slide?.visual?.figure ? `figure:${page.slide.visual.figure}` : page?.slide?.visual?.asset ? `asset:${page.slide.visual.asset}` : ''

      const openWizard = () => {
        setWizard({ id: '', title: '', subject: '', level: '', audience: '', setting: '现场授课', duration_min: 45, assessment_regime: '无正式评估' })
        setWizardSources([{ id: 'S01', title: '', publisher: '', locator: '', license: '', verified: 'no', type: 'primary' }])
        setWizardTimeline([{ start: '0', end: '10', segment: '导入', teacher: '', student: '', output: '' }])
        setWizardOpen(true)
      }

      const createWizardCase = async () => {
        if (!root.trim()) { setMessage('先填案例根目录'); return }
        const folder = (wizard.id || wizard.title).trim().replace(/[^\w\u4e00-\u9fff-]+/g, '-')
        if (!folder || !wizard.title.trim()) { setMessage('案例标题与文件夹名为必填'); return }
        setWizardBusy(true)
        try {
          const dir = `${root.replace(/[\\/]+$/, '')}\\${folder}`
          await call('/case', {
            method: 'POST',
            body: JSON.stringify({ directory: dir, ...wizard, sources: wizardSources, timeline: wizardTimeline }),
          })
          setWizardOpen(false)
          setMessage(`案例已建立：${dir}`)
          await loadCases(root)
          await openCase(dir)
        } catch (error) { setMessage(`建案例失败：${error.message}`) } finally { setWizardBusy(false) }
      }

      const switchMode = async (next) => {
        setMode(next)
        if (next === 'checks') await runChecks()
        if (next === 'history') await loadHistory()
      }

      const pagePreview = page ? h('div', null,
        h('div', { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, `第 ${pageIndex + 1} / ${pages.length} 页 · 约 ${page.minutes || 0} 分钟 · ${page.layout || '要点页'}`),
        h('div', { style: { aspectRatio: '16 / 9', width: '100%', background: '#fff', color: '#1b1f24', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
          h('div', { style: { fontSize: 18, fontWeight: 700, marginBottom: 8 } }, page.title || '未命名页'),
          (page.slide?.bullets ?? []).slice(0, 6).map((item, index) => h('div', { key: `s${index}`, style: { fontSize: 13, lineHeight: 1.5, margin: '2px 0 2px 10px' } }, `• ${item}`)),
          page.slide?.visual?.asset ? h('img', {
            src: `${API}/asset?dir=${encodeURIComponent(caseData?.dir ?? '')}&file=${encodeURIComponent(page.slide.visual.asset)}`,
            alt: page.slide.visual.alt || '',
            style: { maxHeight: 90, maxWidth: '80%', objectFit: 'contain', marginTop: 4 },
          }) : null,
          page.slide?.visual?.caption ? h('div', { style: { fontSize: 10, color: '#66707a' } }, `图注：${page.slide.visual.caption}${page.slide.visual.source ? ` [${page.slide.visual.source}]` : ''}`) : null,
          page.sources?.length ? h('div', { style: { marginTop: 'auto', fontSize: 10, color: '#66707a' } }, page.sources.map((id) => `[${id}]`).join(' ')) : null,
        ),
        h('div', { style: { marginTop: 10, background: '#fff', color: '#1b1f24', border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 } },
          h('div', { style: { fontSize: 11, color: '#66707a', marginBottom: 4 } }, '讲义近似预览'),
          h('div', { style: { fontSize: 15, fontWeight: 700, marginBottom: 4 } }, page.handout?.heading || page.title || ''),
          (page.handout?.paragraphs ?? []).map((item, index) => h('p', { key: `hp${index}`, style: { fontSize: 12, lineHeight: 1.6, margin: '3px 0' } }, item)),
          page.handout?.task ? h('p', { style: { fontSize: 12, color: '#3a6ff7' } }, `任务：${page.handout.task}`) : null,
        ),
        page.notes ? h('div', { style: { marginTop: 8, padding: 8, background: C.layer2, borderRadius: 6, fontSize: 12, lineHeight: 1.5 } }, `讲稿：${page.notes}`) : null,
        h('div', { style: { fontSize: 10, color: C.muted, marginTop: 6 } }, '近似预览，版式与分页以导出的 docx/pptx 为准。'),
      ) : h('div', { style: { color: C.muted, fontSize: 13 } }, '还没有页；先按时间轴生成草稿。')

      const inputStyle = { padding: '5px 7px', borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12, minWidth: 0 }

      const modeButtons = [
        ['pages', '逐页'],
        ['sources', '来源'],
        ['files', '数据文件'],
        ['checks', '检查中心'],
        ['history', '版本回退'],
      ]

      return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: C.bg, color: C.text } },
        h('div', { style: { padding: '9px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' } },
          h('div', { style: { fontWeight: 600, fontSize: 14 } }, '教学物料工作台'),
          h('input', {
            value: root,
            onChange: (event) => setRoot(event.target.value),
            placeholder: '案例根目录，例如 D:\\...\\verification',
            style: { flex: '1 1 300px', minWidth: 220, padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 },
          }),
          h(Button, { onClick: () => loadCases(), disabled: busy }, '载入案例'),
          h(Button, { onClick: openWizard, disabled: busy }, '新建案例'),
          caseData ? h('span', { style: { fontSize: 12, color: C.muted } }, caseData.title) : null,
          message ? h('span', { style: { fontSize: 12, color: C.muted, maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, message) : null,
        ),
        h('div', { style: { display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 14px' } },
          modeButtons.map(([id, label]) => h('button', {
            key: id, type: 'button', onClick: () => switchMode(id),
            style: {
              padding: '7px 12px', background: 'transparent', border: 'none', borderBottom: `2px solid ${mode === id ? C.brand : 'transparent'}`,
              color: mode === id ? C.brand : C.muted, cursor: 'pointer', fontSize: 12,
            },
          }, label)),
        ),
        h('div', { style: { display: 'flex', flex: 1, minHeight: 0 } },
          h('div', { style: { width: 240, borderRight: `1px solid ${C.border}`, padding: 9, overflow: 'auto', flexShrink: 0 } },
            h('div', { style: { fontSize: 12, color: C.muted, marginBottom: 6 } }, `案例（${cases.length}）`),
            cases.map((item) => h('button', {
              key: item.dir, type: 'button', onClick: () => openCase(item.dir), title: item.dir,
              style: {
                display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', marginBottom: 4, borderRadius: 6,
                border: `1px solid ${selected === item.dir ? C.brand : 'transparent'}`,
                background: selected === item.dir ? C.layer2 : 'transparent', color: C.text, cursor: 'pointer',
              },
            },
              h('div', { style: { fontSize: 12, fontWeight: 600 } }, item.title || item.name),
              h('div', { style: { fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.name),
            )),
            mode === 'pages' && pages.length ? h('div', null,
              h('div', { style: { fontSize: 12, color: C.muted, margin: '12px 0 6px' } }, `页（${pages.length}）${pagesDirty ? ' · 未保存' : ''}`),
              pages.map((item, index) => h('button', {
                key: item.id ?? index, type: 'button', onClick: () => setPageIndex(index),
                style: {
                  display: 'block', width: '100%', textAlign: 'left', padding: '5px 7px', marginBottom: 3, borderRadius: 5,
                  border: `1px solid ${index === pageIndex ? C.brand : 'transparent'}`,
                  background: index === pageIndex ? C.layer2 : 'transparent', color: C.text, cursor: 'pointer', fontSize: 12,
                },
              }, `${index + 1}. ${item.title || '未命名'}${item.minutes ? ` · ${item.minutes} 分` : ''}`)),
            ) : null,
          ),
          h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 } },
            mode === 'pages' ? h('div', { style: { display: 'flex', flex: 1, minHeight: 0 } },
              h('div', { style: { flex: 1, overflow: 'auto', padding: 12, minWidth: 0 } },
                h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 } },
                  h(Button, { onClick: draftFromTimeline, disabled: busy || !caseData }, '按时间轴生成页'),
                  h(Button, { onClick: savePageModel, primary: true, disabled: busy || !pagesDirty }, '保存页数据'),
                  h(Button, { onClick: runExport, disabled: busy || !caseData }, '导出讲义/课件/脚本'),
                  h(Button, { onClick: checkPageLanguage, disabled: busy || !page }, '检查本页语言'),
                ),
                page ? h('div', { style: { display: 'grid', gap: 7 } },
                  h('label', { style: { fontSize: 12, color: C.muted } }, '页标题'),
                  h('input', { value: page.title ?? '', onChange: (event) => setPage({ title: event.target.value }), style: { padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text } }),
                  h('div', { style: { display: 'flex', gap: 8 } },
                    h('input', { type: 'number', value: page.minutes ?? 0, onChange: (event) => setPage({ minutes: Number(event.target.value) }), style: { width: 80, padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text } }),
                    h('select', { value: page.layout ?? '要点页', onChange: (event) => setPage({ layout: event.target.value }), style: { flex: 1, padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text } },
                      ['导入页', '要点页', '图示页', '活动页', '评分页'].map((item) => h('option', { key: item, value: item }, item))),
                  ),
                  h('label', { style: { fontSize: 12, color: C.muted } }, '课件要点（一行一条，最多 6 条）'),
                  h('textarea', { value: (page.slide?.bullets ?? []).join('\n'), rows: 4, onChange: (event) => setPage({ slide: { ...(page.slide ?? {}), bullets: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) } }), style: { padding: 7, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 12 } }),
                  h('label', { style: { fontSize: 12, color: C.muted } }, '讲义正文（一行一段）'),
                  h('textarea', { value: (page.handout?.paragraphs ?? []).join('\n'), rows: 5, onChange: (event) => setPage({ handout: { ...(page.handout ?? {}), paragraphs: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) } }), style: { padding: 7, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 } }),
                  h('label', { style: { fontSize: 12, color: C.muted } }, '讲义任务'),
                  h('input', { value: page.handout?.task ?? '', onChange: (event) => setPage({ handout: { ...(page.handout ?? {}), task: event.target.value } }), style: { padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 } }),
                  h('label', { style: { fontSize: 12, color: C.muted } }, '讲稿'),
                  h('textarea', { value: page.notes ?? '', rows: 3, onChange: (event) => setPage({ notes: event.target.value }), style: { padding: 7, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 } }),
                  h('label', { style: { fontSize: 12, color: C.muted } }, '来源编号（逗号分隔）'),
                  h('input', { value: (page.sources ?? []).join(', '), onChange: (event) => setPage({ sources: event.target.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean) }), style: { padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 } }),
                  h('label', { style: { fontSize: 12, color: C.muted } }, '图示（可选图片）'),
                  h('select', {
                    value: visualValue,
                    onChange: (event) => {
                      const value = event.target.value
                      if (!value) { setVisual(null); return }
                      if (value.startsWith('figure:')) {
                        const figure = assets.figures.find((item) => item.id === value.slice(7))
                        setVisual(figure ? { figure: figure.id, asset: figure.file || '', alt: figure.alt || '', caption: figure.caption || '', source: figure.source_id || '' } : null)
                      } else {
                        setVisual({ figure: '', asset: value.slice(6), alt: '', caption: '', source: '' })
                      }
                    },
                    style: { padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 },
                  },
                    h('option', { value: '' }, '无图片'),
                    assets.figures.map((figure) => h('option', { key: `f${figure.id}`, value: `figure:${figure.id}` }, `${figure.id} ${figure.title || figure.file || ''}`)),
                    assets.assets.map((asset) => h('option', { key: asset, value: `asset:${asset}` }, asset)),
                  ),
                  page.slide?.visual ? h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 } },
                    h('input', { value: page.slide.visual.alt ?? '', placeholder: '替代文本（必填，供无障碍）', onChange: (event) => setVisual({ ...(page.slide.visual ?? {}), alt: event.target.value }), style: { padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 } }),
                    h('input', { value: page.slide.visual.caption ?? '', placeholder: '图注', onChange: (event) => setVisual({ ...(page.slide.visual ?? {}), caption: event.target.value }), style: { padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 } }),
                  ) : null,
                  page.slide?.visual ? h('select', {
                    value: page.slide.visual.source ?? '',
                    onChange: (event) => setVisual({ ...(page.slide.visual ?? {}), source: event.target.value }),
                    style: { padding: 5, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 },
                  },
                    h('option', { value: '' }, '图片来源（可选）'),
                    sourceRows.map((row) => h('option', { key: row.id, value: row.id }, `${row.id} ${row.title}`)),
                  ) : null,
                ) : h(Hint, null, '先载入案例，再按时间轴生成页。'),
                pageCheck ? h('div', { style: { marginTop: 10, padding: 8, borderRadius: 6, background: C.layer, maxHeight: 150, overflow: 'auto' } },
                  h('strong', { style: { fontSize: 12 } }, `本页语言 ${pageCheck.violations.length} 处`),
                  pageCheck.violations.slice(0, 20).map((item, index) => h('div', { key: index, style: { fontSize: 12, color: item.category === '禁用词' ? C.error : C.text, marginTop: 2 } }, `[${item.category}] ${item.rule} · 命中「${item.hit}」→ ${item.advice}`)),
                ) : null,
                uncoveredSentences.length > 0 ? h('div', { style: { marginTop: 10, padding: 8, borderRadius: 6, background: C.layer, maxHeight: 180, overflow: 'auto' } },
                  h('strong', { style: { fontSize: 12 } }, `本页未接地句子 ${uncoveredSentences.length} 条`),
                  uncoveredSentences.slice(0, 12).map((sentence, index) => h('div', { key: index, style: { fontSize: 12, marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' } },
                    h('span', { style: { flex: 1 } }, sentence),
                    h('select', { value: '', onChange: (event) => attachSource(sentence, event.target.value), style: { fontSize: 11, maxWidth: 180 } },
                      h('option', { value: '' }, '选来源补标记'),
                      sourceRows.map((row) => h('option', { key: row.id, value: row.id }, `${row.id} ${row.title}`.slice(0, 40))),
                    ),
                  )),
                ) : null,
                exportResult ? h('div', { style: { marginTop: 10, padding: 8, borderRadius: 6, background: C.layer, maxHeight: 160, overflow: 'auto' } },
                  h('strong', { style: { fontSize: 12 } }, `导出 ${exportResult.artifacts.length} 个文件`),
                  exportResult.artifacts.map((item, index) => h('div', { key: index, style: { fontSize: 12 } }, `${item.path.split(/[\\/]/).pop()} · ${item.sha256.slice(0, 12)}`)),
                  exportResult.degraded_reason.map((item, index) => h('div', { key: `d${index}`, style: { fontSize: 12, color: C.warn, marginTop: 3 } }, `降级：${item}`)),
                ) : null,
              ),
              h('div', { style: { width: 320, borderLeft: `1px solid ${C.border}`, padding: 12, overflow: 'auto', background: C.layer, flexShrink: 0 } },
                h('div', { style: { fontSize: 11, color: C.muted, marginBottom: 4 } }, '近似预览（版式以导出文件为准）'),
                pagePreview,
              ),
            ) : null,
            mode === 'files' ? h('div', { style: { display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column' } },
              h('div', { style: { padding: '7px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
                h('select', { value: file, onChange: (event) => { const name = event.target.value; setFile(name); setContent(caseData?.files?.[name] ?? ''); setDirtyFile(false); setLanguage(null) }, style: { padding: 4, borderRadius: 5, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontSize: 12 } },
                  FILES.map((name) => h('option', { key: name, value: name }, name))),
                h(Button, { onClick: saveFile, primary: true, disabled: busy || !dirtyFile || !caseData }, '保存'),
                h(Button, { onClick: checkLanguageFile, disabled: busy || !caseData }, '语言检查'),
                h(Button, { onClick: async () => { await runChecks(); setMode('checks') }, disabled: busy || !caseData }, '运行检查'),
                !caseData || Object.prototype.hasOwnProperty.call(caseData.files, file) ? null : h('span', { style: { fontSize: 12, color: C.warn } }, '文件尚不存在，保存时创建'),
              ),
              h('textarea', { value: content, onChange: (event) => { setContent(event.target.value); setDirtyFile(true) }, spellCheck: false, style: { flex: 1, margin: 10, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, background: C.layer, color: C.text, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13, lineHeight: 1.55, resize: 'none' } }),
              language ? h('div', { style: { borderTop: `1px solid ${C.border}`, padding: '7px 12px', maxHeight: 180, overflow: 'auto', background: C.layer } },
                h('strong', { style: { fontSize: 12 } }, `语言检查：${language.violations.length} 处`),
                language.violations.slice(0, 60).map((item, index) => h('div', { key: index, style: { fontSize: 12, color: item.category === '禁用词' ? C.error : C.text, marginTop: 2 } }, `[${item.category}] ${item.rule} · ${item.where} · 命中「${item.hit}」→ ${item.advice}`)),
              ) : null,
            ) : null,
            mode === 'sources' ? h('div', { style: { flex: 1, overflow: 'auto', padding: 14 } },
              h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' } },
                h(Button, { onClick: () => setSourceRows((rows) => [...rows, { id: `S${String(rows.length + 1).padStart(2, '0')}`, title: '', publisher: '', date: '', type: 'primary', locator: '', access: '', license: '', verified: 'no', role: '', notes: '' }]), disabled: busy || !caseData }, '新增来源'),
                h(Button, { onClick: saveSources, primary: true, disabled: busy || !caseData }, '保存来源'),
                h('span', { style: { fontSize: 12, color: C.muted } }, `共 ${sourceRows.length} 条；已核验一手 ${sourceRows.filter((row) => row.type === 'primary' && row.verified === 'yes').length} 条；未核验 ${sourceRows.filter((row) => row.verified !== 'yes').length} 条；受限 ${sourceRows.filter((row) => row.license === 'IBO-restricted' || row.license === 'publisher-copyright').length} 条`),
              ),
              sourceRows.map((row, index) => h('div', { key: index, style: { border: `1px solid ${C.border}`, borderRadius: 8, padding: 9, marginBottom: 8, background: C.layer } },
                h('div', { style: { display: 'grid', gridTemplateColumns: '80px 1fr 120px', gap: 6, marginBottom: 5 } },
                  rowField('id', row, index, updateSource),
                  rowField('title', row, index, updateSource),
                  rowSelect('type', row, index, updateSource, ['primary', 'secondary']),
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 100px 80px 120px', gap: 6, marginBottom: 5 } },
                  rowField('publisher', row, index, updateSource),
                  rowField('date', row, index, updateSource),
                  rowSelect('verified', row, index, updateSource, ['yes', 'partial', 'no']),
                  rowField('license', row, index, updateSource),
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: 6 } },
                  rowField('locator', row, index, updateSource),
                  rowSelect('access', row, index, updateSource, ['public-web', 'purchase', 'library', 'institution', 'other']),
                  rowField('role', row, index, updateSource),
                ),
                h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 5 } },
                  h(Button, { onClick: () => setSourceRows((rows) => rows.filter((_item, rowIndex) => rowIndex !== index)), disabled: busy }, '删除'),
                ),
              )),
              sourceRows.length === 0 ? h(Hint, null, '还没有来源。新增后填 id、title、发布方、定位、许可、核验状态与 role。') : null,
            ) : null,
            mode === 'checks' ? h('div', { style: { flex: 1, overflow: 'auto', padding: 14 } },
              !checks ? h(Hint, null, '点“运行检查”聚合门禁、语言、接地与来源。') : h('div', null,
                h('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 } },
                  h('div', null, h('div', { style: { fontSize: 20, fontWeight: 700, color: C.ok } }, checks.gate.summary.pass), h('div', { style: { fontSize: 11, color: C.muted } }, '通过')),
                  h('div', null, h('div', { style: { fontSize: 20, fontWeight: 700, color: C.error } }, checks.gate.summary.fail), h('div', { style: { fontSize: 11, color: C.muted } }, '不通过')),
                  h('div', null, h('div', { style: { fontSize: 20, fontWeight: 700, color: C.warn } }, checks.gate.summary.skip), h('div', { style: { fontSize: 11, color: C.muted } }, '未执行')),
                  h('div', null, h('div', { style: { fontSize: 20, fontWeight: 700 } }, checks.language.violations.length), h('div', { style: { fontSize: 11, color: C.muted } }, '语言违例')),
                  h('div', null, h('div', { style: { fontSize: 20, fontWeight: 700 } }, `${checks.grounding.supported}/${checks.grounding.rows}`), h('div', { style: { fontSize: 11, color: C.muted } }, 'supported claims')),
                ),
                h('strong', { style: { fontSize: 13 } }, '门禁'),
                checks.gate.results.map((item, index) => h('div', { key: index, style: { fontSize: 12, marginTop: 3, color: item.status === 'pass' ? C.ok : item.status === 'fail' ? C.error : C.warn } }, `${item.status.toUpperCase()} ${item.gate} [${item.layer}] ${item.detail}`)),
                h('strong', { style: { fontSize: 13, display: 'block', marginTop: 10 } }, '语言'),
                checks.language.violations.length === 0 ? h(Hint, null, '无违例或未执行（未提供 language.md）') : checks.language.violations.slice(0, 30).map((item, index) => h('div', { key: index, style: { fontSize: 12, marginTop: 2 } }, `[${item.category}] ${item.rule} · ${item.where} · ${item.hit}`)),
                h('strong', { style: { fontSize: 13, display: 'block', marginTop: 10 } }, '接地与来源'),
                h('div', { style: { fontSize: 12, marginTop: 3 } }, `claims ${checks.grounding.rows} 条：supported ${checks.grounding.supported}，partial ${checks.grounding.partial}，unsupported ${checks.grounding.unsupported}，coverage ${(checks.grounding.coverage * 100).toFixed(0)}%；teacher-pack 标记 ${checks.grounding.cited_markers} 个`),
                checks.grounding.issues.length ? checks.grounding.issues.map((item, index) => h('div', { key: index, style: { fontSize: 12, color: C.error } }, item)) : null,
                h('div', { style: { fontSize: 12, marginTop: 4 } }, `来源审计：${JSON.stringify(checks.sources).slice(0, 400)}`),
              )
            ) : null,
            mode === 'history' ? h('div', { style: { flex: 1, overflow: 'auto', padding: 14 } },
              h('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } }, h(Button, { onClick: loadHistory, disabled: busy || !caseData }, '刷新版本'), diff ? h(Button, { onClick: () => setDiff(null) }, '关闭差异') : null),
              !history.length ? h(Hint, null, '还没有版本。保存页数据后会自动生成。') : history.map((item) => h('div', { key: item.id, style: { padding: 8, marginBottom: 6, borderRadius: 6, background: C.layer } },
                h('div', { style: { fontSize: 12, fontWeight: 600 } }, item.id),
                h('div', { style: { fontSize: 11, color: C.muted } }, `${item.created_at} · ${item.files.length} 个文件`),
                h('div', { style: { display: 'flex', gap: 6 } },
                  h(Button, { onClick: () => openDiff(item.id), disabled: busy }, '对比当前 pages.json'),
                  h(Button, { onClick: () => restore(item.id), disabled: busy }, '恢复此版本'),
                ),
              )),
              diff ? h('div', { style: { marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' } },
                h('div', { style: { padding: '6px 8px', fontSize: 12, background: C.layer } }, `差异：${diff.file} · 版本 ${diff.version}（左）与当前（右）`),
                pageDiffRows.length > 0 ? h('div', { style: { maxHeight: 380, overflow: 'auto' } },
                  h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 } },
                    h('thead', null, h('tr', null, ['页', '字段', '旧', '新'].map((label) => h('th', { key: label, style: { textAlign: 'left', padding: 6, borderBottom: `1px solid ${C.border}`, background: C.layer } }, label)))),
                    h('tbody', null, pageDiffRows.map((row, index) => h('tr', { key: index },
                      h('td', { style: { padding: 6, borderBottom: `1px solid ${C.border}`, verticalAlign: 'top' } }, row.page),
                      h('td', { style: { padding: 6, borderBottom: `1px solid ${C.border}`, verticalAlign: 'top' } }, row.field),
                      h('td', { style: { padding: 6, borderBottom: `1px solid ${C.border}`, verticalAlign: 'top', whiteSpace: 'pre-wrap' } }, typeof row.before === 'string' ? row.before : JSON.stringify(row.before)),
                      h('td', { style: { padding: 6, borderBottom: `1px solid ${C.border}`, verticalAlign: 'top', whiteSpace: 'pre-wrap' } }, typeof row.after === 'string' ? row.after : JSON.stringify(row.after)),
                    ))),
                  ),
                ) : h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: C.border } },
                  h('pre', { style: { margin: 0, padding: 8, maxHeight: 380, overflow: 'auto', background: C.layer, fontSize: 11, lineHeight: 1.45, whiteSpace: 'pre-wrap' } }, diff.previous || '（该版本没有此文件）'),
                  h('pre', { style: { margin: 0, padding: 8, maxHeight: 380, overflow: 'auto', background: C.layer, fontSize: 11, lineHeight: 1.45, whiteSpace: 'pre-wrap' } }, diff.current || '（当前没有此文件）'),
                ),
              ) : null,
            ) : null,
          ),
        ),
        wizardOpen ? h('div', { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 } },
          h('div', { style: { width: 780, maxHeight: '88vh', overflow: 'auto', background: C.bg, color: C.text, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, boxShadow: '0 12px 32px rgba(0,0,0,.25)' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
              h('strong', { style: { fontSize: 15 } }, '新建教学案例'),
              h(Button, { onClick: () => setWizardOpen(false), disabled: wizardBusy }, '关闭'),
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
              h('label', { style: { fontSize: 12, color: C.muted } }, '案例标题 *'), h('label', { style: { fontSize: 12, color: C.muted } }, '文件夹名（可留空）'),
              h('input', { value: wizard.title, onChange: (event) => setWizard({ ...wizard, title: event.target.value }), style: inputStyle }),
              h('input', { value: wizard.id, onChange: (event) => setWizard({ ...wizard, id: event.target.value }), style: inputStyle }),
              h('label', { style: { fontSize: 12, color: C.muted } }, '学科'), h('label', { style: { fontSize: 12, color: C.muted } }, '学段/层级'),
              h('input', { value: wizard.subject, onChange: (event) => setWizard({ ...wizard, subject: event.target.value }), style: inputStyle }),
              h('input', { value: wizard.level, onChange: (event) => setWizard({ ...wizard, level: event.target.value }), style: inputStyle }),
              h('label', { style: { fontSize: 12, color: C.muted } }, '学习者'), h('label', { style: { fontSize: 12, color: C.muted } }, '场景'),
              h('input', { value: wizard.audience, onChange: (event) => setWizard({ ...wizard, audience: event.target.value }), style: inputStyle }),
              h('input', { value: wizard.setting, onChange: (event) => setWizard({ ...wizard, setting: event.target.value }), style: inputStyle }),
              h('label', { style: { fontSize: 12, color: C.muted } }, '时长（分钟）'), h('label', { style: { fontSize: 12, color: C.muted } }, '评估方式'),
              h('input', { type: 'number', value: wizard.duration_min, onChange: (event) => setWizard({ ...wizard, duration_min: Number(event.target.value) }), style: inputStyle }),
              h('input', { value: wizard.assessment_regime, onChange: (event) => setWizard({ ...wizard, assessment_regime: event.target.value }), style: inputStyle }),
            ),
            h('div', { style: { marginTop: 12, fontSize: 13, fontWeight: 600 } }, '来源（可后补）'),
            wizardSources.map((row, index) => h('div', { key: index, style: { display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 90px', gap: 5, marginTop: 5 } },
              h('input', { value: row.id, onChange: (event) => setWizardSources((rows) => rows.map((item, i) => i === index ? { ...item, id: event.target.value } : item)), placeholder: 'id', style: inputStyle }),
              h('input', { value: row.title, onChange: (event) => setWizardSources((rows) => rows.map((item, i) => i === index ? { ...item, title: event.target.value } : item)), placeholder: '标题', style: inputStyle }),
              h('input', { value: row.publisher, onChange: (event) => setWizardSources((rows) => rows.map((item, i) => i === index ? { ...item, publisher: event.target.value } : item)), placeholder: '发布方', style: inputStyle }),
              h('input', { value: row.locator, onChange: (event) => setWizardSources((rows) => rows.map((item, i) => i === index ? { ...item, locator: event.target.value } : item)), placeholder: '定位（页码/URL）', style: inputStyle }),
              h('select', { value: row.verified, onChange: (event) => setWizardSources((rows) => rows.map((item, i) => i === index ? { ...item, verified: event.target.value } : item)), style: inputStyle }, ['no', 'partial', 'yes'].map((value) => h('option', { key: value, value }, value))),
            )),
            h('div', { style: { display: 'flex', gap: 6, marginTop: 6 } },
              h(Button, { onClick: () => setWizardSources((rows) => [...rows, { id: `S${String(rows.length + 1).padStart(2, '0')}`, title: '', publisher: '', locator: '', license: '', verified: 'no', type: 'primary' }]) }, '加一行来源'),
            ),
            h('div', { style: { marginTop: 12, fontSize: 13, fontWeight: 600 } }, '时间轴'),
            wizardTimeline.map((row, index) => h('div', { key: index, style: { display: 'grid', gridTemplateColumns: '60px 60px 1fr 1fr 1fr 1fr', gap: 5, marginTop: 5 } },
              h('input', { value: row.start, onChange: (event) => setWizardTimeline((rows) => rows.map((item, i) => i === index ? { ...item, start: event.target.value } : item)), placeholder: '起', style: inputStyle }),
              h('input', { value: row.end, onChange: (event) => setWizardTimeline((rows) => rows.map((item, i) => i === index ? { ...item, end: event.target.value } : item)), placeholder: '止', style: inputStyle }),
              h('input', { value: row.segment, onChange: (event) => setWizardTimeline((rows) => rows.map((item, i) => i === index ? { ...item, segment: event.target.value } : item)), placeholder: '环节', style: inputStyle }),
              h('input', { value: row.teacher, onChange: (event) => setWizardTimeline((rows) => rows.map((item, i) => i === index ? { ...item, teacher: event.target.value } : item)), placeholder: '教师做什么', style: inputStyle }),
              h('input', { value: row.student, onChange: (event) => setWizardTimeline((rows) => rows.map((item, i) => i === index ? { ...item, student: event.target.value } : item)), placeholder: '学生做什么', style: inputStyle }),
              h('input', { value: row.output, onChange: (event) => setWizardTimeline((rows) => rows.map((item, i) => i === index ? { ...item, output: event.target.value } : item)), placeholder: '产出', style: inputStyle }),
            )),
            h('div', { style: { display: 'flex', gap: 6, marginTop: 6 } },
              h(Button, { onClick: () => setWizardTimeline((rows) => [...rows, { start: String(Number(rows[rows.length - 1]?.end ?? 0)), end: String(Number(rows[rows.length - 1]?.end ?? 0) + 10), segment: '', teacher: '', student: '', output: '' }]) }, '加一行时间轴'),
            ),
            h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 } },
              h(Button, { onClick: () => setWizardOpen(false), disabled: wizardBusy }, '取消'),
              h(Button, { onClick: createWizardCase, primary: true, disabled: wizardBusy }, wizardBusy ? '创建中…' : '创建案例'),
            ),
          ),
        ) : null,
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: 'teaching-workbench',
          order: 40,
          label: '教学物料',
        }, Workbench))
      },
    }
  },
})
