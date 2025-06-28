// Environment variables check for Netlify build
console.log('🔍 Checking environment variables...')

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
]

let allPresent = true

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: Present`)
    if (varName === 'VITE_SUPABASE_URL' && value.includes('supabase.co')) {
      console.log('   ✅ Valid Supabase URL format')
    }
  } else {
    console.log(`❌ ${varName}: Missing`)
    allPresent = false
  }
})

if (allPresent) {
  console.log('🎉 All required environment variables are present!')
  console.log('🚢 PortConnect is ready to build with Supabase')
} else {
  console.log('⚠️  Missing required environment variables')
  console.log('📝 Please set them in Netlify Site Settings > Environment Variables')
  process.exit(1)
}
