# Creating an OG Image for Questify

## Current Setup

I've added Open Graph meta tags to `index.html` that reference:
```
https://questify-frontend-ruby.vercel.app/og-image.png
```

## How to Add the Image

### Option 1: Create and Add Image (Recommended)

1. **Create an image** (1200x630 pixels recommended):
   - Use tools like Canva, Figma, or Photoshop
   - Include: Questify logo, tagline "Student Engagement MCQ System"
   - Save as `og-image.png`

2. **Place the image** in the `public` folder:
   ```
   Questify-frontend/frontend/public/og-image.png
   ```

3. **Commit and push**:
   ```powershell
   cd Questify-frontend/frontend
   git add public/og-image.png
   git commit -m "Add OG image for social sharing"
   git push origin main
   ```

### Option 2: Use a Placeholder Service

You can use a service like:
- https://og-image.vercel.app/
- https://www.opengraph.xyz/

Or update the meta tag to use a hosted image URL.

### Option 3: Use a URL from Your Landing Page

You can also use the placeholder image from your landing page:
```html
<meta property="og:image" content="https://placehold.co/1200x630/5c6bc0/ffffff?text=Questify+Platform" />
```

## Image Specifications

- **Recommended size**: 1200x630 pixels
- **Format**: PNG or JPG
- **File size**: Under 1MB
- **Content**: Should represent your app visually

## Test Your OG Tags

After adding the image, test it:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/



