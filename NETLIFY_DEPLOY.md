# 🚀 Netlify Deployment Guide for PortConnect

## 📋 Prerequisites

1. **Supabase Project**: Ensure your Supabase project is set up and running
2. **Netlify Account**: Create a free account at [netlify.com](https://netlify.com)
3. **GitHub Repository**: Code should be pushed to GitHub

## 🔧 Environment Variables Setup

### **CRITICAL**: Never commit credentials to git!

In your Netlify dashboard, go to:
**Site Settings > Environment Variables**

Add the following variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to get Supabase credentials:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings > API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## 🚀 Deployment Steps

### 1. Connect Repository
- In Netlify dashboard, click "New site from Git"
- Connect your GitHub account
- Select the PortConnect repository

### 2. Build Settings
Netlify should auto-detect these settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `20.19.3`

### 3. Environment Variables
- Add the Supabase credentials as described above
- **DO NOT** add them to the code or netlify.toml file

### 4. Deploy
- Click "Deploy site"
- Wait for build to complete
- Your site will be available at a Netlify URL

## 🔒 Security Best Practices

✅ **DO:**
- Set environment variables in Netlify UI
- Use the anon/public key (not service role key)
- Enable RLS (Row Level Security) in Supabase
- Keep credentials in Netlify environment variables

❌ **DON'T:**
- Commit .env files with real credentials
- Put credentials in netlify.toml
- Use service role keys in frontend
- Share credentials in chat/email

## 🐛 Troubleshooting

### Build Fails with "Missing Supabase environment variables"
- Check that you've added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify UI
- Ensure variable names are exactly as shown (case-sensitive)

### App loads but can't connect to database
- Verify Supabase URL is correct (should end with .supabase.co)
- Check that anon key is the public key, not service role key
- Ensure RLS policies are configured in Supabase

### "Neon database detected" error
- This should not happen with current configuration
- If it does, check that no Neon-related packages are installed
- Verify Supabase credentials are correctly set

## 📞 Support

If you encounter issues:
1. Check Netlify build logs for specific errors
2. Verify Supabase credentials in project dashboard
3. Ensure all environment variables are set correctly
