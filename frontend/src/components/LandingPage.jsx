import Icon from './Icon'

const contourScales = Array.from({ length: 9 }, (_, index) => 1 - index * 0.075)
const faceContour = 'M300 72C170 72 82 160 96 278C110 392 198 495 300 532C402 495 490 392 504 278C518 160 430 72 300 72Z'

export default function LandingPage() {
  return (
    <section className="landing-page" aria-labelledby="landing-heading">
      <div className="landing-visual" aria-hidden="true">
        <svg viewBox="0 0 600 600" fill="none" focusable="false">
          <circle cx="300" cy="300" r="246" stroke="currentColor" strokeWidth="0.65" opacity="0.3" />
          <g stroke="currentColor" strokeWidth="1" opacity="0.72">
            {contourScales.map((scale) => (
              <path
                key={scale}
                d={faceContour}
                transform={`translate(300 300) scale(${scale}) translate(-300 -300)`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <g stroke="currentColor" strokeWidth="0.8" opacity="0.35">
            <path d="M42 300h24m468 0h24M300 42v24m0 468v24" />
            <path d="M291 300h18m-9-9v18" />
          </g>
        </svg>
        <p className="landing-caption">IMDB–WIKI / Face similarity</p>
      </div>

      <div className="landing-copy">
        <h1 className="landing-title" id="landing-heading">Search<br />by face.</h1>
        <p className="landing-description">
          Use a photo to explore similar faces in the IMDB–WIKI collection.
        </p>
        <a className="landing-action" href="#search">
          Open face search <Icon name="arrow-up-right" size={21} />
        </a>
        <div className="landing-details">
          <p>JPG, PNG, WebP · Up to 10 MB</p>
          <p>Photo preview is ready. Matching is in development.</p>
        </div>
      </div>
    </section>
  )
}
