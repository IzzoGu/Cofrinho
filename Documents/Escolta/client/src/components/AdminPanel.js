import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'adm') {
      fetchAdminData();
    }
  }, [user?.role]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Buscar estatísticas
      const statsResponse = await axios.get('/api/logs/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data);

      // Buscar usuários
      const usersResponse = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersResponse.data);

      // Buscar QR codes
      const qrResponse = await axios.get('/api/qr/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCodes(qrResponse.data);

    } catch (error) {
      toast.error('Erro ao carregar dados administrativos');
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'adm') {
    return (
      <>
        <Navbar />
        <div className="main-content">
          <div className="container">
            <div className="card text-center">
              <h2>Acesso Negado</h2>
              <p>Você não tem permissão para acessar esta área.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando painel administrativo...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <h1>Painel Administrativo</h1>

          <div className="card">
            <div className="d-flex gap-2" style={{ borderBottom: '1px solid #dee2e6', marginBottom: '1rem' }}>
              <button
                className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('stats')}
              >
                Estatísticas
              </button>
              <button
                className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('users')}
              >
                Usuários
              </button>
              <button
                className={`btn ${activeTab === 'qrcodes' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('qrcodes')}
              >
                QR Codes
              </button>
            </div>

            {activeTab === 'stats' && <StatsTab stats={stats} />}
            {activeTab === 'users' && <UsersTab users={users} onRefresh={fetchAdminData} />}
            {activeTab === 'qrcodes' && <QRCodesTab qrCodes={qrCodes} onRefresh={fetchAdminData} />}
          </div>
        </div>
      </div>
    </>
  );
};

const StatsTab = ({ stats }) => (
  <div>
    <h3>Estatísticas Gerais</h3>
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-number">{stats.totalScans || 0}</div>
        <div className="stat-label">Total de Escaneamentos</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.scansToday || 0}</div>
        <div className="stat-label">Escaneamentos Hoje</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.activeUsers || 0}</div>
        <div className="stat-label">Usuários Ativos (7 dias)</div>
      </div>
    </div>

    {stats.topQRCodes && stats.topQRCodes.length > 0 && (
      <div className="mt-4">
        <h4>QR Codes Mais Escaneados</h4>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>QR Code</th>
                <th>Descrição</th>
                <th>Escaneamentos</th>
              </tr>
            </thead>
            <tbody>
              {stats.topQRCodes.map((qr, index) => (
                <tr key={index}>
                  <td>
                    <span className="badge badge-primary">{qr.qr_data}</span>
                  </td>
                  <td>{qr.description || 'Sem descrição'}</td>
                  <td>{qr.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const UsersTab = ({ users, onRefresh }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'escolta',
    full_name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.role) {
      toast.error('Username, senha e perfil são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Usuário criado com sucesso!');
      setNewUser({
        username: '',
        password: '',
        role: 'escolta',
        full_name: '',
        email: '',
        phone: '',
        company: ''
      });
      setShowCreateForm(false);
      onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao criar usuário';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser.username || !editingUser.role) {
      toast.error('Username e perfil são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/${editingUser.id}`, editingUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Usuário atualizado com sucesso!');
      setEditingUser(null);
      onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar usuário';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Usuário deletado com sucesso!');
      onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao deletar usuário';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'adm': 'badge-adm',
      'escolta': 'badge-escolta',
      'cliente': 'badge-primary'
    };
    const labels = {
      'adm': 'Admin',
      'escolta': 'Escolta',
      'cliente': 'Cliente'
    };
    return (
      <span className={`badge ${badges[role] || 'badge-secondary'}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Usuários</h3>
        <div className="d-flex gap-2">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            className="btn btn-success"
          >
            {showCreateForm ? 'Cancelar' : 'Novo Usuário'}
          </button>
          <button onClick={onRefresh} className="btn btn-secondary">
            Atualizar
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="card mb-3">
          <h4>Criar Novo Usuário</h4>
          <form onSubmit={handleCreateUser}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="create-username">Username:</label>
                  <input
                    type="text"
                    id="create-username"
                    className="form-control"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="create-password">Senha:</label>
                  <input
                    type="password"
                    id="create-password"
                    className="form-control"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="create-role">Perfil:</label>
                  <select
                    id="create-role"
                    className="form-control"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    required
                  >
                    <option value="escolta">Escolta</option>
                    <option value="cliente">Cliente</option>
                    <option value="adm">Admin</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="create-fullname">Nome Completo:</label>
                  <input
                    type="text"
                    id="create-fullname"
                    className="form-control"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="create-email">Email:</label>
                  <input
                    type="email"
                    id="create-email"
                    className="form-control"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="create-phone">Telefone:</label>
                  <input
                    type="text"
                    id="create-phone"
                    className="form-control"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-group">
                  <label htmlFor="create-company">Empresa:</label>
                  <input
                    type="text"
                    id="create-company"
                    className="form-control"
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>
        </div>
      )}
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Nome</th>
              <th>Perfil</th>
              <th>Email</th>
              <th>Empresa</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.full_name || 'N/A'}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{user.email || 'N/A'}</td>
                <td>{user.company || 'N/A'}</td>
                <td>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      onClick={() => setEditingUser({ ...user })}
                      className="btn btn-sm btn-primary"
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-sm btn-danger"
                      disabled={loading}
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="card mt-3">
          <h4>Editar Usuário</h4>
          <form onSubmit={handleEditUser}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="edit-username">Username:</label>
                  <input
                    type="text"
                    id="edit-username"
                    className="form-control"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="edit-role">Perfil:</label>
                  <select
                    id="edit-role"
                    className="form-control"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    required
                  >
                    <option value="escolta">Escolta</option>
                    <option value="cliente">Cliente</option>
                    <option value="adm">Admin</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="edit-fullname">Nome Completo:</label>
                  <input
                    type="text"
                    id="edit-fullname"
                    className="form-control"
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="edit-email">Email:</label>
                  <input
                    type="email"
                    id="edit-email"
                    className="form-control"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="edit-phone">Telefone:</label>
                  <input
                    type="text"
                    id="edit-phone"
                    className="form-control"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="edit-company">Empresa:</label>
                  <input
                    type="text"
                    id="edit-company"
                    className="form-control"
                    value={editingUser.company || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const QRCodesTab = ({ qrCodes, onRefresh }) => {
  const [newQR, setNewQR] = useState({
    code: '',
    description: '',
    location: ''
  });
  const [adding, setAdding] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleAddQR = async (e) => {
    e.preventDefault();
    if (!newQR.code || !newQR.description) {
      toast.error('Código e descrição são obrigatórios');
      return;
    }

    try {
      setAdding(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/qr/add', newQR, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('QR Code adicionado com sucesso!');
      setNewQR({ code: '', description: '', location: '' });
      onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao adicionar QR code';
      toast.error(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    if (!newQR.code) {
      toast.error('Código é obrigatório para gerar QR');
      return;
    }

    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/qr-generator/generate', newQR, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setGeneratedQR(response.data);
        toast.success('QR Code gerado com sucesso!');
        onRefresh(); // Atualizar lista de QR codes
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao gerar QR code';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateExistingQR = async (code) => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/qr-generator/generate/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setGeneratedQR(response.data);
        toast.success('QR Code gerado com sucesso!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao gerar QR code';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>QR Codes Cadastrados</h3>
        <button onClick={onRefresh} className="btn btn-secondary">
          Atualizar
        </button>
      </div>

      <div className="card mb-3">
        <h4>Adicionar Novo QR Code</h4>
        <form onSubmit={handleAddQR}>
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="code">Código:</label>
                <input
                  type="text"
                  id="code"
                  className="form-control"
                  value={newQR.code}
                  onChange={(e) => setNewQR({ ...newQR, code: e.target.value })}
                  placeholder="Ex: PONTO_005"
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="description">Descrição:</label>
                <input
                  type="text"
                  id="description"
                  className="form-control"
                  value={newQR.description}
                  onChange={(e) => setNewQR({ ...newQR, description: e.target.value })}
                  placeholder="Ex: Área de Estacionamento B"
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="location">Localização:</label>
                <input
                  type="text"
                  id="location"
                  className="form-control"
                  value={newQR.location}
                  onChange={(e) => setNewQR({ ...newQR, location: e.target.value })}
                  placeholder="Ex: Estacionamento B"
                />
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-success"
              disabled={adding}
            >
              {adding ? 'Adicionando...' : 'Adicionar QR Code'}
            </button>
            <button
              type="button"
              onClick={handleGenerateQR}
              className="btn btn-primary"
              disabled={generating || adding}
            >
              {generating ? 'Gerando...' : 'Gerar QR Code'}
            </button>
          </div>
        </form>
      </div>

      <div className="table-responsive">
        <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Descrição</th>
                <th>Localização</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
          <tbody>
            {qrCodes.map((qr) => (
              <tr key={qr.id}>
                <td>{qr.id}</td>
                <td>
                  <span className="badge badge-primary">{qr.code}</span>
                </td>
                <td>{qr.description}</td>
                <td>{qr.location || 'N/A'}</td>
                <td>{new Date(qr.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button
                    onClick={() => handleGenerateExistingQR(qr.code)}
                    className="btn btn-sm btn-primary"
                    disabled={generating}
                  >
                    Gerar QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {generatedQR && (
        <div className="card mt-4">
          <h4>QR Code Gerado</h4>
          <div className="text-center">
            <div className="mb-3">
              <img 
                src={generatedQR.qrCode} 
                alt={`QR Code ${generatedQR.code}`}
                style={{ 
                  maxWidth: '300px', 
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>
            <div className="mb-3">
              <p><strong>Código:</strong> {generatedQR.code}</p>
              <p><strong>Descrição:</strong> {generatedQR.description}</p>
              <p><strong>Localização:</strong> {generatedQR.location || 'N/A'}</p>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedQR.qrCode;
                  link.download = `qr-code-${generatedQR.code}.png`;
                  link.click();
                }}
                className="btn btn-success"
              >
                Baixar PNG
              </button>
              <button
                onClick={() => setGeneratedQR(null)}
                className="btn btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
