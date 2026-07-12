import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const riceId = url.searchParams.get('rice_id')
      if (!riceId) throw new Error('rice_id is required')

      const { data, error } = await supabase.rpc('get_vote', {
        p_rice_id: riceId,
        p_ip: ip,
      })
      if (error) throw error

      return new Response(JSON.stringify({ vote: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const { rice_id, vote_type } = await req.json()
      if (!rice_id || !vote_type) throw new Error('rice_id and vote_type are required')

      const { data, error } = await supabase.rpc('cast_vote', {
        p_rice_id: rice_id,
        p_ip: ip,
        p_vote_type: vote_type,
      })
      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
