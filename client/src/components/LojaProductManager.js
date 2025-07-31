import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: #2a2a2a;
  border: 2px solid #4a4a4a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Description = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const ProductCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid ${props => props.active ? '#4CAF50' : '#666'};
  border-radius: 8px;
  padding: 15px;
  position: relative;
`;

const ProductTitle = styled.h4`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
`;

const ProductMeta = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #6a6a6a;
  margin-bottom: 8px;
`;

const ProductDescription = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #cccccc;
  line-height: 1.4;
  margin-bottom: 10px;
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${props => props.active ? '#4CAF50' : '#FF9800'};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
`;

const Button = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px 12px;
  border: 2px solid #4a8a4a;
  background: ${props => props.loading ? '#2a4a2a' : '#4a8a4a'};
  color: #ffffff;
  border-radius: 4px;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-right: 8px;
  margin-bottom: 8px;

  &:hover:not(:disabled) {
    background: #6aaa6a;
    border-color: #6aaa6a;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const DangerButton = styled(Button)`
  border-color: #8a4a4a;
  background: ${props => props.loading ? '#4a2a2a' : '#8a4a4a'};

  &:hover:not(:disabled) {
    background: #aa6a6a;
    border-color: #aa6a6a;
  }
`;

const AddProductForm = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
`;

const FormTitle = styled.h4`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px;
  background: #1a1a1a;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: #4a8a4a;
  }
`;

const TextArea = styled.textarea`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px;
  background: #1a1a1a;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  border-radius: 4px;
  width: 100%;
  min-height: 60px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4a8a4a;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #4CAF50;
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #666;
  transition: 0.4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const LojaProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: '',
    date: '',
    time: '',
    link: '',
    active: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_system_setting', {
          p_key: 'loja_products'
        });

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.error('Erro ao carregar produtos');
        return;
      }

      const productsList = data ? JSON.parse(data) : [];
      setProducts(productsList);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (updatedProducts) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .rpc('set_system_setting', {
          p_key: 'loja_products',
          p_value: JSON.stringify(updatedProducts),
          p_description: 'Lista de produtos da loja'
        });

      if (error) {
        console.error('Erro ao salvar produtos:', error);
        toast.error('Erro ao salvar produtos');
        return false;
      }

      setProducts(updatedProducts);
      toast.success('Produtos salvos com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
      toast.error('Erro ao salvar produtos');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = async (productId) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, active: !product.active }
        : product
    );

    const success = await saveProducts(updatedProducts);
    if (success) {
      toast.success(`Produto ${updatedProducts.find(p => p.id === productId).active ? 'ativado' : 'desativado'}!`);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    const updatedProducts = products.filter(product => product.id !== productId);
    const success = await saveProducts(updatedProducts);
    if (success) {
      toast.success('Produto excluído com sucesso!');
    }
  };

  const addProduct = async () => {
    if (!newProduct.title || !newProduct.description || !newProduct.link) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const productToAdd = {
      ...newProduct,
      id: Date.now(), // ID único simples
      active: true
    };

    const updatedProducts = [...products, productToAdd];
    const success = await saveProducts(updatedProducts);
    
    if (success) {
      setNewProduct({
        title: '',
        description: '',
        thumbnail: '',
        price: '',
        date: '',
        time: '',
        link: '',
        active: true
      });
      setShowAddForm(false);
      toast.success('Produto adicionado com sucesso!');
    }
  };

  const handleInputChange = (field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Container>
        <Title>🛒 Gerenciar Produtos da Loja</Title>
        <Description>Carregando produtos...</Description>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🛒 Gerenciar Produtos da Loja</Title>
      <Description>
        Adicione, edite ou remova produtos da loja. Produtos desativados não aparecem para os usuários.
      </Description>

      <Button onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? '❌ Cancelar' : '➕ Adicionar Produto'}
      </Button>

      {showAddForm && (
        <AddProductForm>
          <FormTitle>Novo Produto</FormTitle>
          <FormGrid>
            <Input
              placeholder="Título do produto"
              value={newProduct.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
            <Input
              placeholder="Preço (ex: Online, R$ 50)"
              value={newProduct.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
            />
            <Input
              placeholder="Data (ex: 26.07.2025)"
              value={newProduct.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
            <Input
              placeholder="Horário (ex: 9h00 às 12h00)"
              value={newProduct.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
            />
            <Input
              placeholder="URL da imagem (opcional)"
              value={newProduct.thumbnail}
              onChange={(e) => handleInputChange('thumbnail', e.target.value)}
            />
            <Input
              placeholder="Link do evento/produto"
              value={newProduct.link}
              onChange={(e) => handleInputChange('link', e.target.value)}
            />
          </FormGrid>
          <TextArea
            placeholder="Descrição do produto"
            value={newProduct.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          <div style={{ marginTop: '10px' }}>
            <Button onClick={addProduct} disabled={saving}>
              {saving ? 'Salvando...' : '💾 Salvar Produto'}
            </Button>
          </div>
        </AddProductForm>
      )}

      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product.id} active={product.active}>
            <StatusBadge active={product.active}>
              {product.active ? 'ATIVO' : 'INATIVO'}
            </StatusBadge>
            <ProductTitle>{product.title}</ProductTitle>
            <ProductMeta>
              {product.price} • {product.date} {product.time && `• ${product.time}`}
            </ProductMeta>
            <ProductDescription>{product.description}</ProductDescription>
            <div>
              <Button 
                onClick={() => toggleProduct(product.id)} 
                disabled={saving}
                style={{ fontSize: '8px', padding: '6px 8px' }}
              >
                {product.active ? '🔴 Desativar' : '🟢 Ativar'}
              </Button>
              <DangerButton 
                onClick={() => deleteProduct(product.id)} 
                disabled={saving}
                style={{ fontSize: '8px', padding: '6px 8px' }}
              >
                🗑️ Excluir
              </DangerButton>
            </div>
          </ProductCard>
        ))}
      </ProductGrid>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', color: '#6a6a6a', fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
          Nenhum produto cadastrado
        </div>
      )}
    </Container>
  );
};

export default LojaProductManager; 