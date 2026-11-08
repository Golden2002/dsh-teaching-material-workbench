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
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: C.border } },
                  h('pre', { style: { margin: 0, padding: 8, maxHeight: 380, overflow: 'auto', background: C.layer, fontSize: 11, lineHeight: 1.45, whiteSpace: 'pre-wrap' } }, diff.previous || '（该版本没有此文件）'),
                  h('pre', { style: { margin: 0, padding: 8, maxHeight: 380, overflow: 'auto', background: C.layer, fontSize: 11, lineHeight: 1.45, whiteSpace: 'pre-wrap' } }, diff.current || '（当前没有此文件）'),
                ),
              ) : null,
            ) : null,
          ),
        ),
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
