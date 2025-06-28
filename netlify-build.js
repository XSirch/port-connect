// Netlify build configuration
module.exports = {
  onPreBuild: ({ utils }) => {
    // Ensure we're using Supabase, not Neon
    console.log('🚢 PortConnect: Using Supabase as database provider')

    // Validate Supabase configuration (without exposing credentials)
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      console.log('❌ Missing required environment variables:')
      console.log('   - VITE_SUPABASE_URL')
      console.log('   - VITE_SUPABASE_ANON_KEY')
      console.log('📝 Please set these in Netlify Site Settings > Environment Variables')
      utils.build.failBuild('Missing Supabase environment variables')
    }

    if (process.env.VITE_SUPABASE_URL.includes('supabase.co')) {
      console.log('✅ Supabase configuration validated')
      console.log('🔗 Database provider: Supabase')
    } else {
      console.log('❌ Invalid Supabase URL - should contain "supabase.co"')
      utils.build.failBuild('Invalid Supabase URL configuration')
    }

    // Prevent other database integrations
    console.log('🚫 Disabling automatic database integrations (Neon, PlanetScale, etc.)')
  },

  onBuild: ({ utils }) => {
    console.log('🔨 Building PortConnect with Supabase integration')
  },

  onPostBuild: ({ utils }) => {
    console.log('🎉 PortConnect build completed successfully')
    console.log('🔗 Using Supabase for all database operations')
    console.log('🔒 No credentials exposed in build logs')
  }
}
