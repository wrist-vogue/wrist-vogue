# Wrist Vogue - Product Setup Guide

This guide will help you add your own luxury watch products to the store.

## Adding Products via Admin Panel

The easiest way to add products is through the Admin Panel:

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Open Admin Panel:**
   - Visit `http://localhost:3000/admin`
   - Click **Add Product** button

3. **Fill in Product Details:**
   - **Product Name:** e.g., "Chronograph Elite"
   - **Category:** Select Men, Women, or Accessories
   - **Price:** Enter price in dollars (e.g., 2499)
   - **Image URL:** Paste the full URL to the product image
   - **Description:** Brief product description

4. **Submit:**
   - Click **Add Product**
   - Product appears in the store immediately

## Finding Product Images

You need image URLs for each product. Here are some options:

### Option 1: Use Free Stock Photos

- **Unsplash:** https://unsplash.com (search "luxury watch")
- **Pexels:** https://pexels.com (search "watch")
- **Pixabay:** https://pixabay.com (search "watch")

Copy the image URL and paste it in the admin form.

### Option 2: Use Your Own Images

1. Upload your image to a free hosting service:
   - **Imgur:** https://imgur.com (upload and copy URL)
   - **ImgBB:** https://imgbb.com (upload and copy URL)
   - **Cloudinary:** https://cloudinary.com (free tier available)

2. Copy the image URL and paste it in the admin form

### Option 3: Use AI-Generated Images

If you don't have product photos, you can generate them:
- **Midjourney:** https://midjourney.com
- **DALL-E:** https://openai.com/dall-e-2
- **Stable Diffusion:** https://stablediffusionweb.com

Example prompt: "Luxury men's mechanical wristwatch, polished stainless steel case, black leather strap, white dial with gold hour markers, professional product photography, on black background"

## Sample Products to Get Started

Here are some example products you can add:

### Men's Watches

**Chronograph Elite**
- Category: Men
- Price: $2,499
- Description: Premium men's chronograph with Swiss movement and sapphire crystal

**Aviator Classic**
- Category: Men
- Price: $1,799
- Description: Vintage-inspired pilot watch with leather strap and precision movement

**Diver's Pro**
- Category: Men
- Price: $2,199
- Description: Water-resistant dive watch with rotating bezel and steel bracelet

### Women's Watches

**Rose Gold Elegance**
- Category: Women
- Price: $1,899
- Description: Elegant rose gold watch with mother-of-pearl dial and leather strap

**Diamond Sparkle**
- Category: Women
- Price: $2,799
- Description: Luxury watch with diamond indices and sapphire crystal

**Minimalist Beauty**
- Category: Women
- Price: $1,299
- Description: Sleek minimalist design with slim profile and precision movement

### Accessories

**Premium Leather Strap**
- Category: Accessories
- Price: $299
- Description: Handcrafted Italian leather watch strap with gold buckle

**Steel Bracelet**
- Category: Accessories
- Price: $399
- Description: Polished stainless steel bracelet compatible with most watches

**Watch Case**
- Category: Accessories
- Price: $149
- Description: Premium leather watch case with velvet lining

**Cleaning Kit**
- Category: Accessories
- Price: $79
- Description: Professional watch cleaning kit with microfiber cloth and tools

## Editing Products

To edit an existing product:

1. Go to Admin Panel (`/admin`)
2. Find the product in the table
3. Click the **Edit** icon (pencil)
4. Modify the details
5. Click **Update Product**

## Deleting Products

To remove a product:

1. Go to Admin Panel (`/admin`)
2. Find the product in the table
3. Click the **Delete** icon (trash)
4. Confirm deletion

## Product Data Format

Each product has the following structure:

```javascript
{
  id: "unique-id",
  name: "Product Name",
  category: "men" | "women" | "accessories",
  price: 1999,
  image: "https://example.com/image.jpg",
  description: "Product description"
}
```

## Exporting Products

To backup your products:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Paste this command:
   ```javascript
   copy(JSON.stringify(JSON.parse(localStorage.getItem('wristVogueProducts')), null, 2))
   ```
4. Paste the copied data into a text file to save

## Importing Products

To restore products from a backup:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Paste this command (replace with your data):
   ```javascript
   localStorage.setItem('wristVogueProducts', JSON.stringify([
     {
       "id": "1",
       "name": "Chronograph Elite",
       "category": "men",
       "price": 2499,
       "image": "https://...",
       "description": "Premium men's chronograph"
     }
   ]))
   ```
4. Refresh the page

## Tips for Success

### Product Images

- **Size:** Aim for square images (1:1 aspect ratio)
- **Quality:** Use high-resolution images (at least 800x800px)
- **Background:** Transparent or solid black background works best
- **Format:** JPG or PNG

### Product Descriptions

- Keep descriptions concise (1-2 sentences)
- Highlight key features (material, movement type, water resistance)
- Use professional language
- Avoid excessive marketing language

### Pricing

- Research competitor pricing
- Consider your cost and desired profit margin
- Use psychological pricing ($1,999 vs $2,000)
- Include currency symbol in descriptions if needed

### Categories

- **Men:** Watches designed for men
- **Women:** Watches designed for women
- **Accessories:** Straps, cases, cleaning kits, etc.

## Troubleshooting

**Products not appearing?**
- Refresh the page
- Check browser's localStorage (F12 > Application > Local Storage)
- Ensure you clicked "Add Product" button

**Image not loading?**
- Check the URL is correct and accessible
- Try a different image URL
- Ensure the URL starts with `http://` or `https://`

**Lost all products?**
- Check if browser data was cleared
- Re-add products via Admin Panel
- Use the export/import feature to backup future products

## Next Steps

1. Add at least 6-8 products to your store
2. Test the search and filter functionality
3. Add items to cart and verify checkout flow
4. Deploy to GitHub Pages
5. Share your store with friends!

---

Happy selling! 🎉
