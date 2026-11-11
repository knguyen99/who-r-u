# who-r-u frontend

The React + Vite interface for the local face search project. This skeleton lets you explore the upload and results layout while the recognition backend is being built.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Create a production build with `npm run build`. Use `npm run preview` to serve that build locally.

## Current scope

- Pick an image or drag and drop a JPEG, PNG, or WebP up to 10 MB.
- Preview the selected image, then replace or remove it.
- Start on the Home landing view, then open Search, How it works, Dataset, or GitHub.
- Explore a sample results layout. Samples demonstrate the interface only; they contain no identified people or recognition scores.

Selected images stay in the browser. This frontend does not upload them, send search requests, or perform face recognition. Resetting the selection clears the preview.

## Backend integration

`backend/main.py` and `backend/db.py` are currently empty, and `backend/face_engine.py` only imports DeepFace. There is no search API to call yet. The skeleton deliberately does not invent a working endpoint.

The project roadmap calls for FastAPI to extract an embedding from an uploaded image, query ChromaDB, and return similar dataset images with metadata. The preprocessing pipeline currently preserves images, dates of birth, and gender values in HDF5; it does not retain names or source paths. Those fields and stable image IDs need to be retained before the backend can serve named results and image URLs.

### Proposed API, not implemented

A future integration could use `POST /api/search` with a multipart `image` field and an optional result `limit`. A response could contain:

```json
{
  "matches": [
    {
      "id": "stable-image-id",
      "image_url": "/api/images/stable-image-id",
      "name": null,
      "similarity": 0.0,
      "source": "IMDB-WIKI"
    }
  ],
  "elapsed_ms": 0
}
```

Confirm the endpoint, available metadata, similarity scale, error responses, and image-serving behavior when implementing the backend. The UI will then need request handling for loading, empty results, validation errors, and connection failures, plus local development CORS or a Vite proxy.
