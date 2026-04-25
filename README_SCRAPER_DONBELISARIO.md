# Scraper de Imágenes - Don Belisario

Scripts para descargar imágenes del sitio web de Don Belisario.

## Archivos

1. **scrape_donbelisario.py** - Versión básica con requests y BeautifulSoup
2. **scrape_donbelisario_selenium.py** - Versión avanzada con Selenium (captura imágenes dinámicas)

## Instalación de Dependencias

### Método 1: Versión Básica (Recomendada para empezar)

```bash
pip install requests beautifulsoup4
```

### Método 2: Versión con Selenium (Más completa)

```bash
pip install requests beautifulsoup4 selenium
```

También necesitas instalar Chrome WebDriver:
- Descarga desde: https://chromedriver.chromium.org/
- O instala con: `pip install webdriver-manager`

## Uso

### Versión Básica

```bash
python scrape_donbelisario.py
```

### Versión con Selenium

```bash
python scrape_donbelisario_selenium.py
```

## Resultado

Las imágenes se guardarán en la carpeta `imagenes_donbelisario/`

## Notas Importantes

⚠️ **Uso Responsable**:
- Este script es solo para uso educativo y personal
- Respeta los términos de servicio del sitio web
- No sobrecargues el servidor con demasiadas peticiones
- Las imágenes pueden estar protegidas por derechos de autor

## Características

✅ Descarga automática de imágenes
✅ Manejo de URLs relativas y absolutas
✅ Filtrado de logos e íconos
✅ Delay entre peticiones para ser respetuoso con el servidor
✅ Manejo de errores robusto
✅ Progreso en tiempo real

## Solución de Problemas

**Error: No module named 'requests'**
```bash
pip install requests beautifulsoup4
```

**Error: ChromeDriver not found**
```bash
pip install webdriver-manager
```

**Error: Connection timeout**
- Verifica tu conexión a internet
- El sitio web puede estar bloqueando el scraping
- Intenta aumentar el timeout en el código

## Alternativa Manual

Si los scripts no funcionan, puedes descargar las imágenes manualmente:

1. Visita https://www.donbelisario.com.pe/
2. Haz clic derecho en las imágenes que quieras
3. Selecciona "Guardar imagen como..."
4. Guárdalas en la carpeta `imagenes_donbelisario/`
