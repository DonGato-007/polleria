# Scraper de Imágenes - Pollería El Fogón

## Instalación de dependencias

```bash
pip install requests beautifulsoup4
```

## Uso

### Método 1: Scraping automático (puede tener limitaciones)
```bash
python scrape_images.py
```

### Método 2: Desde archivo de URLs (RECOMENDADO)

1. **Obtener las URLs de las imágenes:**
   - Abre el enlace de Google Maps en tu navegador
   - Haz clic en las fotos de la pollería
   - Clic derecho en cada imagen → "Copiar dirección de imagen"
   - Pega las URLs en el archivo `image_urls.txt` (una por línea)

2. **Ejecutar el scraper:**
   ```bash
   python scrape_images.py --from-file
   ```

3. **Las imágenes se descargarán en la carpeta `images/`**

## Actualizar el HTML

Una vez descargadas las imágenes, actualiza el archivo `index.html`:

```html
<!-- Reemplaza las URLs de Unsplash con las imágenes locales -->
<div class="slide slide-1 active" id="slide0">
  <div class="flame-deco">🔥</div>
  <div class="slide-inner">
    <!-- El contenido permanece igual -->
  </div>
</div>
```

Cambia el CSS:
```css
.slide-1 {
  background: linear-gradient(135deg, rgba(139,0,0,0.85) 0%, rgba(204,68,0,0.85) 40%, rgba(26,0,16,0.9) 100%),
              url('images/polleria_fogon_1.jpg') center/cover;
}
.slide-2 {
  background: linear-gradient(135deg, rgba(26,0,16,0.85) 0%, rgba(58,0,32,0.85) 50%, rgba(139,0,0,0.9) 100%),
              url('images/polleria_fogon_2.jpg') center/cover;
}
.slide-3 {
  background: linear-gradient(135deg, rgba(42,0,16,0.85) 0%, rgba(204,68,0,0.85) 60%, rgba(26,0,8,0.9) 100%),
              url('images/polleria_fogon_3.jpg') center/cover;
}
```

## Notas

- Google Maps usa JavaScript dinámico, por lo que el scraping automático puede no funcionar siempre
- El método manual (copiar URLs) es más confiable
- Las imágenes se descargan en alta calidad (w1200)
