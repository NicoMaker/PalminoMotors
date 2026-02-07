# Palmino Motors - Hub Collegamenti Web

Applicazione web moderna per centralizzare tutti i link e le informazioni di Palmino Motors, concessionaria di moto dal 1954.

## 📋 Descrizione

Questa applicazione fornisce un hub centralizzato dove i clienti possono accedere a tutti i canali online di Palmino Motors:
- Sito web ufficiale
- Marketplace (Moto.it, Subito.it)
- Social media (Facebook, Instagram)
- Servizi (Google Maps, contatti)

## 🎨 Caratteristiche Design

- **Estetica Industriale/Sportiva**: Design ispirato al mondo delle moto con colori rosso racing (#E63946) e blu navy (#1D3557)
- **Tipografia Distintiva**: Font Oswald per i titoli e Barlow per il testo, che evocano velocità e dinamismo
- **Animazioni Fluide**: Transizioni e hover effects che rendono l'interfaccia coinvolgente
- **Responsive Design**: Perfettamente utilizzabile su desktop, tablet e smartphone
- **Effetti Visivi**: Gradiente noise overlay, card hover con glow effect, animazioni staggered

## 📁 Struttura File

```
palmino-motors/
├── index.html          # Pagina principale HTML
├── styles.css          # Stili CSS con design industriale/sportivo
├── app.js              # Logica JavaScript per gestione dinamica
├── company-data.json   # Dati aziendali (indirizzo, contatti, P.IVA, ecc.)
├── links-data.json     # Collegamenti a tutti i servizi online
├── logo.svg            # Logo vettoriale Palmino Motors
├── logo.png            # Logo in formato PNG
└── README.md           # Questo file
```

## 🚀 Come Utilizzare

### Installazione Base

1. **Scarica tutti i file** in una cartella sul tuo computer
2. **Apri `index.html`** con un browser moderno (Chrome, Firefox, Safari, Edge)
3. L'applicazione è pronta! Non richiede installazione di software aggiuntivo

### Personalizzazione dei Dati

#### Modificare i Dati Aziendali (`company-data.json`)

```json
{
  "company": {
    "name": "Palmino Motors",
    "address": "Viale Venezia, 161",
    "city": "Codroipo",
    "cap": "33033",
    "province": "UD",
    "email": "info@palminomotors.com",
    "phone": "+39 349 002 8627",
    "piva": "01234567890"
  }
}
```

#### Aggiungere/Modificare Link (`links-data.json`)

Per aggiungere un nuovo link, inserisci un nuovo oggetto nell'array `links`:

```json
{
  "id": "nuovo-link",
  "title": "Titolo del Link",
  "description": "Descrizione del servizio",
  "url": "https://esempio.com",
  "platform": "Nome Piattaforma",
  "icon": "🔗",
  "category": "categoria",
  "active": true
}
```

**Icone disponibili (emoji):**
- 🏠 Home/Sito principale
- 🏍️ Moto/Marketplace
- 🛒 Shopping/E-commerce
- 📘 Facebook
- 📸 Instagram
- 📍 Mappa/Posizione
- 📧 Email
- 📞 Telefono
- ⚙️ Servizi
- 🔧 Assistenza

### Personalizzare il Logo

1. **Sostituisci `logo.png`** con il tuo logo (dimensione consigliata: 500x500px)
2. Il logo viene utilizzato sia nell'header che nel footer
3. Se usi SVG, sostituisci anche `logo.svg`

## 🎨 Personalizzazione Colori

Per cambiare i colori del tema, modifica le variabili CSS in `styles.css`:

```css
:root {
    --primary-color: #E63946;      /* Rosso principale */
    --secondary-color: #1D3557;    /* Blu navy */
    --accent-color: #F1FAEE;       /* Bianco sporco */
    --dark-bg: #0A0E27;            /* Sfondo scuro */
    --mid-gray: #457B9D;           /* Grigio-blu */
}
```

## 📱 Compatibilità

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🌐 Deploy Online

### Opzione 1: GitHub Pages (Gratis)

1. Crea un repository su GitHub
2. Carica tutti i file
3. Vai su Settings → Pages
4. Seleziona il branch `main` come fonte
5. Il sito sarà disponibile su `https://tuousername.github.io/repository-name`

### Opzione 2: Netlify (Gratis)

1. Crea account su [Netlify](https://www.netlify.com)
2. Trascina la cartella sul sito Netlify
3. Il sito sarà online in pochi secondi

### Opzione 3: Hosting Web Tradizionale

1. Carica tutti i file via FTP sul tuo hosting
2. Assicurati che `index.html` sia nella root
3. Verifica che i file JSON siano accessibili

## 🔧 Funzionalità JavaScript

L'applicazione include:

- **Caricamento Dinamico**: I dati vengono caricati dai file JSON
- **Animazioni Scroll**: Le card appaiono gradualmente durante lo scroll
- **Effetti Hover**: Ripple effect e glow sulle card
- **Gestione Errori**: Messaggi informativi in caso di problemi
- **Smooth Scroll**: Navigazione fluida tra le sezioni
- **Responsive**: Adattamento automatico a tutti i dispositivi

## 📊 SEO e Performance

- **Semantic HTML**: Struttura HTML5 corretta per migliore indicizzazione
- **Meta Tags**: Pronti per essere personalizzati
- **Performance**: CSS e JS ottimizzati, nessuna dipendenza esterna pesante
- **Accessibilità**: Contrasti colori conformi WCAG, navigazione keyboard-friendly

## 🐛 Risoluzione Problemi

### I link non si caricano

- Verifica che `links-data.json` sia nella stessa cartella di `index.html`
- Controlla la console del browser (F12) per eventuali errori
- Assicurati che il JSON sia valido su [JSONLint](https://jsonlint.com)

### Il logo non appare

- Verifica che `logo.png` esista nella cartella
- Controlla che il nome file sia esattamente `logo.png` (case-sensitive)
- Prova ad aprire direttamente `logo.png` nel browser

### Problemi su hosting web

- Alcuni hosting richiedono permessi speciali per file JSON
- Verifica che i file abbiano permessi di lettura (644)
- Controlla che il server supporti i tipi MIME corretti

## 📝 Licenza

Questo progetto è stato creato per Palmino Motors. Tutti i diritti riservati.

## 📧 Contatti

Per supporto o domande:
- Email: info@palminomotors.com
- Telefono: +39 349 002 8627
- Indirizzo: Viale Venezia, 161 - 33033 Codroipo (UD)

---

**Palmino Motors** - Dal 1954 la tua passione per le due ruote 🏍️
