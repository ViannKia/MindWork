# Supabase Storage Setup - Avatar Upload

## Problem
Getting 500 error when uploading avatar because the `Avatar` storage bucket is not properly configured.

## Solution

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://asfirdaaqltynfstjhvg.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `Avatar` (case-sensitive, must match exactly)
   - **Public bucket**: ✅ **Enable** (so avatars can be viewed publicly)
   - **File size limit**: 2 MB (optional, for safety)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp` (optional)
5. Click **Create bucket**

---

### Step 2: Set Up RLS Policies

After creating the bucket, you need to add RLS policies so users can upload and view avatars.

Go to **Storage** → **Policies** → Select `Avatar` bucket → Click **New Policy**

#### Policy 1: Allow Users to Upload Their Own Avatars

```sql
-- Policy Name: Users can upload their own avatars
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Avatar' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation**: Users can only upload files to their own folder (`userId/filename.jpg`)

---

#### Policy 2: Allow Public Read Access to Avatars

```sql
-- Policy Name: Public read access to avatars
-- Operation: SELECT
-- Target roles: public, authenticated

CREATE POLICY "Public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Avatar');
```

**Explanation**: Anyone can view avatars (needed for public profile display)

---

#### Policy 3: Allow Users to Delete Their Own Avatars

```sql
-- Policy Name: Users can delete their own avatars
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Avatar' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation**: Users can delete old avatars from their own folder (for cleanup)

---

### Step 3: Verify Setup

Run this SQL query in **SQL Editor** to verify your policies:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'Avatar';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

### Step 4: Test Avatar Upload

1. Go to your app: http://localhost:3000/profile
2. Click on the avatar upload button
3. Select an image (JPG, PNG, or WebP, max 2MB)
4. Upload should succeed without 500 error
5. Avatar should display immediately

---

## Alternative: SQL Script to Create Everything

If you prefer to run everything at once, use this SQL script in **SQL Editor**:

```sql
-- Create Avatar bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('Avatar', 'Avatar', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Upload own avatars
CREATE POLICY IF NOT EXISTS "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Avatar' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Public read access
CREATE POLICY IF NOT EXISTS "Public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Avatar');

-- Policy 3: Delete own avatars
CREATE POLICY IF NOT EXISTS "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Avatar' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Troubleshooting

### Still getting 500 error?

1. **Check browser console** for detailed error message
2. **Check Supabase logs**: Dashboard → Logs → API Logs
3. **Verify bucket name**: Must be exactly `Avatar` (case-sensitive)
4. **Verify RLS is enabled**: Storage → Avatar → Settings → RLS should be ON
5. **Check file size**: Must be under 2MB
6. **Check file type**: Must be JPG, PNG, or WebP

### Common Issues

- **"Bucket not found"**: Bucket name is case-sensitive, must be `Avatar`
- **"Permission denied"**: RLS policies not set up correctly
- **"File too large"**: File exceeds 2MB limit
- **"Invalid file type"**: File is not JPG, PNG, or WebP

---

## File Structure in Storage

After upload, files will be stored as:

```
Avatar/
  └── {userId}/
      ├── 1234567890.jpg
      ├── 1234567891.png
      └── 1234567892.webp
```

Each user has their own folder, and old avatars are automatically cleaned up.

---

## Next Steps

After setting up storage:

1. ✅ Users can upload profile pictures
2. ✅ Avatars are publicly accessible
3. ✅ Old avatars are automatically deleted
4. ✅ File validation (size, type) works
5. ✅ Preview shows before upload completes

---

## Related Files

- `src/lib/upload-avatar.ts` - Upload logic
- `src/components/profile/avatar-upload.tsx` - UI component
- `src/app/profile/page.tsx` - Profile page
- `src/lib/dashboard/queries.ts` - Database queries
