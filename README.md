# Face Search Engine (Local)

A full-stack, local facial recognition search engine. This project ingests public profile pictures from the IMDB-WIKI dataset, generates 128-dimensional face embeddings using DeepFace, and performs vector similarity searches using ChromaDB.

## 🏗 System Architecture
*   **Frontend:** React (Vite) with drag-and-drop file upload.
*   **Backend API:** FastAPI handling asynchronous image processing.
*   **AI Engine:** DeepFace (VGG-Face/Facenet) for facial detection and embedding extraction.
*   **Vector DB:** ChromaDB for Cosine Similarity matching.
*   **Dataset:** IMDB-WIKI Face-Only Dataset (over 500k images with metadata).

## 📋 Planning & Roadmap

### Data Preprocessing Strategy
To prevent severe disk I/O bottlenecks when reading 500,000+ tiny JPEG images, we process the raw data into a single, uncompressed **HDF5 Database**. This involves parsing MATLAB metadata to convert datenums to standard Unix timestamps, filtering out images with multiple faces or low confidence scores, and uniformly resizing images to `224x224`. This guarantees blazing-fast sequential reads during model embedding.

### Epic Checklist
- [x] **Dataset Acquisition:** Scripts to fetch and extract the massive IMDB-Wiki face dataset.
- [x] **Data Preprocessing Pipeline:** Clean raw data and compile 500k+ images into an optimized HDF5 database.
- [ ] **Vector Database Ingestion:** Batch process the HDF5 database through DeepFace to generate 128D embeddings and index them into ChromaDB.
- [ ] **Backend Search API:** Build FastAPI endpoints for real-time image upload, feature extraction, and nearest-neighbor vector matching.
- [ ] **Frontend Interface:** Develop a React/Vite UI with drag-and-drop support to present visual search results and metadata.

## 🚀 Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/knguyen99/who-r-u.git
cd face-search-engine
```

### 2. Backend & AI Setup (Conda)
You must have Conda installed to manage the C++ dependencies required for the ML models.
```bash
conda create --name who-r-u python=3.11 -y
conda activate who-r-u
pip install -r requirements.txt
```

### 3. Download the Dataset
Before searching, you need to populate the local database with faces. We use the IMDB-WIKI dataset, which contains over 500k face images and associated metadata (names, age, gender).
```bash
# Run the download script to fetch and extract the IMDB-WIKI face images
# This script intelligently downloads the data in 1MB chunks and extracts the tarballs.
python download_imdb_wiki.py
```

### 4. Preprocess the Dataset
After downloading, process the raw image files and `.mat` metadata into an optimized HDF5 database.
```bash
python data_processing/preprocess_to_hdf5.py
```

### 5. How the Face Search Works (Indexing & Querying)
1. **Ingestion & Indexing:** We parse the `.mat` metadata files included in the dataset. DeepFace extracts a 128-dimensional embedding for each face. 
2. **Vector Storage:** These embeddings, along with the person's name and metadata, are stored in ChromaDB (running locally).
3. **Similarity Search:** When you upload an image to the frontend, FastAPI passes it to DeepFace to generate an embedding. We then query ChromaDB for the closest vector using Cosine Similarity, returning the nearest matches in milliseconds.

### 6. Run the Servers
**Start the FastAPI Backend:**
```bash
cd backend
fastapi dev main.py
```

**Start the React Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🧠 Technical Decisions & Trade-offs
*   **Why ChromaDB?** I chose ChromaDB over FAISS or Pinecone because it can run entirely entirely in-memory or via local SQLite-backed storage, keeping this project free of cloud-computing costs during development.
*   **Dataset Choice:** Utilizing the IMDB-WIKI dataset provides a massive baseline of diverse, real-world faces and robust metadata, allowing the search engine to be tested at a realistic scale without relying on live web scraping.
