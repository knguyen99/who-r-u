import Icon from './Icon'

const meridians = Array.from({ length: 12 }, (_, index) => index * 15)
const points = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2
  return { x: 320 + Math.cos(angle) * 234, y: 320 + Math.sin(angle) * 234 }
})

function SourceGraphic() {
  return (
    <div className="source-visual" aria-hidden="true">
      <svg viewBox="0 0 640 640" fill="none" focusable="false">
        <circle cx="320" cy="320" r="258" className="source-boundary" />
        <g className="source-meridians">
          {meridians.map((angle) => (
            <ellipse key={angle} cx="320" cy="320" rx="234" ry="78" transform={`rotate(${angle} 320 320)`} />
          ))}
        </g>
        <g className="source-connections">
          {points.map((point, index) => {
            const next = points[(index + 5) % points.length]
            return <path key={index} d={`M${point.x} ${point.y}L${next.x} ${next.y}`} />
          })}
        </g>
        <g className="source-nodes">
          {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3" />)}
        </g>
        <circle cx="320" cy="320" r="28" className="source-center" />
        <g className="source-satellite"><circle cx="578" cy="320" r="5" /></g>
      </svg>
    </div>
  )
}

export default function SourcePage() {
  return (
    <article className="source-page" aria-labelledby="source-heading">
      <SourceGraphic />
      <div className="source-copy">
        <h1 id="source-heading">Source code</h1>
        <p>The code, setup instructions, and project roadmap are on GitHub.</p>
        <p>Browse the React interface, FastAPI backend, and dataset preparation scripts.</p>
        <a className="source-action" href="https://github.com/knguyen99/who-r-u" target="_blank" rel="noreferrer">
          View on GitHub <Icon name="arrow-up-right" size={21} />
        </a>
      </div>
    </article>
  )
}
