import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const users = [
    { email: 'admin@fbaradar.com', password: 'lukino4a2', name: 'Hilton', role: 'super_admin', plan: 'pro' },
    { email: 'pablinio@fbaradar.com', password: 'pablinio123', name: 'Pablinio', role: 'admin', plan: 'pro' },
  ]

  const results = []
  for (const u of users) {
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('email', u.email).maybeSingle()
    if (existing) { results.push({ email: u.email, skipped: 'already exists' }); continue }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name },
    })
    if (error) { results.push({ email: u.email, error: error.message }); continue }

    await supabaseAdmin.from('profiles').insert({
      id: data.user.id, name: u.name, email: u.email, plan: u.plan, status: 'active',
    })
    await supabaseAdmin.from('user_roles').insert({ user_id: data.user.id, role: u.role })
    results.push({ email: u.email, success: true })
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
