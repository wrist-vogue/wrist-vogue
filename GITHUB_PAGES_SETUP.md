# Wrist Vogue - GitHub Pages Deployment Guide

This is a static React website built for GitHub Pages. Follow these steps to deploy your luxury watch store online.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Node.js and npm/pnpm installed

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right and select **New repository**
3. Name it `wrist-vogue` (or any name you prefer)
4. Make it **Public** (required for GitHub Pages)
5. Click **Create repository**

## Step 2: Initialize Git and Push Code

```bash
cd /path/to/wrist-vogue
git init
git add .
git commit -m "Initial commit: Wrist Vogue luxury watch store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wrist-vogue.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll down to **Pages** section
4. Under "Build and deployment":
   - Select **Deploy from a branch**
   - Select branch: **main**
   - Select folder: **/ (root)**
5. Click **Save**

## Step 4: Build and Deploy

The website will automatically build and deploy when you push to the `main` branch. The build process:

1. Installs dependencies
2. Builds the React app
3. Deploys to `https://YOUR_USERNAME.github.io/wrist-vogue/`

**Note:** The first deployment may take 5-10 minutes. Subsequent deployments are faster.

## Step 5: Verify Deployment

After a few minutes, visit: `https://YOUR_USERNAME.github.io/wrist-vogue/`

Your luxury watch store is now live!

## Making Updates

To update products, content, or design:

1. Make changes locally
2. Test with `pnpm dev`
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update: [describe your changes]"
   git push
   ```
4. GitHub will automatically rebuild and redeploy

## Using the Admin Panel

To manage products:

1. Visit `/admin` on your local development server
2. Add, edit, or delete products
3. Changes are saved to browser's localStorage
4. **Important:** These changes are only saved locally. To persist them:
   - Export products from admin panel (if implemented)
   - Or manually add products via the admin interface each time

## Custom Domain (Optional)

To use a custom domain like `wristvogue.com`:

1. Go to **Settings > Pages**
2. Under "Custom domain", enter your domain
3. Update your domain's DNS settings (instructions provided by GitHub)

## Features Included

- **Minimalist Luxury Design:** Deep black background with gold accents
- **Product Categories:** Men, Women, Accessories
- **Search Functionality:** Find products by name or description
- **Shopping Cart:** Add/remove items, adjust quantities
- **Mobile Responsive:** Works perfectly on all devices
- **Smooth Animations:** Elegant transitions and hover effects
- **Admin Panel:** Easy product management at `/admin`
- **Contact Section:** Email, phone, and location information
- **Local Storage:** Cart and products saved in browser

## Customization

### Update Contact Information

Edit `client/src/pages/Home.tsx` and find the Contact Section:

```tsx
<a href="mailto:your-email@example.com">
  your-email@example.com
</a>
```

### Change Brand Name

Replace "WRIST VOGUE" with your brand name in:
- `client/src/pages/Home.tsx` (line 1)
- `client/src/pages/Admin.tsx` (line 1)
- `client/index.html` (title tag)

### Modify Colors

Edit `client/src/index.css` to change the gold accent color:

```css
--primary: oklch(0.85 0.01 45);  /* Change this for different accent color */
```

## Troubleshooting

**Site not deploying?**
- Ensure the repository is public
- Check that GitHub Pages is enabled in Settings
- Wait 5-10 minutes for the first deployment

**Products not showing?**
- Clear browser cache and localStorage
- Go to `/admin` and add products again
- Products are stored in browser localStorage, not on the server

**Styling looks wrong?**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+Shift+R)

## Support

For issues with:
- **React/Code:** Check the component files in `client/src/`
- **Styling:** Edit `client/src/index.css`
- **GitHub Pages:** Visit [GitHub Pages Documentation](https://docs.github.com/en/pages)

## License

This project is open source and available under the MIT License.

---

**Congratulations!** Your luxury watch store is now ready to showcase to the world. 🎉
