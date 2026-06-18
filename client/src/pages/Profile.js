import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useEVTimer } from '../contexts/EVTimerContext';
import {
  Container, Title, Grid, Card, CardTitle,
  ProfileInfo, Avatar, UserInfo, Username, Email,
  AvatarSection, AvatarGrid, AvatarOption,
  StatsGrid, StatCard, StatValue, StatLabel,
  HistoryChart, ChartTitle, ChartBar, ChartLabel, ChartBarFill, ChartValue,
  LoadingText, ToggleContainer, ToggleLabel, ToggleSwitch, ToggleSlider,
  ToggleInput, ToggleStatus,
  ExportSection, ExportTitle, ExportButtons, ExportButton, ExportInfo,
  TelegramSection, TelegramText, TelegramCode, TelegramButtonRow, TelegramButton
} from './Profile.styles';

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Profile = () => {
  const { user, updateAvatar } = useAuth();
  const { themeName, toggleTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    total_evs: 0,
    average_score: 0,
    max_score: 0,
    min_score: 0,
    consecutive_days: 0,
    total_points: 0
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evInterval, setEvInterval] = useState(25);
  const { intervalMinutes, setIntervalMinutes, updateInterval, soundEnabled, updateSoundEnabled, tabBlinkEnabled, updateTabBlinkEnabled } = useEVTimer();
  const [soundEnabledLocal, setSoundEnabledLocal] = useState(true);
  const [tabBlinkEnabledLocal, setTabBlinkEnabledLocal] = useState(true);
  const [bluetoothEVEnabled, setBluetoothEVEnabled] = useState(false);
  const [evData, setEvData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [telegramLink, setTelegramLink] = useState(null);
  const [telegramCode, setTelegramCode] = useState('');
  const [telegramCodeExpiresAt, setTelegramCodeExpiresAt] = useState('');
  const [telegramLoading, setTelegramLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadHistory();
      loadTelegramStatus();
      loadTelegramCode();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.ev_interval_minutes) {
      setEvInterval(profile.ev_interval_minutes);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.sound_enabled !== undefined) {
      setSoundEnabledLocal(profile.sound_enabled);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.tab_blink_enabled !== undefined) {
      setTabBlinkEnabledLocal(profile.tab_blink_enabled);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.bluetooth_ev_enabled !== undefined) {
      setBluetoothEVEnabled(profile.bluetooth_ev_enabled);
    }
  }, [profile]);

  useEffect(() => {
    const loadEVData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('evs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Erro ao carregar dados EV:', error);
            return;
          }

          setEvData(data || []);
        } catch (err) {
          console.error('Erro inesperado ao carregar dados EV:', err);
        }
      }
    };

    loadEVData();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { count: totalEVsCount, error: countError } = await supabase
        .from('evs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      let allEVs = [];
      const pageSize = 1000;
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: evsPage, error: pageError } = await supabase
          .from('evs')
          .select('score, created_at')
          .eq('user_id', user.id)
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);

        if (pageError) throw pageError;

        if (evsPage && evsPage.length > 0) {
          allEVs = allEVs.concat(evsPage);
          from += pageSize;
          hasMore = evsPage.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      if (allEVs && allEVs.length > 0) {
        const scores = allEVs.map(ev => ev.score);
        const total_evs = totalEVsCount || allEVs.length;
        const total_points = scores.reduce((sum, score) => sum + score, 0);
        const average_score = (total_points / total_evs).toFixed(1);
        const max_score = Math.max(...scores);
        const min_score = Math.min(...scores);
        const consecutive_days = calculateConsecutiveDays(allEVs);

        setStats({
          total_evs,
          average_score,
          max_score,
          min_score,
          consecutive_days,
          total_points
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('evs')
        .select('score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      const groupedByDate = data?.reduce((acc, ev) => {
        const date = new Date(ev.created_at).toDateString();
        if (!acc[date]) {
          acc[date] = { count: 0, total_score: 0 };
        }
        acc[date].count += 1;
        acc[date].total_score += ev.score;
        return acc;
      }, {});

      const historyData = Object.entries(groupedByDate || {})
        .map(([date, data]) => ({
          date: new Date(date),
          count: data.count,
          average: (data.total_score / data.count).toFixed(1)
        }))
        .sort((a, b) => b.date - a.date)
        .slice(0, 7);

      setHistory(historyData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadTelegramStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_links')
        .select('telegram_username, telegram_user_id, linked_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar Telegram:', error);
        return;
      }

      setTelegramLink(data || null);
    } catch (error) {
      console.error('Erro ao carregar Telegram:', error);
    }
  };

  const loadTelegramCode = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('telegram_link_codes')
        .select('code, expires_at')
        .eq('user_id', user.id)
        .is('used_at', null)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar código Telegram:', error);
        return;
      }

      if (data && data.length > 0) {
        setTelegramCode(data[0].code);
        setTelegramCodeExpiresAt(data[0].expires_at);
      }
    } catch (error) {
      console.error('Erro ao carregar código Telegram:', error);
    }
  };

  const generateTelegramCode = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const values = new Uint32Array(8);
    window.crypto.getRandomValues(values);
    return Array.from(values)
      .map((value) => alphabet[value % alphabet.length])
      .join('');
  };

  const handleGenerateTelegramCode = async () => {
    setTelegramLoading(true);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    let code = '';

    try {
      let attempt = 0;
      let created = false;
      while (!created && attempt < 3) {
        attempt += 1;
        code = generateTelegramCode();
        const { error } = await supabase
          .from('telegram_link_codes')
          .insert({
            user_id: user.id,
            code,
            expires_at: expiresAt
          });

        if (!error) {
          created = true;
        } else if (error.code !== '23505') {
          throw error;
        }
      }

      if (!code) {
        throw new Error('Não foi possível gerar o código');
      }

      setTelegramCode(code);
      setTelegramCodeExpiresAt(expiresAt);
      toast.success('Código gerado! Use no Telegram.');
    } catch (error) {
      console.error('Erro ao gerar código Telegram:', error);
      toast.error('Erro ao gerar código Telegram');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleCopyTelegramCode = async () => {
    if (!telegramCode) return;
    try {
      await navigator.clipboard.writeText(telegramCode);
      toast.success('Código copiado!');
    } catch (error) {
      toast.error('Não foi possível copiar o código');
    }
  };

  const calculateConsecutiveDays = (evs) => {
    if (!evs || evs.length === 0) return 0;

    const dates = [...new Set(evs.map(ev => new Date(ev.created_at).toDateString()))].sort();
    let maxConsecutive = 0;
    let currentConsecutive = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentConsecutive++;
      } else {
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        currentConsecutive = 1;
      }
    }

    return Math.max(maxConsecutive, currentConsecutive);
  };

  const handleAvatarChange = async (avatarId) => {
    setLoading(true);
    try {
      const result = await updateAvatar(avatarId);
      if (result.success) {
        setProfile(prev => ({ ...prev, avatar_url: `avatar_${avatarId}.png` }));
      }
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
    }
    setLoading(false);
  };

  const handleEvIntervalChange = async (e) => {
    const value = Math.max(1, Math.min(120, Number(e.target.value)));
    setEvInterval(value);
    updateInterval(value);
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ ev_interval_minutes: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    setLoading(false);
    if (!error) toast.success('Intervalo salvo!');
  };

  const handleSoundToggle = async () => {
    const newValue = !soundEnabledLocal;

    setSoundEnabledLocal(newValue);
    updateSoundEnabled(newValue);

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          sound_enabled: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();

      if (error) {
        setSoundEnabledLocal(!newValue);
        updateSoundEnabled(!newValue);

        if (error.code === '42703') {
          toast.error('❌ Campo sound_enabled não existe. Execute o script SQL primeiro!');
        } else {
          toast.error(`❌ Erro: ${error.message}`);
        }
      } else {
        toast.success(newValue ? '🔊 Som ativado!' : '🔇 Som desativado!');
      }
    } catch (err) {
      setSoundEnabledLocal(!newValue);
      updateSoundEnabled(!newValue);
      toast.error('❌ Erro inesperado!');
    } finally {
      setLoading(false);
    }
  };

  const handleTabBlinkToggle = async () => {
    const newValue = !tabBlinkEnabledLocal;

    setTabBlinkEnabledLocal(newValue);
    updateTabBlinkEnabled(newValue);

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          tab_blink_enabled: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();

      if (error) {
        setTabBlinkEnabledLocal(!newValue);
        updateTabBlinkEnabled(!newValue);

        if (error.code === '42703') {
          toast.error('❌ Campo tab_blink_enabled não existe. Execute o script SQL primeiro!');
        } else {
          toast.error(`❌ Erro: ${error.message}`);
        }
      } else {
        toast.success(newValue ? '🔴 Piscar aba ativado!' : '⚪ Piscar aba desativado!');
      }
    } catch (err) {
      setTabBlinkEnabledLocal(!newValue);
      updateTabBlinkEnabled(!newValue);
      toast.error('❌ Erro inesperado!');
    } finally {
      setLoading(false);
    }
  };

  const handleBluetoothEVToggle = async () => {
    const newValue = !bluetoothEVEnabled;

    setBluetoothEVEnabled(newValue);

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          bluetooth_ev_enabled: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();

      if (error) {
        setBluetoothEVEnabled(!newValue);

        if (error.code === '42703') {
          toast.error('❌ Campo bluetooth_ev_enabled não existe. Execute o script SQL primeiro!');
        } else {
          toast.error(`❌ Erro: ${error.message}`);
        }
      } else {
        toast.success(newValue ? '🎮 Botão Bluetooth ativado!' : '⏸️ Botão Bluetooth desativado!');
      }
    } catch (err) {
      setBluetoothEVEnabled(!newValue);
      toast.error('❌ Erro inesperado!');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameEdit = () => {
    setEditingUsername(true);
    setNewUsername(profile?.username || '');
  };

  const handleUsernameSave = async () => {
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      toast.error('O apelido deve ter pelo menos 3 caracteres');
      return;
    }

    if (newUsername.trim() === profile?.username) {
      setEditingUsername(false);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: newUsername.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Este apelido já está em uso');
        } else {
          toast.error('Erro ao atualizar apelido: ' + error.message);
        }
        return;
      }

      setProfile(prev => ({ ...prev, username: newUsername.trim() }));
      setEditingUsername(false);
      toast.success('Apelido atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar apelido:', err);
      toast.error('Erro inesperado ao atualizar apelido');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameCancel = () => {
    setEditingUsername(false);
    setNewUsername('');
  };

  const getMaxValue = () => {
    if (history.length === 0) return 1;
    return Math.max(...history.map(h => h.count));
  };

  const getCurrentAvatarId = () => {
    if (!profile?.avatar_url) return 1;
    const match = profile.avatar_url.match(/avatar_(\d+)\.png/);
    return match ? parseInt(match[1]) : 1;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIntensityText = (score) => {
    const intensities = ['Nenhuma', 'Baixa', 'Média', 'Alta', 'Máxima'];
    return intensities[score] || 'N/A';
  };

  const exportToCSV = async () => {
    if (evData.length === 0) {
      toast.error('Nenhum EV registrado para exportar');
      return;
    }

    setExportLoading(true);
    try {
      const headers = ['Data/Hora', 'Intensidade', 'Pontuação', 'Comentários'];
      const csvRows = [headers.join(',')];

      evData.forEach(ev => {
        const row = [
          `"${formatDate(ev.created_at)}"`,
          `"${getIntensityText(ev.score)}"`,
          ev.score,
          `"${(ev.notes || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const filename = `EV_${profile?.username || 'user'}_${new Date().toISOString().split('T')[0]}.csv`;

      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

      toast.success('📊 CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      toast.error('Erro ao gerar CSV');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToTXT = async () => {
    if (evData.length === 0) {
      toast.error('Nenhum EV registrado para exportar');
      return;
    }

    setExportLoading(true);
    try {
      let content = 'RELATÓRIO DE ESTADOS VIBRACIONAIS\n';
      content += '=====================================\n\n';
      content += `Usuário: ${profile?.username || user.email}\n`;
      content += `Período: ${formatDate(evData[evData.length - 1]?.created_at)} a ${formatDate(evData[0]?.created_at)}\n`;
      content += `Total de EVs: ${evData.length}\n\n`;

      const avgScore = (evData.reduce((sum, ev) => sum + ev.score, 0) / evData.length).toFixed(2);
      const maxScore = Math.max(...evData.map(ev => ev.score));
      const minScore = Math.min(...evData.map(ev => ev.score));

      content += 'ESTATÍSTICAS:\n';
      content += `Média: ${avgScore}\n`;
      content += `Máxima: ${maxScore}\n`;
      content += `Mínima: ${minScore}\n\n`;

      content += 'REGISTROS:\n';
      content += '==========\n\n';

      evData.forEach((ev, index) => {
        content += `${index + 1}. ${formatDate(ev.created_at)}\n`;
        content += `   Intensidade: ${getIntensityText(ev.score)} (${ev.score}/4)\n`;
        if (ev.notes) {
          content += `   Comentário: ${ev.notes}\n`;
        }
        content += '\n';
      });

      const filename = `EV_${profile?.username || 'user'}_${new Date().toISOString().split('T')[0]}.txt`;
      downloadFile(content, filename, 'text/plain;charset=utf-8;');

      toast.success('📄 Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setExportLoading(false);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <Container>
        <LoadingText>CARREGANDO PERFIL...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Configurações</Title>

      <Grid>
        <Card>
          <CardTitle>Informações</CardTitle>

          <ProfileInfo>
            <Avatar>
              {avatars[getCurrentAvatarId() - 1] || '👤'}
            </Avatar>
            <UserInfo>
              {editingUsername ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    style={{
                      fontFamily: 'Press Start 2P, monospace',
                      fontSize: '14px',
                      padding: '8px',
                      border: '2px solid #4a6a8a',
                      borderRadius: '4px',
                      background: '#1a1a1a',
                      color: '#ffffff',
                      width: '200px'
                    }}
                    maxLength={20}
                    placeholder="Novo apelido"
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleUsernameSave}
                      disabled={loading}
                      style={{
                        fontFamily: 'Press Start 2P, monospace',
                        fontSize: '10px',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        background: '#4a8a4a',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleUsernameCancel}
                      disabled={loading}
                      style={{
                        fontFamily: 'Press Start 2P, monospace',
                        fontSize: '10px',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        background: '#8a4a4a',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Username>{profile?.username || user.email}</Username>
                  <button
                    onClick={handleUsernameEdit}
                    disabled={loading}
                    style={{
                      fontFamily: 'Press Start 2P, monospace',
                      fontSize: '8px',
                      padding: '4px 8px',
                      border: '1px solid #4a6a8a',
                      borderRadius: '4px',
                      background: 'transparent',
                      color: '#4a6a8a',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    ✏️ Editar
                  </button>
                </div>
              )}
              <Email>{user.email}</Email>
            </UserInfo>
          </ProfileInfo>

          <AvatarSection>
            <CardTitle style={{ fontSize: '12px', marginBottom: '10px' }}>
              Escolher Avatar
            </CardTitle>
            <AvatarGrid>
              {avatars.map((avatar, index) => (
                <AvatarOption
                  key={index}
                  selected={getCurrentAvatarId() === index + 1}
                  onClick={() => handleAvatarChange(index + 1)}
                  disabled={loading}
                >
                  {avatar}
                </AvatarOption>
              ))}
            </AvatarGrid>
          </AvatarSection>
        </Card>


        <Card>
          <CardTitle>Ajustes</CardTitle>
          <div style={{ marginBottom: 16 }}>
            <strong>Tema:</strong> {themeName === 'dark' ? 'Escuro' : 'Claro'}
            <button
              style={{
                marginLeft: 16,
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: themeName === 'dark' ? '#4a6a8a' : '#d1d1d1',
                color: themeName === 'dark' ? '#fff' : '#222',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={toggleTheme}
            >
              Alternar Tema
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Intervalo entre EVs:</strong>
            <input
              type="number"
              min={1}
              max={120}
              value={evInterval}
              onChange={handleEvIntervalChange}
              style={{
                marginLeft: 16,
                width: 60,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #4a4a4a',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: 12,
                background: 'transparent',
                color: themeName === 'dark' ? '#fff' : '#222',
              }}
              disabled={loading}
            />
            <span style={{ marginLeft: 8, fontSize: 12 }}>min</span>
          </div>
          <ToggleContainer>
            <ToggleLabel>Notificações Sonoras:</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={soundEnabledLocal}
                onChange={handleSoundToggle}
                disabled={loading}
              />
              <ToggleSlider checked={soundEnabledLocal} />
            </ToggleSwitch>
            <ToggleStatus enabled={soundEnabledLocal}>
              {soundEnabledLocal ? 'LIGADO' : 'DESLIGADO'}
            </ToggleStatus>
          </ToggleContainer>
          <ToggleContainer>
            <ToggleLabel>Piscar Aba do Navegador:</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={tabBlinkEnabledLocal}
                onChange={handleTabBlinkToggle}
                disabled={loading}
              />
              <ToggleSlider checked={tabBlinkEnabledLocal} />
            </ToggleSwitch>
            <ToggleStatus enabled={tabBlinkEnabledLocal}>
              {tabBlinkEnabledLocal ? 'LIGADO' : 'DESLIGADO'}
            </ToggleStatus>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>Registro EV via Botão Bluetooth:</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={bluetoothEVEnabled}
                onChange={handleBluetoothEVToggle}
                disabled={loading}
              />
              <ToggleSlider checked={bluetoothEVEnabled} />
            </ToggleSwitch>
            <ToggleStatus enabled={bluetoothEVEnabled}>
              {bluetoothEVEnabled ? 'LIGADO' : 'DESLIGADO'}
            </ToggleStatus>
          </ToggleContainer>

        </Card>
      </Grid>

      <Card>
        <CardTitle>Integração Telegram</CardTitle>
        <TelegramSection>
          <TelegramText>
            Conecte sua conta para registrar EVs e consultar rankings direto no Telegram.
          </TelegramText>
          <TelegramText>
            Status:{' '}
            {telegramLink?.telegram_username
              ? `Conectado como @${telegramLink.telegram_username}`
              : telegramLink?.telegram_user_id
                ? 'Conectado (usuário sem @)'
                : 'Não conectado'}
          </TelegramText>

          {telegramCode ? (
            <>
              <TelegramCode>{telegramCode}</TelegramCode>
              <TelegramText>
                Expira em {new Date(telegramCodeExpiresAt).toLocaleString('pt-BR')}. Use o comando
                /link {telegramCode} no bot.
              </TelegramText>
            </>
          ) : (
            <TelegramText>
              Gere um código para vincular sua conta. Depois, no Telegram, envie /link CODIGO.
            </TelegramText>
          )}

          <TelegramButtonRow>
            <TelegramButton onClick={handleGenerateTelegramCode} disabled={telegramLoading}>
              {telegramLoading ? 'Gerando...' : 'Gerar código'}
            </TelegramButton>
            <TelegramButton onClick={handleCopyTelegramCode} disabled={!telegramCode}>
              Copiar código
            </TelegramButton>
          </TelegramButtonRow>
        </TelegramSection>
      </Card>
    </Container>
  );
};

export default Profile;
