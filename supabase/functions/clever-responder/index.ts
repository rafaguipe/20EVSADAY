import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== INICIANDO ENVIO EM MASSA (BATCH) ===');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase environment variables')
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Admin check
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()
    if (profileError || !profile?.is_admin) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get request body
    const { subject, message } = await req.json()
    if (!subject || !message) {
      return new Response(JSON.stringify({ error: 'Subject and message are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get all users with confirmed emails
    const { data: allUsers, error: usersError } = await supabaseClient
      .rpc('get_all_users_with_emails')
    if (usersError) {
      return new Response(JSON.stringify({ error: 'Failed to get users: ' + usersError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const usersToEmail = allUsers
      .filter(user => user.email_confirmed_at !== null)
      .map(user => ({
        user_id: user.user_id,
        username: user.username || user.full_name || 'Usuário',
        email: user.email
      }))

    console.log('Found users to email:', usersToEmail.length)

    // Divide em lotes de até 100
    const batchChunks = chunkArray(usersToEmail, 100);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const chunk of batchChunks) {
      const batchMessages = chunk.map(userToEmail => ({
        from: 'contato@jogosevolutivos.com.br',
        to: [userToEmail.email],
        subject: subject.replace(/{usuario}/g, userToEmail.username),
        html: generateCustomEmailHTML(
          subject.replace(/{usuario}/g, userToEmail.username),
          message.replace(/{usuario}/g, userToEmail.username),
          userToEmail.username
        ),
      }));

      const batchResult = await sendBatchEmails(batchMessages);
      console.log('Batch result:', batchResult);

      if (Array.isArray(batchResult)) {
        for (let i = 0; i < chunk.length; i++) {
          const userToEmail = chunk[i];
          const result = batchResult[i];
          const emailSent = !result?.error;
          const logData = {
            user_id: userToEmail.user_id,
            username: userToEmail.username,
            email: userToEmail.email,
            status: emailSent ? 'sent' : 'failed',
            sent_at: new Date().toISOString(),
            email_type: 'custom_bulk',
            subject: subject.replace(/{usuario}/g, userToEmail.username)
          }
          await supabaseClient.from('welcome_email_logs').insert(logData)
          if (emailSent) {
            successCount++;
            results.push({ user_id: userToEmail.user_id, email: userToEmail.email, success: true, message: 'Email sent successfully' });
          } else {
            errorCount++;
            results.push({ user_id: userToEmail.user_id, email: userToEmail.email, success: false, error: result?.error?.message || 'Failed to send email' });
          }
        }
      } else {
        // fallback: erro geral
        errorCount += chunk.length;
        chunk.forEach(userToEmail => {
          results.push({ user_id: userToEmail.user_id, email: userToEmail.email, success: false, error: 'Batch send failed' });
        })
      }
    }

    const response = {
      success: true,
      message: `Processamento concluído: ${successCount} sucessos, ${errorCount} erros`,
      processed: usersToEmail.length,
      success_count: successCount,
      error_count: errorCount,
      results: results
    }

    console.log('Bulk custom email processing completed:', response)

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in bulk custom email function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

function generateCustomEmailHTML(subject, message, username) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 2.5em; font-weight: bold; color: #4CAF50; margin-bottom: 10px; }
        .message-content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2196F3; }
        .cta-button { display: inline-block; background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; transition: background-color 0.3s; }
        .cta-button:hover { background-color: #45a049; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em; }
        h2 { color: #4CAF50; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎮 #20EVSADAY</div>
          <h2>Olá, ${username}! 👋</h2>
        </div>
        <div class="message-content">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align: center;">
          <a href="${Deno.env.get('SITE_URL') || 'https://20-evsaday.vercel.app'}" class="cta-button">
            🎮 Acessar #20EVSADAY
          </a>
        </div>
        <div class="footer">
          <p><strong>#20EVSADAY</strong> - Sistema de Estados Vibracionais Gamificado</p>
          <p>Desenvolvido para a comunidade conscienciológica</p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendBatchEmails(batchMessages) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return batchMessages.map(() => true); // Simula envio em dev
    const { Resend } = await import('https://esm.sh/resend@2.0.0');
    const resend = new Resend(resendApiKey);
    const { error, data } = await resend.batch.send(batchMessages);
    if (error) {
      console.error('Batch send error:', error);
      return batchMessages.map(() => ({ error }));
    }
    return data;
  } catch (error) {
    console.error('Batch send error:', error);
    return batchMessages.map(() => ({ error }));
  }
}
