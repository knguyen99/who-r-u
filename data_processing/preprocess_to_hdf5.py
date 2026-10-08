import os
import cv2
import h5py
import numpy as np
from scipy.io import loadmat
import pandas as pd
from tqdm import tqdm

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
IMDB_MAT = os.path.join(DATA_DIR, 'imdb_crop', 'imdb.mat')
WIKI_MAT = os.path.join(DATA_DIR, 'wiki_crop', 'wiki.mat')
OUTPUT_H5 = os.path.join(DATA_DIR, 'imdb_wiki.h5')

IMG_SIZE = 224

def get_mat_data(mat_path, db_name):
    # db_name is 'imdb' or 'wiki'
    mat = loadmat(mat_path)
    # the data is wrapped in a struct, we need to extract it
    metadata = mat[db_name][0][0]
    
    # MATLAB serial date number to python datetime/year
    # MATLAB's datenum starts from Jan 1, year 0000. 
    # Python's datetime starts from Jan 1, year 0001.
    # The offset is 366 days.
    
    dob = metadata[0][0]
    photo_taken = metadata[1][0]
    full_path = metadata[2][0]
    gender = metadata[3][0]
    name = metadata[4][0]
    face_score = metadata[6][0]
    second_face_score = metadata[7][0]
    
    # Convert DOB to full date string
    dobs = []
    for d in dob:
        try:
            # convert mat datenum to datetime
            date_obj = pd.to_datetime(d - 719529, unit='D', origin='1970-01-01')
            dobs.append(date_obj.timestamp())
        except:
            dobs.append(np.nan)
            
    dobs = np.array(dobs, dtype=np.float64)
    
    # Extract paths
    paths = []
    for path in full_path:
        paths.append(path[0])
        
    df = pd.DataFrame({
        'path': paths,
        'db': db_name,
        'dob': dobs,
        'gender': gender,
        'face_score': face_score,
        'second_face_score': second_face_score
    })
    
    return df

def clean_data(df):
    # Filter face_score >= 1.0
    df = df[df['face_score'] >= 1.0]
    
    # Filter exactly one face (second_face_score is NaN)
    df = df[pd.isna(df['second_face_score'])]
    
    return df

def main():
    print("Loading IMDB metadata...")
    imdb_df = get_mat_data(IMDB_MAT, 'imdb')
    print(f"IMDB Initial size: {len(imdb_df)}")
    
    print("Loading Wiki metadata...")
    wiki_df = get_mat_data(WIKI_MAT, 'wiki')
    print(f"Wiki Initial size: {len(wiki_df)}")
    
    # Combine datasets
    df = pd.concat([imdb_df, wiki_df], ignore_index=True)
    print(f"Combined size: {len(df)}")
    
    print("Cleaning data...")
    df = clean_data(df)
    print(f"Cleaned size: {len(df)}")
    
    # Shuffle dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    num_samples = len(df)
    
    print(f"Creating HDF5 file at {OUTPUT_H5}...")
    with h5py.File(OUTPUT_H5, 'w') as h5f:
        # Create datasets
        # We store images as uint8 to save space
        images_ds = h5f.create_dataset(
            'images', 
            shape=(num_samples, IMG_SIZE, IMG_SIZE, 3), 
            maxshape=(num_samples, IMG_SIZE, IMG_SIZE, 3),
            dtype=np.uint8,
            # No compression for max speed as requested
        )
        
        dobs_ds = h5f.create_dataset(
            'dobs', 
            shape=(num_samples,), 
            maxshape=(num_samples,),
            dtype=np.float64
        )
        
        genders_ds = h5f.create_dataset(
            'genders', 
            shape=(num_samples,), 
            maxshape=(num_samples,),
            dtype=np.float32 # 0 or 1
        )
        
        valid_indices = []
        write_idx = 0
        
        print("Processing images...")
        for i, row in tqdm(df.iterrows(), total=num_samples):
            # Construct full path
            db_name = row['db']
            rel_path = row['path']
            img_path = os.path.join(DATA_DIR, f"{db_name}_crop", rel_path)
            
            try:
                # Read image
                img = cv2.imread(img_path)
                if img is None:
                    continue
                    
                # Convert BGR to RGB
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                
                # Resize
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                
                # Write to HDF5
                images_ds[write_idx] = img
                dobs_ds[write_idx] = row['dob']
                genders_ds[write_idx] = row['gender']
                
                write_idx += 1
                valid_indices.append(i)
                
            except Exception as e:
                # print(f"Error processing {img_path}: {e}")
                pass
                
        # Resize datasets to actual number of successfully processed images
        images_ds.resize(write_idx, axis=0)
        dobs_ds.resize(write_idx, axis=0)
        genders_ds.resize(write_idx, axis=0)
        
        print(f"Successfully processed {write_idx} images out of {num_samples} cleaned entries.")
        
if __name__ == '__main__':
    main()
