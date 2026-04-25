#!/usr/bin/env python3
"""
Script para descargar imágenes de Google Maps de la pollería El Fogón
"""

import requests
from bs4 import BeautifulSoup
import os
import time
from urllib.parse import urljoin

def download_image(url, filename, folder='images'):
    """Descarga una imagen desde una URL"""
    try:
        # Crear carpeta si no existe
        if not os.path.exists(folder):
            os.makedirs(folder)
        
        # Headers para simular un navegador
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        filepath = os.path.join(folder, filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Descargada: {filename}")
        return True
    except Exception as e:
        print(f"✗ Error descargando {filename}: {e}")
        return False

def scrape_google_maps_images(place_url):
    """Intenta extraer imágenes de Google Maps"""
    print("Iniciando scraping de Google Maps...")
    print("Nota: Google Maps usa JavaScript dinámico, este método puede tener limitaciones.\n")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(place_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar imágenes en diferentes selectores comunes
        image_urls = set()
        
        # Método 1: Buscar tags img
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and ('googleusercontent' in src or 'ggpht' in src):
                # Limpiar y obtener URL de alta calidad
                if '=w' in src:
                    src = src.split('=w')[0] + '=w1200'
                image_urls.add(src)
        
        # Método 2: Buscar en atributos style con background-image
        for element in soup.find_all(style=True):
            style = element.get('style', '')
            if 'background-image' in style and 'googleusercontent' in style:
                # Extraer URL del style
                start = style.find('url(') + 4
                end = style.find(')', start)
                if start > 3 and end > start:
                    url = style[start:end].strip('\'"')
                    if '=w' in url:
                        url = url.split('=w')[0] + '=w1200'
                    image_urls.add(url)
        
        print(f"Encontradas {len(image_urls)} imágenes potenciales\n")
        
        if not image_urls:
            print("⚠ No se encontraron imágenes con el método de scraping básico.")
            print("\nMétodo alternativo recomendado:")
            print("1. Abre el enlace en tu navegador")
            print("2. Haz clic en las fotos de la pollería")
            print("3. Clic derecho en cada imagen → 'Copiar dirección de imagen'")
            print("4. Pega las URLs en el archivo 'image_urls.txt' (una por línea)")
            print("5. Ejecuta: python scrape_images.py --from-file")
            return []
        
        # Descargar las primeras 5 imágenes
        downloaded = []
        for i, url in enumerate(list(image_urls)[:5], 1):
            filename = f"polleria_fogon_{i}.jpg"
            if download_image(url, filename):
                downloaded.append(filename)
            time.sleep(1)  # Pausa entre descargas
        
        return downloaded
        
    except Exception as e:
        print(f"✗ Error en el scraping: {e}")
        return []

def download_from_file(filename='image_urls.txt'):
    """Descarga imágenes desde un archivo de URLs"""
    if not os.path.exists(filename):
        print(f"✗ Archivo {filename} no encontrado")
        return []
    
    print(f"Leyendo URLs desde {filename}...\n")
    
    downloaded = []
    with open(filename, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    for i, url in enumerate(urls, 1):
        filename = f"polleria_fogon_{i}.jpg"
        if download_image(url, filename):
            downloaded.append(filename)
        time.sleep(1)
    
    return downloaded

def main():
    import sys
    
    print("=" * 60)
    print("  SCRAPER DE IMÁGENES - POLLERÍA EL FOGÓN")
    print("=" * 60)
    print()
    
    if '--from-file' in sys.argv:
        downloaded = download_from_file()
    else:
        url = "https://www.google.com/maps/place/polleria+EL+FOGON/@-14.2692701,-71.2286729,20z/data=!4m22!1m15!4m14!1m6!1m2!1s0x91692acd80aba909:0x5e6b3d538994f28d!2spolleria+EL+FOGON,+Av.+Manuel+Callo+Zevallos+301,+Sicuani+08254!2m2!1d-71.2280818!2d-14.2692696!1m6!1m2!1s0x91692acd80aba909:0x5e6b3d538994f28d!2spolleria+EL+FOGON,+Av.+Manuel+Callo+Zevallos+301,+Sicuani+08254!2m2!1d-71.2280818!2d-14.2692696!3m5!1s0x91692acd80aba909:0x5e6b3d538994f28d!8m2!3d-14.269268!4d-71.2280531!16s%2Fg%2F11hd23d7v0"
        downloaded = scrape_google_maps_images(url)
    
    print("\n" + "=" * 60)
    if downloaded:
        print(f"✓ Descarga completada: {len(downloaded)} imágenes")
        print(f"✓ Ubicación: carpeta 'images/'")
        print("\nArchivos descargados:")
        for img in downloaded:
            print(f"  - {img}")
        print("\nAhora puedes actualizar el HTML con estas imágenes.")
    else:
        print("✗ No se descargaron imágenes")
        print("\n📝 INSTRUCCIONES MANUALES:")
        print("1. Visita el enlace de Google Maps en tu navegador")
        print("2. Haz clic en las fotos del negocio")
        print("3. Clic derecho → 'Copiar dirección de imagen'")
        print("4. Crea un archivo 'image_urls.txt' con las URLs (una por línea)")
        print("5. Ejecuta: python scrape_images.py --from-file")
    print("=" * 60)

if __name__ == "__main__":
    main()
