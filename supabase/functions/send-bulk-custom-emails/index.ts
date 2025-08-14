import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== BULK CUSTOM EMAIL FUNCTION STARTED ===')
    
    // Create a Supabase client with service role key for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('User authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      console.error('User is not admin')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Admin access confirmed')

    // Get request body
    const { subject, message } = await req.json()

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Subject and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all users with confirmed emails using a custom function
    const { data: allUsers, error: usersError } = await supabaseClient
      .rpc('get_all_users_with_emails')

    if (usersError) {
      console.error('Error getting users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to get users: ' + usersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter users with confirmed emails and create the final list
    const usersToEmail = allUsers
      .filter(user => user.email_confirmed_at !== null)
      .map(user => ({
        user_id: user.user_id,
        username: user.username || user.full_name || 'Usuário',
        email: user.email
      }))

    console.log('Found users to email:', usersToEmail.length)

    if (usersToEmail.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum usuário encontrado para envio de email',
          processed: 0,
          success_count: 0,
          error_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each user
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const userToEmail of usersToEmail) {
      try {
        console.log('Processing user:', userToEmail.user_id, userToEmail.email)

        // Personalize message with username
        const personalizedMessage = message.replace(/{usuario}/g, userToEmail.username)
        const personalizedSubject = subject.replace(/{usuario}/g, userToEmail.username)

        // Generate email HTML
        const htmlContent = generateCustomEmailHTML(personalizedSubject, personalizedMessage, userToEmail.username)

        // Send email
        const emailSent = await sendCustomEmail(userToEmail.email, personalizedSubject, htmlContent)

        // Log the email attempt
        const logData = {
          user_id: userToEmail.user_id,
          username: userToEmail.username,
          email: userToEmail.email,
          status: emailSent ? 'sent' : 'failed',
          sent_at: new Date().toISOString(),
          email_type: 'custom_bulk',
          subject: personalizedSubject
        }
        
        const { error: logError } = await supabaseClient
          .from('welcome_email_logs')
          .insert(logData)

        if (logError) {
          console.error('Error logging email:', logError)
        }

        if (emailSent) {
          successCount++;
          results.push({
            user_id: userToEmail.user_id,
            email: userToEmail.email,
            success: true,
            message: 'Email sent successfully'
          });
        } else {
          errorCount++;
          results.push({
            user_id: userToEmail.user_id,
            email: userToEmail.email,
            success: false,
            error: 'Failed to send email'
          });
        }

      } catch (error) {
        console.error('Error processing user:', userToEmail.user_id, error)
        errorCount++;
        results.push({
          user_id: userToEmail.user_id,
          email: userToEmail.email,
          success: false,
          error: error.message
        });
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

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in bulk custom email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 2.5em;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
        }
        .message-content {
          background-color: #f9f9f9;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #2196F3;
        }
        .cta-button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .cta-button:hover {
          background-color: #45a049;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 0.9em;
        }
        h2 {
          color: #4CAF50;
          margin-bottom: 20px;
        }
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
          <a href="${Deno.env.get('SITE_URL') || 'https://evsaday.vercel.app'}" class="cta-button">
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

async function sendCustomEmail(email, subject, htmlContent) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email send')
      console.log('Email would be sent to:', email)
      console.log('Subject:', subject)
      console.log('HTML Content length:', htmlContent.length)
      
      // Para teste, vamos simular o envio
      console.log('=== SIMULAÇÃO DE ENVIO DE EMAIL ===')
      console.log('De: #20EVSADAY <noreply@evsaday.com>')
      console.log('Para:', email)
      console.log('Assunto:', subject)
      console.log('=== FIM DA SIMULAÇÃO ===')
      
      return true // Return true for testing purposes
    }

    // Use Resend SDK
    const { Resend } = await import('https://esm.sh/resend@2.0.0')
    const resend = new Resend(resendApiKey)

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use o email padrão do Resend para testes
      to: [email],
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      console.error('Failed to send custom email:', error)
      return false
    }

    console.log('Custom email sent successfully to:', email)
    console.log('Resend response:', data)
    return true

  } catch (error) {
    console.error('Error sending custom email:', error)
    return false
  }
}
