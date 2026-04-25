from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import requests
import os
import time
from urllib.parse import urljoin, urlparse

def scrape_images_selenium(url, output_folder='imagenes_donbelisario'):
    """
    Scrape images from Don Belisario website using Selenium
    This method can capture dynamically loaded images
    """
    # Create output folder
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    print(f"Scraping images from: {url}")
    print("Starting browser...")
    
    # Configure Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    try:
        # Initialize driver
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(url)
        
        # Wait for page to load
        print("Waiting for page to load...")
        time.sleep(3)
        
        # Scroll to load lazy images
        print("Scrolling to load all images...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        
        for _ in range(5):  # Scroll 5 times
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        # Find all images
        img_elements = driver.find_elements(By.TAG_NAME, 'img')
        
        print(f"Found {len(img_elements)} images")
        
        downloaded = 0
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        for idx, img in enumerate(img_elements, 1):
            try:
                # Get image URL
                img_url = img.get_attribute('src') or img.get_attribute('data-src') or img.get_attribute('data-lazy-src')
                
                if not img_url or img_url.startswith('data:'):
                    continue
                
                # Skip logos and small images
                if 'logo' in img_url.lower() or 'icon' in img_url.lower():
                    continue
                
                # Convert to absolute URL
                img_url = urljoin(url, img_url)
                
                # Get filename
                parsed_url = urlparse(img_url)
                filename = os.path.basename(parsed_url.path)
                
                if not filename or '.' not in filename:
                    ext = '.jpg'
                    if 'png' in img_url.lower():
                        ext = '.png'
                    elif 'webp' in img_url.lower():
                        ext = '.webp'
                    filename = f'donbelisario_{idx}{ext}'
                
                filepath = os.path.join(output_folder, filename)
                
                # Download image
                print(f"Downloading {idx}/{len(img_elements)}: {filename}")
                response = requests.get(img_url, headers=headers, timeout=10)
                response.raise_for_status()
                
                # Check if it's actually an image
                content_type = response.headers.get('content-type', '')
                if 'image' not in content_type:
                    print(f"  Skipping (not an image): {content_type}")
                    continue
                
                # Save image
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                downloaded += 1
                print(f"✓ Saved: {filepath}")
                
                time.sleep(0.3)
                
            except Exception as e:
                print(f"✗ Error with image {idx}: {str(e)}")
                continue
        
        driver.quit()
        
        print(f"\n{'='*50}")
        print(f"Download complete!")
        print(f"Total images downloaded: {downloaded}")
        print(f"Saved to folder: {output_folder}")
        print(f"{'='*50}")
        
        return downloaded
        
    except Exception as e:
        print(f"Error: {str(e)}")
        if 'driver' in locals():
            driver.quit()
        return 0

if __name__ == "__main__":
    url = "https://www.donbelisario.com.pe/"
    scrape_images_selenium(url)
