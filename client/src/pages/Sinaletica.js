import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';

// ─── Styled Components ───────────────────────────────────────────────

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 10px;
  text-transform: uppercase;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #888;
  font-size: 12px;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const Section = styled.div`
  background: rgba(42, 74, 106, 0.15);
  border: 1px solid #2a4a6a;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #7abaff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const VeiculoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const VeiculoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #3a3a5a;
  border-radius: 10px;
  padding: 16px;
  border-left: 3px solid ${props => props.$color || '#4a6a8a'};
`;

const VeiculoLabel = styled.label`
  font-weight: bold;
  font-size: 13px;
  color: ${props => props.$color || '#ccc'};
  display: block;
  margin-bottom: 8px;
`;

const VeiculoInput = styled.textarea`
  width: 100%;
  min-height: 70px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a5a;
  border-radius: 6px;
  color: #e0e0e0;
  padding: 10px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4a6a8a;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: #555;
  }
`;

const IntensityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const IntensityLabel = styled.span`
  font-size: 10px;
  color: #666;
  white-space: nowrap;
`;

const IntensityDots = styled.div`
  display: flex;
  gap: 4px;
`;

const Dot = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${props => props.$active ? props.$filledColor : '#3a3a5a'};
  background: ${props => props.$active ? props.$filledColor : 'transparent'};
  cursor: pointer;
  font-size: 0;
  transition: all 0.15s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${props => props.$filledColor || '#4a6a8a'};
    background: ${props => props.$active ? props.$filledColor : 'rgba(255,255,255,0.05)'};
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const Row = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 13px;
  color: #aaa;
  display: block;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a5a;
  border-radius: 6px;
  color: #e0e0e0;
  padding: 10px;
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4a6a8a;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a5a;
  border-radius: 6px;
  color: #e0e0e0;
  padding: 10px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4a6a8a;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  padding: 12px 32px;
  border-radius: 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  @media (max-width: 480px) {
    padding: 14px 24px;
    font-size: 10px;
    flex: 1;
    min-width: 120px;
  }
`;

const SaveBtn = styled(Btn)`
  background: linear-gradient(135deg, #2a5a3a 0%, #3a7a4a 100%);
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(58, 122, 74, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearBtn = styled(Btn)`
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  border: 1px solid #3a3a5a;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// ─── Export ───────────────────────────────────────────────────────────

const ExportSection = styled.div`
  margin: 25px 0;
  padding: 18px;
  background: rgba(74, 106, 138, 0.08);
  border: 1px solid #3a4a6a;
  border-radius: 8px;
`;

const ExportTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  color: #7abaff;
  margin-bottom: 14px;
  text-transform: uppercase;
  text-align: center;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ExportBtn = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid ${({ $variant }) =>
    $variant === 'csv' ? '#28a745' : '#ffc107'};
  background: ${({ $variant }) =>
    $variant === 'csv' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)'};
  color: ${({ $variant }) =>
    $variant === 'csv' ? '#28a745' : '#ffc107'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    background: ${({ $variant }) =>
      $variant === 'csv' ? '#28a745' : '#ffc107'};
    color: #1a1a1a;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    flex: 1;
    min-width: 130px;
    justify-content: center;
  }
`;

const ExportInfo = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #5a5a7a;
  text-align: center;
  margin-top: 12px;
  line-height: 1.5;
`;

// ─── Timeline ─────────────────────────────────────────────────────────

const TimelineTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #7abaff;
  margin: 30px 0 20px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const SinalCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #2a3a5a;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;

  &:hover {
    border-color: #3a5a7a;
  }
`;

const SinalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const SinalDate = styled.span`
  font-size: 12px;
  color: #7abaff;
  font-weight: bold;
`;

const SinalActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button`
  background: none;
  border: 1px solid #3a3a5a;
  color: #666;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    border-color: #555;
    color: #aaa;
  }
`;

const VeiculoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
`;

const VeiculoIcon = styled.span`
  font-size: 16px;
  min-width: 24px;
  text-align: center;
`;

const VeiculoContent = styled.div`
  flex: 1;
`;

const VeiculoName = styled.span`
  font-size: 11px;
  font-weight: bold;
  color: ${props => props.$color || '#aaa'};
  margin-right: 8px;
`;

const IntensityBar = styled.span`
  letter-spacing: 1px;
  font-size: 12px;
`;

const VeiculoText = styled.p`
  font-size: 12px;
  color: #ccc;
  margin: 4px 0 0;
  line-height: 1.5;
`;

const ContextText = styled.p`
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  font-style: italic;
`;

const NotesText = styled.p`
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #555;
  font-size: 13px;
  line-height: 1.8;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid ${props => props.$active ? '#4a6a8a' : '#2a3a5a'};
  background: ${props => props.$active ? 'rgba(74, 106, 138, 0.2)' : 'transparent'};
  color: ${props => props.$active ? '#7abaff' : '#666'};
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    border-color: #4a6a8a;
    color: #7abaff;
  }
`;

// ─── Config dos veículos ──────────────────────────────────────────────

const VEICULOS = [
  { key: 'soma', label: 'Soma', icon: '🫀', color: '#e06c75' },
  { key: 'energossoma', label: 'Energossoma', icon: '⚡', color: '#e5c07b' },
  { key: 'psicossoma', label: 'Psicossoma', icon: '🧠', color: '#61afef' },
  { key: 'mentalssoma', label: 'Mentalssoma', icon: '🌟', color: '#c678dd' },
];

function formatDateBR(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTimeBR(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function intensityDots(value, color) {
  return '●'.repeat(value) + '○'.repeat(5 - value);
}

// ─── Component ────────────────────────────────────────────────────────

const Sinaletica = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [sinais, setSinais] = useState([]);
  const [filter, setFilter] = useState('all'); // all | 7d | 30d | 90d
  const [editId, setEditId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    contexto: '',
    notas: '',
    soma_detalhes: '',
    soma_intensidade: 0,
    energossoma_detalhes: '',
    energossoma_intensidade: 0,
    psicossoma_detalhes: '',
    psicossoma_intensidade: 0,
    mentalssoma_detalhes: '',
    mentalssoma_intensidade: 0,
  });

  useEffect(() => {
    if (user) loadSinais();
  }, [user, filter]);

  // ─── Export helpers ──────────────────────────────────────────────────

  const formatDateBr = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob(['\ufeff' + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchAllSinais = async () => {
    const { data, error } = await supabase
      .from('sinais')
      .select('*')
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false });
    if (error) throw error;
    return data || [];
  };

  const exportSinaisCSV = async () => {
    setExportLoading(true);
    try {
      const all = await fetchAllSinais();
      if (all.length === 0) {
        toast.error('Nenhum registro sinalético para exportar');
        return;
      }
      const headers = [
        'Data/Hora', 'Soma', 'Soma_Int', 'Energossoma', 'Energossoma_Int',
        'Psicossoma', 'Psicossoma_Int', 'Mentalssoma', 'Mentalssoma_Int',
        'Contexto', 'Notas',
      ];
      const rows = [headers.join(',')];
      all.forEach(s => {
        rows.push([
          `"${formatDateBr(s.registered_at)}"`,
          `"${(s.soma_detalhes || '').replace(/"/g, '""')}"`,
          s.soma_intensidade || 0,
          `"${(s.energossoma_detalhes || '').replace(/"/g, '""')}"`,
          s.energossoma_intensidade || 0,
          `"${(s.psicossoma_detalhes || '').replace(/"/g, '""')}"`,
          s.psicossoma_intensidade || 0,
          `"${(s.mentalssoma_detalhes || '').replace(/"/g, '""')}"`,
          s.mentalssoma_intensidade || 0,
          `"${(s.contexto || '').replace(/"/g, '""')}"`,
          `"${(s.notas || '').replace(/"/g, '""')}"`,
        ].join(','));
      });
      const filename = `Sinaletica_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(rows.join('\n'), filename, 'text/csv;charset=utf-8;');
      toast.success('📊 CSV exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
      toast.error('Erro ao exportar CSV');
    } finally {
      setExportLoading(false);
    }
  };

  const exportSinaisTXT = async () => {
    setExportLoading(true);
    try {
      const all = await fetchAllSinais();
      if (all.length === 0) {
        toast.error('Nenhum registro sinalético para exportar');
        return;
      }
      let txt = 'AGENDA SINALÉTICOLÓGICA — RELATÓRIO\n';
      txt += '=====================================\n\n';
      txt += `Total de registros: ${all.length}\n`;
      txt += `Exportado em: ${formatDateBr(new Date().toISOString())}\n\n`;

      all.forEach((s, i) => {
        txt += `--- Registro #${i + 1} ---\n`;
        txt += `Data/Hora: ${formatDateBr(s.registered_at)}\n`;
        if (s.contexto) txt += `Contexto: ${s.contexto}\n`;
        if (s.soma_detalhes) txt += `Soma: ${s.soma_detalhes} (intensidade: ${s.soma_intensidade || 0}/5)\n`;
        if (s.energossoma_detalhes) txt += `Energossoma: ${s.energossoma_detalhes} (intensidade: ${s.energossoma_intensidade || 0}/5)\n`;
        if (s.psicossoma_detalhes) txt += `Psicossoma: ${s.psicossoma_detalhes} (intensidade: ${s.psicossoma_intensidade || 0}/5)\n`;
        if (s.mentalssoma_detalhes) txt += `Mentalssoma: ${s.mentalssoma_detalhes} (intensidade: ${s.mentalssoma_intensidade || 0}/5)\n`;
        if (s.notas) txt += `Notas: ${s.notas}\n`;
        txt += '\n';
      });

      const filename = `Sinaletica_${new Date().toISOString().split('T')[0]}.txt`;
      downloadFile(txt, filename, 'text/plain;charset=utf-8;');
      toast.success('📄 TXT exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar TXT:', err);
      toast.error('Erro ao exportar TXT');
    } finally {
      setExportLoading(false);
    }
  };

  const loadSinais = async () => {
    try {
      let query = supabase
        .from('sinais')
        .select('*')
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });

      // Filtro por período (datas em UTC, mas referência Brasil)
      if (filter !== 'all') {
        const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        query = query.gte('registered_at', cutoff.toISOString());
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setSinais(data || []);
    } catch (err) {
      console.error('Erro ao carregar sinais:', err);
      toast.error('Erro ao carregar registros');
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleIntensity = (veiculo, value) => {
    setForm(prev => ({ ...prev, [`${veiculo}_intensidade`]: value }));
  };

  const clearForm = () => {
    setForm({
      contexto: '',
      notas: '',
      soma_detalhes: '',
      soma_intensidade: 0,
      energossoma_detalhes: '',
      energossoma_intensidade: 0,
      psicossoma_detalhes: '',
      psicossoma_intensidade: 0,
      mentalssoma_detalhes: '',
      mentalssoma_intensidade: 0,
    });
    setEditId(null);
  };

  const handleSubmit = async () => {
    // Validação: pelo menos um campo preenchido
    const hasContent = 
      form.contexto ||
      form.notas ||
      form.soma_detalhes || form.soma_intensidade > 0 ||
      form.energossoma_detalhes || form.energossoma_intensidade > 0 ||
      form.psicossoma_detalhes || form.psicossoma_intensidade > 0 ||
      form.mentalssoma_detalhes || form.mentalssoma_intensidade > 0;

    if (!hasContent) {
      toast.error('Preencha pelo menos um campo');
      return;
    }

    setLoading(true);
    try {
      // registered_at no horário de Brasil (UTC-3)
      const now = new Date();
      const brasiliaOffset = -3 * 60;
      const localTime = new Date(now.getTime() + (now.getTimezoneOffset() + brasiliaOffset) * 60000);

      const payload = {
        user_id: user.id,
        ...form,
        registered_at: localTime.toISOString(),
      };

      if (editId) {
        const { error } = await supabase
          .from('sinais')
          .update(form)
          .eq('id', editId)
          .eq('user_id', user.id);
        if (error) throw error;
        toast.success('Registro atualizado!');
      } else {
        const { error } = await supabase
          .from('sinais')
          .insert(payload);
        if (error) throw error;
        toast.success('Registro salvo!');
      }

      clearForm();
      loadSinais();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar registro');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este registro?')) return;
    try {
      const { error } = await supabase
        .from('sinais')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Registro excluído');
      loadSinais();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const handleEdit = (sinal) => {
    setForm({
      contexto: sinal.contexto || '',
      notas: sinal.notas || '',
      soma_detalhes: sinal.soma_detalhes || '',
      soma_intensidade: sinal.soma_intensidade || 0,
      energossoma_detalhes: sinal.energossoma_detalhes || '',
      energossoma_intensidade: sinal.energossoma_intensidade || 0,
      psicossoma_detalhes: sinal.psicossoma_detalhes || '',
      psicossoma_intensidade: sinal.psicossoma_intensidade || 0,
      mentalssoma_detalhes: sinal.mentalssoma_detalhes || '',
      mentalssoma_intensidade: sinal.mentalssoma_intensidade || 0,
    });
    setEditId(sinal.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderVeiculoForm = ({ key, label, icon, color }) => (
    <VeiculoCard key={key} $color={color}>
      <VeiculoLabel $color={color}>{icon} {label}</VeiculoLabel>
      <VeiculoInput
        placeholder={`${label} — detalhes, sensações, percepções...`}
        value={form[`${key}_detalhes`]}
        onChange={(e) => handleChange(`${key}_detalhes`, e.target.value)}
      />
      <IntensityRow>
        <IntensityLabel>Intensidade:</IntensityLabel>
        <IntensityDots>
          {[1, 2, 3, 4, 5].map(v => (
            <Dot
              key={v}
              type="button"
              $active={form[`${key}_intensidade`] >= v}
              $filledColor={color}
              onClick={() => handleIntensity(key, form[`${key}_intensidade`] === v ? 0 : v)}
              aria-label={`Intensidade ${v}`}
            >
              {v}
            </Dot>
          ))}
        </IntensityDots>
      </IntensityRow>
    </VeiculoCard>
  );

  const renderSinalCard = (sinal) => (
    <SinalCard key={sinal.id}>
      <SinalHeader>
        <SinalDate>📅 {formatDateTimeBR(sinal.registered_at)}</SinalDate>
        <SinalActions>
          <ActionBtn onClick={() => handleEdit(sinal)}>✏️ Editar</ActionBtn>
          <ActionBtn onClick={() => handleDelete(sinal.id)}>🗑️</ActionBtn>
        </SinalActions>
      </SinalHeader>

      {VEICULOS.map(({ key, label, icon, color }) => {
        const detalhes = sinal[`${key}_detalhes`];
        const intensidade = sinal[`${key}_intensidade`];
        if (!detalhes && !intensidade) return null;
        return (
          <VeiculoRow key={key}>
            <VeiculoIcon>{icon}</VeiculoIcon>
            <VeiculoContent>
              <VeiculoName $color={color}>{label}</VeiculoName>
              {intensidade > 0 && (
                <IntensityBar style={{ color }}>
                  {intensityDots(intensidade, color)}
                </IntensityBar>
              )}
              {detalhes && <VeiculoText>{detalhes}</VeiculoText>}
            </VeiculoContent>
          </VeiculoRow>
        );
      })}

      {sinal.contexto && (
        <ContextText>📍 Contexto: {sinal.contexto}</ContextText>
      )}
      {sinal.notas && (
        <NotesText>📝 {sinal.notas}</NotesText>
      )}
    </SinalCard>
  );

  return (
    <Container>
      <Title>🌀 Agenda Sinalética</Title>
      <Subtitle>
        Registro diário de sinais energéticos e parapsíquicos pessoais.<br />
        Instrumento de autopesquisa para mapeamento da sinalética.
      </Subtitle>

      {/* ── Formulário ── */}
      <Section>
        <SectionTitle>{editId ? '✏️ Editar Registro' : '➕ Novo Registro'}</SectionTitle>

        <VeiculoGrid>
          {VEICULOS.map(renderVeiculoForm)}
        </VeiculoGrid>

        <Row>
          <Label>📍 Contexto / Gatilho</Label>
          <Input
            type="text"
            placeholder="Onde estava? O que estava fazendo? Situação desencadeadora..."
            value={form.contexto}
            onChange={(e) => handleChange('contexto', e.target.value)}
          />
        </Row>

        <Row>
          <Label>📝 Notas livres</Label>
          <TextArea
            placeholder="Observações gerais, reflexões, sincronicidades..."
            value={form.notas}
            onChange={(e) => handleChange('notas', e.target.value)}
          />
        </Row>

        <ButtonRow>
          <SaveBtn onClick={handleSubmit} disabled={loading}>
            {loading ? 'SALVANDO...' : editId ? 'ATUALIZAR' : 'SALVAR'}
          </SaveBtn>
          {(editId || Object.values(form).some(Boolean)) && (
            <ClearBtn onClick={clearForm}>
              {editId ? 'CANCELAR' : 'LIMPAR'}
            </ClearBtn>
          )}
        </ButtonRow>
      </Section>

      {/* ── Export ── */}
      <ExportSection>
        <ExportTitle>📤 Exportar Sinalética</ExportTitle>
        <ExportButtons>
          <ExportBtn onClick={exportSinaisCSV} disabled={exportLoading} $variant="csv">
            📊 CSV
          </ExportBtn>
          <ExportBtn onClick={exportSinaisTXT} disabled={exportLoading} $variant="txt">
            📄 TXT
          </ExportBtn>
        </ExportButtons>
        <ExportInfo>
          Exporta todos os registros sinaléticos. CSV para planilhas, TXT para leitura.
        </ExportInfo>
      </ExportSection>

      {/* ── Timeline ── */}
      <TimelineTitle>📜 Histórico</TimelineTitle>

      <FilterRow>
        {[
          { key: 'all', label: 'Todos' },
          { key: '7d', label: '7 dias' },
          { key: '30d', label: '30 dias' },
          { key: '90d', label: '90 dias' },
        ].map(f => (
          <FilterBtn
            key={f.key}
            $active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </FilterBtn>
        ))}
      </FilterRow>

      {sinais.length === 0 ? (
        <EmptyState>
          🔍 Nenhum registro sinalético encontrado.<br />
          Comece registrando suas percepções acima.
        </EmptyState>
      ) : (
        sinais.map(renderSinalCard)
      )}
    </Container>
  );
};

export default Sinaletica;
