import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HELP_MESSAGE = `🤖 Bem-vindo ao #20EVSADAY no Telegram!

Comandos disponíveis:
/start - Mostrar ajuda
/link CODIGO - Conectar sua conta
/ev 0-4 [nota] - Registrar um EV
/me - Ver seu resumo
/rank [daily|weekly|monthly|all] - Ver ranking

Exemplo:
/ev 3 EV intenso após prática`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const secretToken = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
    if (secretToken) {
      const headerToken = req.headers.get('x-telegram-bot-api-secret-token')
      if (headerToken !== secretToken) {
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!telegramToken) {
      return new Response('Missing TELEGRAM_BOT_TOKEN', { status: 500 })
    }

    const update = await req.json()
    const message = update.message ?? update.edited_message
    if (!message?.text) {
      return new Response('ok', { headers: corsHeaders })
    }

    const chatId = message.chat?.id
    const text = String(message.text).trim()
    const telegramUser = message.from

    if (!chatId || !telegramUser?.id) {
      return new Response('ok', { headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response('Missing Supabase environment variables', { status: 500 })
    }
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const lowerText = text.toLowerCase()

    if (lowerText.startsWith('/start') || lowerText.startsWith('/help')) {
      await sendTelegramMessage(telegramToken, chatId, HELP_MESSAGE)
      return new Response('ok', { headers: corsHeaders })
    }

    if (lowerText.startsWith('/link')) {
      const parts = text.split(' ').map(part => part.trim()).filter(Boolean)
      const code = parts[1]?.toUpperCase()
      if (!code) {
        await sendTelegramMessage(telegramToken, chatId, 'Use: /link CODIGO (gere o código no seu perfil do site).')
        return new Response('ok', { headers: corsHeaders })
      }

      const { data: existingLink } = await supabaseClient
        .from('telegram_links')
        .select('user_id')
        .eq('telegram_user_id', telegramUser.id)
        .maybeSingle()

      if (existingLink?.user_id) {
        await sendTelegramMessage(telegramToken, chatId, '⚠️ Este Telegram já está vinculado a uma conta. Se quiser trocar, fale com o suporte.')
        return new Response('ok', { headers: corsHeaders })
      }

      const { data: linkCode, error: codeError } = await supabaseClient
        .from('telegram_link_codes')
        .select('id, user_id, expires_at, used_at')
        .eq('code', code)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (codeError || !linkCode?.user_id) {
        await sendTelegramMessage(telegramToken, chatId, '❌ Código inválido ou expirado. Gere um novo no site.')
        return new Response('ok', { headers: corsHeaders })
      }

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('username')
        .eq('user_id', linkCode.user_id)
        .maybeSingle()

      const { error: linkError } = await supabaseClient
        .from('telegram_links')
        .upsert({
          user_id: linkCode.user_id,
          telegram_user_id: telegramUser.id,
          telegram_username: telegramUser.username ?? null,
          chat_id: chatId,
          linked_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (linkError) {
        await sendTelegramMessage(telegramToken, chatId, '❌ Não foi possível vincular agora. Tente novamente.')
        return new Response('ok', { headers: corsHeaders })
      }

      await supabaseClient
        .from('telegram_link_codes')
        .update({
          used_at: new Date().toISOString(),
          telegram_user_id: telegramUser.id,
          telegram_username: telegramUser.username ?? null,
        })
        .eq('id', linkCode.id)

      await sendTelegramMessage(
        telegramToken,
        chatId,
        `✅ Conta vinculada! Olá, ${profile?.username || 'consciencialista'}.
Agora você pode registrar EVs com /ev 0-4.`
      )
      return new Response('ok', { headers: corsHeaders })
    }

    if (lowerText.startsWith('/ev')) {
      const match = text.match(/^\/ev\s+([0-4])(\s+[\s\S]+)?$/i)
      if (!match) {
        await sendTelegramMessage(telegramToken, chatId, 'Use: /ev 0-4 [nota opcional]. Ex: /ev 3 Prática rápida.')
        return new Response('ok', { headers: corsHeaders })
      }

      const score = Number(match[1])
      const notes = match[2]?.trim()

      const link = await getTelegramLink(supabaseClient, telegramUser.id)
      if (!link?.user_id) {
        await sendTelegramMessage(telegramToken, chatId, '⚠️ Telegram não vinculado. Use /link CODIGO antes.')
        return new Response('ok', { headers: corsHeaders })
      }

      const { error: insertError } = await supabaseClient
        .from('evs')
        .insert({
          user_id: link.user_id,
          score,
          notes: notes ?? null,
        })

      if (insertError) {
        await sendTelegramMessage(telegramToken, chatId, '❌ Erro ao registrar EV. Tente novamente.')
        return new Response('ok', { headers: corsHeaders })
      }

      await supabaseClient
        .from('telegram_links')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('telegram_user_id', telegramUser.id)

      await sendTelegramMessage(telegramToken, chatId, `✅ EV registrado com nota ${score}/4.${notes ? `
📝 ${notes}` : ''}`)
      return new Response('ok', { headers: corsHeaders })
    }

    if (lowerText.startsWith('/me')) {
      const link = await getTelegramLink(supabaseClient, telegramUser.id)
      if (!link?.user_id) {
        await sendTelegramMessage(telegramToken, chatId, '⚠️ Telegram não vinculado. Use /link CODIGO antes.')
        return new Response('ok', { headers: corsHeaders })
      }

      const { data: evs, count } = await supabaseClient
        .from('evs')
        .select('score, created_at', { count: 'exact' })
        .eq('user_id', link.user_id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!evs || evs.length === 0) {
        await sendTelegramMessage(telegramToken, chatId, 'Você ainda não registrou EVs. Use /ev 0-4 para começar!')
        return new Response('ok', { headers: corsHeaders })
      }

      const totalPoints = evs.reduce((sum, ev) => sum + ev.score, 0)
      const average = (totalPoints / evs.length).toFixed(1)
      const lastEv = evs[0]

      await sendTelegramMessage(
        telegramToken,
        chatId,
        `📊 Seu resumo:
Total de EVs: ${count ?? evs.length}
Média recente: ${average}
Último EV: ${new Date(lastEv.created_at).toLocaleString('pt-BR')} (nota ${lastEv.score}/4)`
      )
      return new Response('ok', { headers: corsHeaders })
    }

    if (lowerText.startsWith('/rank')) {
      const range = text.split(' ')[1]?.toLowerCase() ?? 'daily'
      const { label, startDate } = getRankingWindow(range)

      const { data: evs } = await supabaseClient
        .from('evs')
        .select('score, user_id, created_at')
        .gte('created_at', startDate.toISOString())

      if (!evs || evs.length === 0) {
        await sendTelegramMessage(telegramToken, chatId, `Sem dados de ranking para ${label}.`)
        return new Response('ok', { headers: corsHeaders })
      }

      const stats = evs.reduce((acc, ev) => {
        if (!acc[ev.user_id]) {
          acc[ev.user_id] = { total_points: 0, evs_count: 0 }
        }
        acc[ev.user_id].total_points += ev.score
        acc[ev.user_id].evs_count += 1
        return acc
      }, {} as Record<string, { total_points: number; evs_count: number }>)

      const topUsers = Object.entries(stats)
        .map(([userId, data]) => ({
          user_id: userId,
          total_points: data.total_points,
          evs_count: data.evs_count,
          average_score: data.total_points / data.evs_count,
        }))
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 5)

      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('user_id, username')
        .in('user_id', topUsers.map(user => user.user_id))

      const profileMap = new Map((profiles ?? []).map(profile => [profile.user_id, profile.username]))

      const rankingLines = topUsers.map((user, index) => {
        const name = profileMap.get(user.user_id) ?? `Jogador ${user.user_id.slice(0, 6)}`
        return `${index + 1}. ${name} — ${user.total_points} pts (${user.evs_count} EVs)`
      })

      await sendTelegramMessage(
        telegramToken,
        chatId,
        `🏆 Ranking ${label}:
${rankingLines.join('\n')}`
      )
      return new Response('ok', { headers: corsHeaders })
    }

    await sendTelegramMessage(telegramToken, chatId, 'Comando não reconhecido. Use /help para ver as opções.')
    return new Response('ok', { headers: corsHeaders })
  } catch (error) {
    console.error('Telegram bot error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  })
}

async function getTelegramLink(supabaseClient, telegramUserId: number) {
  const { data } = await supabaseClient
    .from('telegram_links')
    .select('user_id')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle()

  return data
}

function getRankingWindow(range: string) {
  const now = new Date()
  if (range === 'weekly') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    return { label: 'semanal', startDate: start }
  }
  if (range === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    return { label: 'mensal', startDate: start }
  }
  if (range === 'all') {
    return { label: 'todos os tempos', startDate: new Date(2000, 0, 1) }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  return { label: 'diário', startDate: start }
}
