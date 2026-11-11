import Icon from './Icon'

const searchSteps = [
  {
    title: 'Choose a photo',
    description:
      'Use a clear image of one face, looking forward. You can check the preview and replace the photo before continuing.',
    status: 'Ready',
  },
  {
    title: 'Generate an embedding',
    description:
      'The face engine will convert the image into a set of numbers that describes its visual features.',
    status: 'Planned',
  },
  {
    title: 'Compare with the dataset',
    description:
      'The search will return the nearest images from the local collection, along with the metadata available for each one.',
    status: 'Planned',
  },
]

function HowItWorks({ onStartSearch }) {
  return (
    <article className="info-article">
      <header className="page-intro">
        <h1>How it works</h1>
        <p className="page-description">
          Compare a photo with faces in the IMDB–WIKI dataset.
          The photo preview is available now; search is still in development.
        </p>
      </header>

      <ul className="process-list">
        {searchSteps.map((step) => (
          <li className="process-row" key={step.title}>
            <div className="process-copy">
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </div>
            <span className="process-status">{step.status}</span>
          </li>
        ))}
      </ul>

      <div className="info-note">
        <p>Your photo stays in this browser. No image is sent while search is unavailable.</p>
        <button className="button button-primary" type="button" onClick={onStartSearch}>
          Back to search <Icon name="arrow-right" size={17} />
        </button>
      </div>
    </article>
  )
}

function Dataset({ onStartSearch }) {
  return (
    <article className="info-article">
      <header className="page-intro">
        <h1>The dataset</h1>
        <p className="page-description">
          IMDB–WIKI is a research dataset of face photographs collected from
          IMDB and Wikipedia. This project prepares a local copy for similarity search.
        </p>
      </header>

      <dl className="dataset-details">
        <div className="dataset-row">
          <dt>Collection</dt>
          <dd>IMDB–WIKI</dd>
        </div>
        <div className="dataset-row">
          <dt>Image format</dt>
          <dd>224 × 224 pixels, RGB</dd>
        </div>
        <div className="dataset-row">
          <dt>Preparation</dt>
          <dd>Low-confidence and multiple-face images are filtered out before resizing.</dd>
        </div>
        <div className="dataset-row">
          <dt>Local storage</dt>
          <dd>One HDF5 file containing image pixels, dates of birth, and the dataset’s gender values.</dd>
        </div>
        <div className="dataset-row">
          <dt>Search index</dt>
          <dd>Planned. Embeddings and the vector index have not been connected to this interface.</dd>
        </div>
      </dl>

      <section className="info-note" aria-labelledby="metadata-heading">
        <div>
          <h2 className="info-heading" id="metadata-heading">Metadata still to add</h2>
          <p>
            Names and source paths are not retained by the current preprocessing
            pipeline. They need to be stored before they can appear in results.
          </p>
        </div>
        <button className="button button-primary" type="button" onClick={onStartSearch}>
          Back to search <Icon name="arrow-right" size={17} />
        </button>
      </section>
    </article>
  )
}

export default function InfoView({ view, onStartSearch }) {
  return view === 'dataset'
    ? <Dataset onStartSearch={onStartSearch} />
    : <HowItWorks onStartSearch={onStartSearch} />
}
