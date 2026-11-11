import { useEffect, useRef, useState } from 'react'
import Icon from './components/Icon'
import InfoView from './components/InfoView'
import ThemeToggle, { ThemeProvider } from './components/ThemeToggle'
import LandingPage from './components/LandingPage'
import SourcePage from './components/SourcePage'
import './App.css'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'search', label: 'Search' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'source', label: 'GitHub' },
]

function currentView() {
  const hash = window.location.hash.slice(1)
  return NAV_ITEMS.some(({ id }) => id === hash) ? hash : 'home'
}

function fileSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function PhotoNotes() {
  return (
    <aside className="photo-notes" aria-labelledby="notes-heading">
      <h2 id="notes-heading">Start with a clear photo.</h2>
      <ul className="photo-tips">
        <li><div><h3>One person</h3><p>Keep just one face in the frame.</p></div></li>
        <li><div><h3>A front view</h3><p>Look toward the camera, with your face visible.</p></div></li>
        <li><div><h3>Good light</h3><p>Avoid heavy shadows and motion blur.</p></div></li>
      </ul>
      <a href="#dataset" className="collection-link">
        <span><strong>IMDB–WIKI</strong></span>
        <Icon name="arrow-up-right" size={21} />
      </a>
    </aside>
  )
}

function Results({ showPreview, onPreview, onClosePreview }) {
  return (
    <section className="results-section" aria-labelledby="results-heading">
      <div className="results-heading">
        <h2 id="results-heading">Results</h2>
        <span className="section-caption">{showPreview ? 'Sample layout' : 'No search yet'}</span>
      </div>
      {showPreview ? (
        <div className="results-preview">
          <div className="preview-notice" role="status">
            <p>Layout preview. These are placeholders, not search matches.</p>
            <button className="text-button" onClick={onClosePreview}>Close preview <Icon name="x" size={15} /></button>
          </div>
          <div className="result-grid">
            {[1, 2, 3].map((number) => (
              <article className="result-card" key={number}>
                <div className="sample-portrait" aria-hidden="true">
                  <Icon name="user" size={64} />
                </div>
                <div className="result-card-content">
                  <span className="section-caption">Sample image</span>
                  <h3>Dataset portrait</h3>
                  <p>Name and source</p>
                  <div className="result-meta"><span>Similarity</span><span>—</span></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="results-empty">
          <div><h3>No results yet.</h3><p>Similar faces will appear here when search is available.</p></div>
          <button className="text-button" onClick={onPreview}>View sample layout <Icon name="arrow-up-right" size={17} /></button>
        </div>
      )}
    </section>
  )
}

function AppPages() {
  const [view, setView] = useState(currentView)
  const [menuOpen, setMenuOpen] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState('')
  const [searchNotice, setSearchNotice] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInput = useRef(null)
  const panelNodes = useRef({})
  const menuButton = useRef(null)
  const mobileNavigation = useRef(null)
  const dragDepth = useRef(0)
  const selectionId = useRef(0)

  useEffect(() => () => {
    selectionId.current += 1
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      setView(currentView())
      setMenuOpen(false)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const panel = panelNodes.current[view]
    panel?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1025px)')
    const closeOnDesktop = (event) => {
      if (!event.matches) return
      const shouldFocusPanel = menuOpen || document.activeElement === menuButton.current
      setMenuOpen(false)
      if (shouldFocusPanel) {
        window.requestAnimationFrame(() => panelNodes.current[currentView()]?.focus({ preventScroll: true }))
      }
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    mobileNavigation.current?.querySelector('[aria-current="page"]')?.focus()
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setMenuOpen(false)
      menuButton.current?.focus()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    const url = photo?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [photo?.url])

  async function selectFiles(files) {
    if (!files?.length) return
    const requestId = ++selectionId.current
    setError('')
    setSearchNotice(false)
    setIsReading(false)

    if (files.length !== 1) {
      setError('Choose one photo at a time so we can focus on a single face.')
      return
    }
    const file = files[0]
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('This photo is too large. Choose an image under 10 MB.')
      return
    }

    const url = URL.createObjectURL(file)
    setIsReading(true)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      if (requestId !== selectionId.current) {
        URL.revokeObjectURL(url)
        return
      }
      setPhoto({ file, url, width: image.naturalWidth, height: image.naturalHeight })
    } catch {
      URL.revokeObjectURL(url)
      if (requestId === selectionId.current)
        setError('We couldn’t read this image. Try another photo.')
    } finally {
      if (requestId === selectionId.current) setIsReading(false)
    }
  }

  function resetPhoto() {
    selectionId.current += 1
    setPhoto(null)
    setError('')
    setSearchNotice(false)
    setIsReading(false)
    if (fileInput.current) fileInput.current.value = ''
  }

  function dropPhoto(event) {
    event.preventDefault()
    dragDepth.current = 0
    setIsDragging(false)
    selectFiles(event.dataTransfer.files)
  }

  function focusPanel(id) {
    panelNodes.current[id]?.focus({ preventScroll: true })
  }

  function goTo(id) {
    setMenuOpen(false)
    if (view === id) window.requestAnimationFrame(() => focusPanel(id))
    if (window.location.hash.slice(1) === id) {
      setView(id)
    } else {
      window.location.hash = id
    }
  }

  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === view)
  const searchPage = (
    <>
            <header className="page-intro search-intro">
              <h1>Face search<span className="title-period">.</span></h1>
              <p className="page-description">Search the IMDB–WIKI collection using a photo of a face.</p>
            </header>

            <div className="search-layout">
              <section className="upload-section" aria-labelledby="upload-heading">
                <div className="section-heading"><h2 id="upload-heading">Reference photo</h2><span className="section-caption">One image</span></div>
                <input ref={fileInput} className="file-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose a face photo" tabIndex={-1} onChange={(event) => {
                  selectFiles(event.target.files)
                  event.target.value = ''
                }} />
                <div className={`dropzone ${photo ? 'has-photo' : ''} ${isDragging ? 'is-dragging' : ''}`}
                  onDragEnter={(event) => {
                    event.preventDefault()
                    dragDepth.current += 1
                    setIsDragging(true)
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    event.preventDefault()
                    dragDepth.current = Math.max(0, dragDepth.current - 1)
                    if (!dragDepth.current) setIsDragging(false)
                  }}
                  onDrop={dropPhoto}
                >
                  {photo ? (
                    <div className="photo-preview">
                      <img src={photo.url} alt="Your selected photo" />
                      <button type="button" className="remove-photo" aria-label="Remove photo" onClick={resetPhoto}><Icon name="x" size={20} /></button>
                    </div>
                  ) : (
                    <button type="button" className="upload-target" onClick={() => fileInput.current.click()} disabled={isReading}>
                      <span className="upload-cross" aria-hidden="true" />
                      <span className="upload-title">{isReading ? 'Opening photo…' : isDragging ? 'Drop it here' : 'Drop a photo here'}</span>
                      <span className="upload-description">or <span>choose a file <Icon name="arrow-up-right" size={14} /></span></span>
                      <span className="file-requirements">JPG, PNG, WEBP / UP TO 10 MB</span>
                    </button>
                  )}
                  {isDragging && photo && <div className="drop-overlay">Drop to replace this photo</div>}
                </div>

                {photo && <div className="selected-file">
                  <div><strong title={photo.file.name}>{photo.file.name}</strong><span>{fileSize(photo.file.size)} · {photo.width} × {photo.height}</span></div>
                  <button className="text-button" onClick={() => fileInput.current.click()} disabled={isReading}>{isReading ? 'Opening…' : 'Replace photo'}</button>
                </div>}
                {error && <div className="inline-message error-message" role="alert"><Icon name="info" size={17} /><span>{error}</span></div>}
                <div className="upload-actions">
                  <p>Your photo stays<br />in this browser.</p>
                  <button type="button" className="button button-primary search-button" disabled={!photo || isReading} onClick={() => setSearchNotice(true)}>Search faces <Icon name="arrow-right" size={19} /></button>
                </div>
                {searchNotice ? <div className="inline-message connection-message" role="status"><Icon name="info" size={17} /><span>Search isn’t connected yet. Your photo has not been sent anywhere.</span></div> : <p className="development-note">Photo preview is available. Search is still in development.</p>}
              </section>
              <PhotoNotes />
            </div>
            <Results showPreview={showPreview} onPreview={() => setShowPreview(true)} onClosePreview={() => setShowPreview(false)} />
    </>
  )
  const pages = [
    { ...NAV_ITEMS[0], content: <LandingPage /> },
    { ...NAV_ITEMS[1], content: searchPage },
    { ...NAV_ITEMS[2], content: <InfoView view="how-it-works" onStartSearch={() => goTo('search')} /> },
    { ...NAV_ITEMS[3], content: <InfoView view="dataset" onStartSearch={() => goTo('search')} /> },
    { ...NAV_ITEMS[4], content: <SourcePage /> },
  ]

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`} data-view={view}>
      <a className="skip-link" href={`#panel-${view}`} onClick={(event) => {
        event.preventDefault()
        setMenuOpen(false)
        window.requestAnimationFrame(() => focusPanel(view))
      }}>Skip to content</a>

      <div className="global-theme"><ThemeToggle /></div>

      <header className="site-header">
        <a href="#home" className="brand" aria-label="who r u home" aria-current={view === 'home' ? 'page' : undefined} onClick={(event) => {
          event.preventDefault()
          goTo('home')
        }}><span>who r u</span></a>
        <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
          Menu <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
        </button>
      </header>

      <nav ref={mobileNavigation} id="mobile-navigation" className={`mobile-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="mobile-nav-link" aria-current={view === item.id ? 'page' : undefined} onClick={(event) => {
            event.preventDefault()
            goTo(item.id)
          }}>{item.label}</a>
        ))}
      </nav>

      <main id="main-content" className="panel-deck" aria-label="Pages" inert={menuOpen} style={{ '--tab-count': NAV_ITEMS.length }}>
        {pages.map((page, index) => {
          const active = view === page.id
          return (
            <section key={page.id} className={`deck-panel ${index <= activeIndex ? 'is-open' : ''} ${active ? 'is-active' : ''}`} style={{ '--panel-index': index }} aria-label={page.label}>
              <button type="button" id={`tab-${page.id}`} className="panel-tab" aria-expanded={active} aria-controls={`panel-${page.id}`} onClick={() => goTo(page.id)}><span>{page.label}</span></button>
              <div id={`panel-${page.id}`} className="panel-body" ref={(node) => { panelNodes.current[page.id] = node }} tabIndex={-1} aria-hidden={!active} inert={!active}>
                <div className="main-content">{page.content}</div>
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}

export default function App() {
  return <ThemeProvider><AppPages /></ThemeProvider>
}
