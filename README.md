# Wrist Vogue - Luxury Watch E-Commerce Store

A stunning, minimalist luxury watch e-commerce website built with React, Tailwind CSS, and designed for GitHub Pages deployment.

## 🎨 Design Philosophy

**Minimalist Luxury - "The Void Elegance"**

The design emphasizes spectacle through restraint. Against a deep black void, luxury watches become the absolute focal point, with 24K gold accents highlighting interactive elements. Every detail—from typography to animations—reinforces the brand's exclusivity and sophistication.

### Visual Features

- **Color Palette:** Deep black (#0a0a0a), pure white (#ffffff), 24K gold (#d4af37)
- **Typography:** Playfair Display (elegant headings) + Lato (clean body text)
- **Animations:** Smooth 300-400ms transitions, fade-ins, and slide effects
- **Layout:** Asymmetrical, sparse 2-column product grid with generous whitespace
- **Interactions:** Gold underlines on hover, subtle scale effects, smooth transitions

## ✨ Features

### For Customers

- **Hero Section:** Stunning full-screen hero with luxury watch imagery
- **Product Browsing:** Sparse, elegant 2-column grid layout
- **Category Filtering:** Browse Men's, Women's, or Accessories collections
- **Search Functionality:** Find products by name or description
- **Shopping Cart:** Add/remove items, adjust quantities, view total
- **Responsive Design:** Perfect on mobile, tablet, and desktop
- **Contact Information:** Email, phone, and location details

### For Store Owners

- **Admin Panel:** Accessible at `/admin`
- **Product Management:** Add, edit, and delete products
- **Easy Setup:** No backend required, everything stored locally
- **GitHub Pages Ready:** Deploy in minutes with no hosting costs
- **Customizable:** Easy to modify colors, fonts, and content

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open in browser
# http://localhost:3000
```

### Admin Panel

Visit `http://localhost:3000/admin` to manage products.

## 📦 Project Structure

```
wrist-vogue/
├── client/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx     # Main store page
│   │   │   ├── Admin.tsx    # Product management
│   │   │   └── NotFound.tsx # 404 page
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── App.tsx          # Main app with routing
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles & design tokens
│   └── index.html           # HTML template
├── server/                  # Placeholder for compatibility
├── package.json             # Dependencies
└── README.md               # This file
```

## 🎯 Key Components

### Home Page (`client/src/pages/Home.tsx`)

The main storefront featuring:
- Fixed navigation header with cart icon
- Mobile slide-out menu
- Full-screen hero section
- Product search and filtering
- Shopping cart sidebar
- Contact section
- Footer

### Admin Page (`client/src/pages/Admin.tsx`)

Product management interface with:
- Add new products form
- Edit existing products
- Delete products
- Product table view
- Form validation
- LocalStorage persistence

## 🛠️ Customization

### Update Brand Information

**In `client/src/pages/Home.tsx`:**
```tsx
<h1 className="text-2xl font-bold tracking-wider">YOUR BRAND NAME</h1>
```

**In `client/index.html`:**
```html
<title>Your Brand - Luxury Watch Store</title>
```

### Change Contact Details

**In `client/src/pages/Home.tsx` (Contact Section):**
```tsx
<a href="mailto:your-email@example.com">
  your-email@example.com
</a>
```

### Modify Colors

**In `client/src/index.css`:**
```css
:root {
  --primary: oklch(0.85 0.01 45);  /* Gold accent */
  --background: oklch(0.05 0.01 0);  /* Deep black */
  --foreground: oklch(0.95 0.01 0);  /* Pure white */
}
```

### Add Custom Fonts

**In `client/index.html`:**
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap" rel="stylesheet" />
```

Then update `client/src/index.css`:
```css
body {
  font-family: 'YourFont', sans-serif;
}
```

## 📱 Responsive Design

The website is fully responsive:
- **Mobile:** Single column, slide-out menu
- **Tablet:** Optimized layout with touch-friendly buttons
- **Desktop:** Full 2-column grid, horizontal navigation

## 🔄 Data Management

### Product Storage

Products are stored in browser's `localStorage`:
- Automatically saved when added/edited/deleted
- Persists across browser sessions
- No server required

### Cart Management

Shopping cart is also stored in `localStorage`:
- Survives page refreshes
- Clears when browser data is cleared
- Each browser has its own cart

## 🚀 Deployment to GitHub Pages

See [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md) for detailed deployment instructions.

Quick summary:
1. Create a GitHub repository
2. Push code to `main` branch
3. Enable GitHub Pages in Settings
4. Your site will be live at `https://username.github.io/wrist-vogue/`

## 🎨 Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `oklch(0.85 0.01 45)` | Gold accents, hover states |
| Background | `oklch(0.05 0.01 0)` | Main background |
| Foreground | `oklch(0.95 0.01 0)` | Text color |
| Card | `oklch(0.08 0.01 0)` | Card backgrounds |
| Border | `oklch(0.2 0.01 0)` | Borders and dividers |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Playfair Display | 48-64px | 700 |
| H2 | Playfair Display | 32-48px | 600 |
| Body | Lato | 16px | 400 |
| Caption | Lato | 12-14px | 400 |

### Spacing

- Container padding: 1rem (mobile), 1.5rem (tablet), 2rem (desktop)
- Gap between items: 12px, 24px, 32px
- Section padding: 20px-40px vertical

## 🔐 Security Considerations

- No user authentication required
- No sensitive data stored on server
- All data stored in browser's localStorage
- No API calls to external services
- Safe for public GitHub repository

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork, modify, and improve this template for your own luxury watch store!

## 📞 Support

For questions or issues:
1. Check the [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md) guide
2. Review the component code in `client/src/`
3. Check browser console for errors (F12)

---

**Built with ❤️ for luxury watch enthusiasts**

Ready to showcase your timepieces to the world? Deploy to GitHub Pages today! 🚀
