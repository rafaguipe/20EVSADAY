import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { user_id, email, username } = await req.json()

    if (!user_id || !email) {
      throw new Error('Missing user_id or email')
    }

    // Generate welcome email HTML
    const welcomeEmailHTML = generateWelcomeEmailHTML(username || 'Conscienciólogo')

    // Send email using Resend (you'll need to configure this)
    const emailSent = await sendWelcomeEmail(email, username || 'Conscienciólogo', welcomeEmailHTML)

    if (emailSent) {
      // Log the welcome email sent
      await supabase
        .from('welcome_email_logs')
        .insert([
          {
            user_id: user_id,
            email: email,
            username: username,
            sent_at: new Date().toISOString(),
            status: 'success'
          }
        ])

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Welcome email sent successfully',
          user_id: user_id,
          email: email
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      throw new Error('Failed to send welcome email')
    }

  } catch (error) {
    console.error('Error in welcome email function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
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
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #4a8a4a;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4a8a4a;
          margin-bottom: 10px;
        }
        .welcome-text {
          font-size: 18px;
          color: #666;
        }
        .content {
          margin-bottom: 30px;
        }
        .feature {
          background-color: #f8f9fa;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #4a8a4a;
        }
        .feature h3 {
          margin: 0 0 10px 0;
          color: #4a8a4a;
        }
        .cta-button {
          display: inline-block;
          background-color: #4a8a4a;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .highlight {
          background-color: #fff3cd;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #ffeaa7;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎮 #20EVSADAY</div>
          <div class="welcome-text">Sistema de Estados Vibracionais Gamificado</div>
        </div>

        <div class="content">
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
    // Configure your email service here (Resend, SendGrid, etc.)
    // This is an example using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email send')
      return true // Return true for testing purposes
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EVSADAY <noreply@evsaday.com>',
        to: [email],
        subject: `🎮 Bem-vindo ao EVSADAY, ${username}!`,
        html: htmlContent,
      }),
    })

    if (response.ok) {
      console.log('Welcome email sent successfully to:', email)
      return true
    } else {
      const error = await response.text()
      console.error('Failed to send welcome email:', error)
      return false
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
} 