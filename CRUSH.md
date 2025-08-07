# CRUSH.md - JSONLight Project Guide

## Project Overview
JSONLight is a web-based JSON viewer that displays string values as raw text with proper line breaks.

## Development Commands
```bash
# Serve locally (if using a local server)
python -m http.server 8000  # Python 3
# or
python -m SimpleHTTPServer 8000  # Python 2

# Open in browser
open http://localhost:8000/docs/
```

## Code Style Guidelines

### HTML/CSS/JavaScript
- **Files**: Main app files in `docs/` directory
- **Naming**: kebab-case for CSS classes, camelCase for JavaScript
- **Structure**: Semantic HTML with Bootstrap for styling
- **JavaScript**: Vanilla JS, no framework dependencies
- **Assets**: Icons in `docs/icon/`, styles in `docs/styles/`, scripts in `docs/scripts/`

### Project Structure
- `docs/` - Web application files (HTML, CSS, JS, assets)
- `docs/index.html` - Main application entry point
- `docs/styles/` - CSS files including Bootstrap
- `docs/scripts/` - JavaScript files
- `docs/icon/` - Favicon and app icons