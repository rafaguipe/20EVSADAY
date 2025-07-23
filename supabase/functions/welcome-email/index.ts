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
    console.log('=== WELCOME EMAIL FUNCTION STARTED ===')
    
    // Create a Supabase client with service role key for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      throw new Error('Missing Supabase environment variables')
    }

    console.log('Supabase URL:', supabaseUrl)
    console.log('Service key exists:', !!supabaseServiceKey)

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
    console.log('Token received, length:', token.length)
    
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
    console.log('User email:', user.email)

    // Get user profile
    console.log('Fetching profile for user:', user.id)
    let { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('username, email')
      .eq('user_id', user.id)
      .single()

    console.log('Profile fetch result:', { profile, error: profileError })

    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating new profile for user:', user.id)
      
      const newProfileData = {
        user_id: user.id,
        username: user.user_metadata?.nickname || user.email?.split('@')[0] || 'Usuário',
        full_name: user.user_metadata?.full_name || user.user_metadata?.nickname || user.email?.split('@')[0] || 'Usuário',
        avatar_url: 'avatar_1.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Creating profile with data:', newProfileData)
      
      const { data: newProfile, error: createError } = await supabaseClient
        .from('profiles')
        .insert(newProfileData)
        .select('username, email')
        .single()

      console.log('Profile creation result:', { newProfile, error: createError })

      if (createError) {
        console.error('Error creating profile:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create profile: ' + createError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      profile = newProfile;
    } else if (profileError) {
      console.error('Error fetching profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Profile error: ' + profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile) {
      console.error('Profile is null after fetch/create')
      return new Response(
        JSON.stringify({ error: 'Profile not found and could not be created' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Profile ready:', profile)

    // Generate welcome email HTML
    const htmlContent = generateWelcomeEmailHTML(profile.username)
    console.log('HTML content generated, length:', htmlContent.length)

    // Send welcome email
    console.log('Sending welcome email to:', profile.email)
    const emailSent = await sendWelcomeEmail(profile.email, profile.username, htmlContent)
    console.log('Email send result:', emailSent)

    // Log the email attempt
    const logData = {
      user_id: user.id,
      username: profile.username,
      email: profile.email,
      status: emailSent ? 'sent' : 'failed',
      sent_at: new Date().toISOString(),
    }
    
    console.log('Logging email attempt:', logData)
    
    const { error: logError } = await supabaseClient
      .from('welcome_email_logs')
      .insert(logData)

    if (logError) {
      console.error('Error logging email:', logError)
    } else {
      console.log('Email logged successfully')
    }

    const response = {
      success: true, 
      message: emailSent ? 'Email de boas-vindas enviado com sucesso!' : 'Erro ao enviar email de boas-vindas',
      email_sent: emailSent,
      user: {
        id: user.id,
        username: profile.username,
        email: profile.email
      }
    }

    console.log('Returning response:', response)

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in welcome email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateWelcomeEmailHTML(username) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao EVSADAY!</title>
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
        .highlight {
          background-color: #e8f5e8;
          border-left: 4px solid #4CAF50;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .feature {
          background-color: #f9f9f9;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 3px solid #2196F3;
        }
        .feature h3 {
          margin-top: 0;
          color: #2196F3;
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
        h3 {
          color: #2196F3;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎮 EVSADAY</div>
          <h2>Olá, ${username}! 👋</h2>
          
          <p>Seja muito bem-vindo(a) ao <strong>EVSADAY</strong> - o sistema gamificado para registro e acompanhamento dos seus Estados Vibracionais (EVs)!</p>

          <div class="highlight">
            <strong>🎉 Parabéns!</strong> Seu email foi validado com sucesso e você já pode começar a registrar seus EVs!
          </div>

          <h3>🚀 O que você pode fazer agora:</h3>

          <div class="feature">
            <h3>📊 Registrar EVs</h3>
            <p>Registre seus Estados Vibracionais diariamente com pontuação de 0 a 4 e observações detalhadas.</p>
          </div>

          <div class="feature">
            <h3>🏆 Conquistar Badges</h3>
            <p>Ganhe badges especiais por marcos como 20 EVs em um dia, 500 EVs totais, e muito mais!</p>
          </div>

          <div class="feature">
            <h3>📈 Acompanhar Progresso</h3>
            <p>Visualize suas estatísticas, médias e progresso ao longo do tempo.</p>
          </div>

          <div class="feature">
            <h3>🏅 Competir no Ranking</h3>
            <p>Veja como você se posiciona em relação a outros conscienciólogos no ranking global.</p>
          </div>

          <div class="feature">
            <h3>⏰ Lembretes Automáticos</h3>
            <p>Receba lembretes personalizados para registrar seus EVs no intervalo que você definir.</p>
          </div>

          <div class="feature">
            <h3>📚 Multimídia</h3>
            <p>Acesse referências, artigos, verbetes e vídeos sobre Conscienciologia.</p>
          </div>

          <div style="text-align: center;">
            <a href="${Deno.env.get('SITE_URL') || 'https://evsaday.vercel.app'}" class="cta-button">
              🎮 Começar a Jogar!
            </a>
          </div>

          <div class="highlight">
            <strong>💡 Dica:</strong> Comece registrando pelo menos 1 EV por dia. A consistência é a chave para o desenvolvimento consciencial!
          </div>
        </div>

        <div class="footer">
          <p><strong>EVSADAY</strong> - Sistema de Estados Vibracionais Gamificado</p>
          <p>Desenvolvido para a comunidade conscienciológica</p>
          <p>📧 Dúvidas? Entre em contato conosco</p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendWelcomeEmail(email, username, htmlContent) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email send')
      console.log('Email would be sent to:', email)
      console.log('Username:', username)
      console.log('Subject: 🎮 Bem-vindo ao EVSADAY, ' + username + '!')
      console.log('HTML Content length:', htmlContent.length)
      
      // Para teste, vamos simular o envio
      console.log('=== SIMULAÇÃO DE ENVIO DE EMAIL ===')
      console.log('De: EVSADAY <noreply@evsaday.com>')
      console.log('Para:', email)
      console.log('Assunto: 🎮 Bem-vindo ao EVSADAY, ' + username + '!')
      console.log('=== FIM DA SIMULAÇÃO ===')
      
      return true // Return true for testing purposes
    }

    // Use Resend SDK
    const { Resend } = await import('https://esm.sh/resend@2.0.0')
    const resend = new Resend(resendApiKey)

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use o email padrão do Resend para testes
      to: [email],
      subject: `🎮 Bem-vindo ao EVSADAY, ${username}!`,
      html: htmlContent,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return false
    }

    console.log('Welcome email sent successfully to:', email)
    console.log('Resend response:', data)
    return true

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
} 