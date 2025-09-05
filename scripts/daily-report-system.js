// Sistema de Relatório Diário Automático - EVSADAY
// Este script roda diariamente para enviar relatórios personalizados

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Gera relatório diário para um usuário específico
 */
const generateDailyReport = async (userId, userEmail, username, yesterdayDate) => {
  try {
    // Buscar EVs do dia anterior
    const startOfDay = new Date(yesterdayDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(yesterdayDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: dailyEVs, error } = await supabase
      .from('evs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!dailyEVs || dailyEVs.length === 0) {
      console.log(`Usuário ${username} não registrou EVs em ${yesterdayDate.toLocaleDateString('pt-BR')}`);
      return null;
    }

    // Calcular estatísticas
    const totalEVs = dailyEVs.length;
    const totalPoints = dailyEVs.reduce((sum, ev) => sum + ev.score, 0);
    const averageScore = (totalPoints / totalEVs).toFixed(1);
    const maxScore = Math.max(...dailyEVs.map(ev => ev.score));
    const minScore = Math.min(...dailyEVs.map(ev => ev.score));
    
    // Distribuição de pontuações
    const scoreDistribution = {
      0: dailyEVs.filter(ev => ev.score === 0).length,
      1: dailyEVs.filter(ev => ev.score === 1).length,
      2: dailyEVs.filter(ev => ev.score === 2).length,
      3: dailyEVs.filter(ev => ev.score === 3).length,
      4: dailyEVs.filter(ev => ev.score === 4).length
    };

    // Badges conquistados no dia
    const { data: newBadges } = await supabase
      .from('user_badges')
      .select('badges!inner(*)')
      .eq('user_id', userId)
      .gte('awarded_at', startOfDay.toISOString())
      .lte('awarded_at', endOfDay.toISOString());

    // Gerar HTML do relatório
    const reportHTML = generateReportHTML({
      username,
      date: yesterdayDate,
      totalEVs,
      totalPoints,
      averageScore,
      maxScore,
      minScore,
      scoreDistribution,
      dailyEVs,
      newBadges: newBadges || []
    });

    return {
      to: userEmail,
      subject: `📊 Relatório Diário EVSADAY - ${yesterdayDate.toLocaleDateString('pt-BR')}`,
      html: reportHTML
    };

  } catch (error) {
    console.error(`Erro ao gerar relatório para ${username}:`, error);
    return null;
  }
};

/**
 * Gera HTML do relatório
 */
const generateReportHTML = (data) => {
  const {
    username,
    date,
    totalEVs,
    totalPoints,
    averageScore,
    maxScore,
    minScore,
    scoreDistribution,
    dailyEVs,
    newBadges
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório Diário EVSADAY</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #ffffff;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(26, 26, 26, 0.95);
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #4a8a4a;
          padding-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #4a8a4a;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #cccccc;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: rgba(74, 138, 74, 0.1);
          border: 1px solid #4a8a4a;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #4a8a4a;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 12px;
          color: #cccccc;
          text-transform: uppercase;
        }
        .score-distribution {
          background: rgba(74, 106, 138, 0.1);
          border: 1px solid #4a6a8a;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .distribution-title {
          font-size: 16px;
          font-weight: bold;
          color: #4a6a8a;
          margin-bottom: 15px;
          text-align: center;
        }
        .distribution-bars {
          display: flex;
          justify-content: space-between;
          align-items: end;
          height: 100px;
          gap: 10px;
        }
        .bar {
          flex: 1;
          background: #4a6a8a;
          border-radius: 4px 4px 0 0;
          position: relative;
          min-height: 20px;
        }
        .bar-label {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #cccccc;
        }
        .bar-value {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #4a6a8a;
          font-weight: bold;
        }
        .evs-list {
          background: rgba(138, 74, 74, 0.1);
          border: 1px solid #8a4a4a;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .evs-title {
          font-size: 16px;
          font-weight: bold;
          color: #8a4a4a;
          margin-bottom: 15px;
          text-align: center;
        }
        .ev-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid rgba(138, 74, 74, 0.3);
        }
        .ev-item:last-child {
          border-bottom: none;
        }
        .ev-score {
          font-weight: bold;
          color: #8a4a4a;
        }
        .ev-time {
          font-size: 12px;
          color: #cccccc;
        }
        .badges-section {
          background: rgba(138, 138, 74, 0.1);
          border: 1px solid #8a8a4a;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .badges-title {
          font-size: 16px;
          font-weight: bold;
          color: #8a8a4a;
          margin-bottom: 15px;
          text-align: center;
        }
        .badge-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(138, 138, 74, 0.2);
          border-radius: 6px;
          margin-bottom: 10px;
        }
        .badge-icon {
          font-size: 20px;
        }
        .badge-info {
          flex: 1;
        }
        .badge-name {
          font-weight: bold;
          color: #8a8a4a;
        }
        .badge-desc {
          font-size: 12px;
          color: #cccccc;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #4a4a4a;
          color: #6a6a6a;
          font-size: 12px;
        }
        .motivation {
          background: rgba(74, 138, 74, 0.1);
          border: 1px solid #4a8a4a;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .motivation-text {
          font-size: 16px;
          color: #4a8a4a;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">📊 Relatório Diário EVSADAY</div>
          <div class="subtitle">${date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totalEVs}</div>
            <div class="stat-label">EVs Registrados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totalPoints}</div>
            <div class="stat-label">Pontos Totais</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${averageScore}</div>
            <div class="stat-label">Média Diária</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${maxScore}</div>
            <div class="stat-label">Pontuação Máxima</div>
          </div>
        </div>

        <div class="score-distribution">
          <div class="distribution-title">📈 Distribuição de Pontuações</div>
          <div class="distribution-bars">
            ${[0, 1, 2, 3, 4].map(score => {
              const count = scoreDistribution[score];
              const maxCount = Math.max(...Object.values(scoreDistribution));
              const height = maxCount > 0 ? (count / maxCount) * 80 : 0;
              return `
                <div class="bar" style="height: ${height}px;">
                  <div class="bar-value">${count}</div>
                  <div class="bar-label">${score}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        ${dailyEVs.length > 0 ? `
          <div class="evs-list">
            <div class="evs-title">📝 EVs do Dia</div>
            ${dailyEVs.map(ev => `
              <div class="ev-item">
                <div class="ev-score">EV ${ev.score}</div>
                <div class="ev-time">${new Date(ev.created_at).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${newBadges.length > 0 ? `
          <div class="badges-section">
            <div class="badges-title">🏆 Badges Conquistados</div>
            ${newBadges.map(badge => `
              <div class="badge-item">
                <div class="badge-icon">${badge.badges.icon}</div>
                <div class="badge-info">
                  <div class="badge-name">${badge.badges.name}</div>
                  <div class="badge-desc">${badge.badges.description}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="motivation">
          <div class="motivation-text">
            ${getMotivationalMessage(totalEVs, averageScore, newBadges.length)}
          </div>
        </div>

        <div class="footer">
          <p>Este relatório foi gerado automaticamente pelo EVSADAY</p>
          <p>Continue sua jornada de autopesquisa! 🌱</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Gera mensagem motivacional baseada no desempenho
 */
const getMotivationalMessage = (totalEVs, averageScore, newBadges) => {
  if (totalEVs === 0) {
    return "Amanhã é um novo dia para começar sua jornada de autopesquisa! 🌅";
  }
  
  if (totalEVs >= 20) {
    return "Incrível! Você foi um verdadeiro mestre diário hoje! 🏆";
  }
  
  if (parseFloat(averageScore) >= 3) {
    return "Excelente qualidade nos seus EVs! Continue assim! ⭐";
  }
  
  if (newBadges > 0) {
    return "Parabéns pelas conquistas! Você está evoluindo! 🎉";
  }
  
  if (totalEVs >= 10) {
    return "Bom trabalho! Consistência é a chave do sucesso! 🔑";
  }
  
  return "Cada EV é um passo na sua evolução consciencial! 🌱";
};

/**
 * Função principal que processa todos os usuários
 */
const sendDailyReports = async () => {
  try {
    console.log('🚀 Iniciando envio de relatórios diários...');
    
    // Buscar todos os usuários ativos
    const { data: users, error } = await supabase
      .from('profiles')
      .select('user_id, username, email')
      .not('email', 'is', null);

    if (error) throw error;

    console.log(`📧 Enviando relatórios para ${users.length} usuários...`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Calcular data de ontem no fuso horário local do usuário
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const report = await generateDailyReport(
          user.user_id, 
          user.email, 
          user.username, 
          yesterday
        );

        if (report) {
          // Enviar email usando Supabase Edge Functions ou serviço externo
          await sendEmail(report);
          successCount++;
          console.log(`✅ Relatório enviado para ${user.username} (${user.email})`);
        }

        // Aguardar um pouco entre envios para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao enviar relatório para ${user.username}:`, error);
      }
    }

    console.log(`📊 Resumo: ${successCount} enviados, ${errorCount} erros`);

  } catch (error) {
    console.error('❌ Erro geral no envio de relatórios:', error);
  }
};

/**
 * Função para enviar email (implementar com seu serviço preferido)
 */
const sendEmail = async (emailData) => {
  // Implementar com Resend, SendGrid, ou outro serviço
  // Por enquanto, apenas simula o envio
  console.log(`📧 Simulando envio para: ${emailData.to}`);
  console.log(`📧 Assunto: ${emailData.subject}`);
  
  // Aqui você implementaria o envio real
  // Exemplo com Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'EVSADAY <noreply@evsaday.com>',
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html
  });
  */
};

// Executar se chamado diretamente
if (require.main === module) {
  sendDailyReports();
}

export { sendDailyReports, generateDailyReport }; 