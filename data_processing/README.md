# Data Processing

This folder contains scripts used to clean, prepare, and digest the raw datasets into an optimized format for machine learning and backend usage.

## Scripts

### `preprocess_to_hdf5.py`

This script processes the raw [IMDB-Wiki dataset](https://data.vision.ee.ethz.ch/cvl/rrothe/imdb-wiki/) (`.mat` metadata and `.jpg` images) and compiles it into a single, highly-optimized HDF5 database (`imdb_wiki.h5`). 

**What the script does:**
1. **Metadata Parsing:** Reads the `imdb.mat` and `wiki.mat` files and combines them.
2. **Date Conversion:** Converts the obscure MATLAB serial date numbers into standard Unix timestamps (stored as `float64`), making them compatible with normal backend date handling.
3. **Data Cleaning:** Filters out low-quality/noisy data. Specifically, it drops entries where the face detection score is `< 1.0` and removes images containing multiple faces.
4. **Image Processing:** Reads every valid image, converts it to standard RGB, resizes it uniformly to `224x224`, and stores it as an uncompressed `uint8` array for maximum read speed.
5. **Database Creation:** Outputs `data/imdb_wiki.h5` containing three synchronized datasets:
   - `images`: `(N, 224, 224, 3)` array of RGB images.
   - `dobs`: `(N,)` array of Unix timestamps representing the person's Date of Birth.
   - `genders`: `(N,)` array of floats where `1.0` is Male, `0.0` is Female.

**Usage:**
```bash
pip install -r requirements.txt
python data_processing/preprocess_to_hdf5.py
```
*(Note: Processing half a million images takes a considerable amount of time depending on disk speed. A progress bar is provided.)*
