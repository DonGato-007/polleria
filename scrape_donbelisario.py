import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin, urlparse
import time

def scrape_images(url, output_folder='imagenes_donbelisario'):
    """
    Scrape images from Don Belisario website
    """
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    print(f"Scraping images from: {url}")
    
    try:
        # Set headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Get the webpage
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all image tags
        img_tags = soup.find_all('img')
        
        print(f"Found {len(img_tags)} image tags")
        
        downloaded = 0
        
        for idx, img in enumerate(img_tags, 1):
            # Get image URL from src or data-src attributes
            img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            
            if not img_url:
                continue
            
            # Convert relative URLs to absolute
            img_url = urljoin(url, img_url)
            
            # Skip data URIs and very small images
            if img_url.startswith('data:') or 'logo' in img_url.lower():
                continue
            
            try:
                # Get image filename
                parsed_url = urlparse(img_url)
                filename = os.path.basename(parsed_url.path)
                
                # If no filename, create one
                if not filename or '.' not in filename:
                    ext = '.jpg'
                    if 'png' in img_url.lower():
                        ext = '.png'
                    elif 'webp' in img_url.lower():
                        ext = '.webp'
                    filename = f'image_{idx}{ext}'
                
                filepath = os.path.join(output_folder, filename)
                
                # Download image
                print(f"Downloading {idx}/{len(img_tags)}: {filename}")
                img_response = requests.get(img_url, headers=headers, timeout=10)
                img_response.raise_for_status()
                
                # Save image
                with open(filepath, 'wb') as f:
                    f.write(img_response.content)
                
                downloaded += 1
                print(f"✓ Saved: {filepath}")
                
                # Be polite - add delay between requests
                time.sleep(0.5)
                
            except Exception as e:
                print(f"✗ Error downloading {img_url}: {str(e)}")
                continue
        
        print(f"\n{'='*50}")
        print(f"Download complete!")
        print(f"Total images downloaded: {downloaded}")
        print(f"Saved to folder: {output_folder}")
        print(f"{'='*50}")
        
        return downloaded
        
    except Exception as e:
        print(f"Error scraping website: {str(e)}")
        return 0

if __name__ == "__main__":
    url = "https://www.donbelisario.com.pe/"
    scrape_images(url)
