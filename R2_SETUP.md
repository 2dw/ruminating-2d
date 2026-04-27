# R2 Photo Gallery Setup Guide

This portfolio now supports dynamic photo galleries that fetch images directly from your Cloudflare R2 bucket!

## How It Works

1. **API Route** (`/api/photos`) - Lists all webp files from a specified R2 path
2. **PhotoGallerySection Component** - Renders photos dynamically with no hardcoding needed
3. **Automatic Updates** - Add photos to your R2 bucket and they appear automatically

## Setup Instructions

### 1. Create R2 Bucket and API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Buckets** → Create a bucket (or use existing)
3. Go to **Settings** → **API tokens** → **Create API token**
   - Select "Edit" permissions for your bucket
   - Save the credentials

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
```

**Where to find these values:**
- `R2_ACCOUNT_ID`: Your Cloudflare Account ID (shown in R2 settings)
- `R2_ACCESS_KEY_ID` & `R2_SECRET_ACCESS_KEY`: From your API token
- `R2_BUCKET_NAME`: Name of your R2 bucket
- `R2_ENDPOINT`: Use your account ID to construct this URL

### 3. Organize Your Photos

Upload `.webp` files to your R2 bucket in organized folders:

```
your-bucket/
├── photography/
│   ├── 2006%20baja%20california/
│   │   ├── photo1.webp
│   │   ├── photo2.webp
│   │   └── ...
│   ├── other-collection/
│   │   └── ...
│   └── ...
```

### 4. Use the Component

In your page components, import and use the PhotoGallerySection:

```tsx
import { PhotoGallerySection } from "@/components/photo-gallery-section"

export default function Page() {
  return (
    <div>
      <PhotoGallerySection
        title="My Photos"
        description="Optional description"
        prefix="photography/2006%20baja%20california/"
        columns={3}
      />
    </div>
  )
}
```

**Props:**
- `title` - Gallery section title
- `description` - Optional description text
- `prefix` - R2 path to fetch from (URL-encoded)
- `columns` - Number of columns (1, 2, 3, or 4)

### 5. Current Setup

The Imagery Meanderings section now includes:
- **2006 Baja California Earthwatch Research** - Auto-fetches from `photography/2006%20baja%20california/`
- **Photography Collection** - General gallery from `photography/`

Both will automatically populate with any `.webp` files you upload!

## Features

✅ **Zero Hardcoding** - Just upload photos to R2
✅ **Auto-sorting** - Photos sorted by newest first
✅ **Responsive Grid** - Works on all device sizes
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Shows loading indicator while fetching
✅ **Hover Effects** - Smooth animations and zoom on hover
✅ **Performance** - Optimized image loading with Next.js Image component

## Troubleshooting

**Photos not showing?**
- Check `.env.local` is created and R2 credentials are correct
- Verify photos are `.webp` format (case-sensitive)
- Ensure the prefix path matches exactly (URL encoding matters!)
- Check browser console for error messages

**"Failed to fetch photos"?**
- Verify R2 API token has the correct permissions
- Make sure R2_ENDPOINT includes your full account ID

**Need help?**
- Check the browser Network tab to see API response
- API route is at `/api/photos?prefix=...` for debugging
- Console logs show detailed error information
