import os
import urllib.request
import tarfile
import ssl
from pathlib import Path

# Fix for SSL certificate verification errors in some environments
ssl._create_default_https_context = ssl._create_unverified_context

DATA_DIR = Path(__file__).parent / "data"

URLS = {
    "imdb": "https://data.vision.ee.ethz.ch/cvl/rrothe/imdb-wiki/static/imdb_crop.tar",
    "wiki": "https://data.vision.ee.ethz.ch/cvl/rrothe/imdb-wiki/static/wiki_crop.tar"
}

def download_file(url, output_path):
    print(f"Downloading {url} to {output_path}...")
    
    # Use a browser-like user agent to prevent throttling
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    
    with urllib.request.urlopen(req) as response, open(output_path, 'wb') as out_file:
        total_size = int(response.getheader('Content-Length', 0))
        block_size = 1024 * 1024  # 1MB chunks for faster downloading
        downloaded = 0
        
        while True:
            buffer = response.read(block_size)
            if not buffer:
                break
            out_file.write(buffer)
            downloaded += len(buffer)
            
            if total_size > 0:
                percent = int((downloaded / total_size) * 100)
                print(f"\rDownloading: {percent}% ({downloaded // (1024*1024)}MB / {total_size // (1024*1024)}MB)", end="")
                
    print("\nDownload complete.")

def extract_tar(tar_path, extract_path):
    print(f"Extracting {tar_path} to {extract_path}...")
    with tarfile.open(tar_path, "r") as tar:
        tar.extractall(path=extract_path)
    print("Extraction complete.")

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    for name, url in URLS.items():
        tar_path = DATA_DIR / f"{name}_crop.tar"
        extracted_dir = DATA_DIR / f"{name}_crop"
        
        # If the tar file already exists, delete it to redownload
        if tar_path.exists():
            print(f"{tar_path.name} already exists. Deleting it to redownload...")
            tar_path.unlink()
            
        # Download
        download_file(url, tar_path)
            
        # If the extracted directory already exists, delete it to re-extract
        if extracted_dir.exists():
            print(f"Directory {extracted_dir.name} already exists. Deleting it to re-extract...")
            import shutil
            shutil.rmtree(extracted_dir)
            
        # Extract
        extract_tar(tar_path, DATA_DIR)

    print("All tasks completed successfully!")

if __name__ == "__main__":
    main()
