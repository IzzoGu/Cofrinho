import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';

const Logs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    description: ''
  });
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await axios.get(`/api/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Erro ao carregar logs');
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLogs();
    if (user?.role === 'adm') {
      fetchUsers();
    }
  }, [fetchLogs, user?.role]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const exportLogs = async (format = 'json') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        format,
        ...filters
      });

      const response = await axios.get(`/api/logs/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast.success('Logs exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar logs');
      console.error('Erro ao exportar logs:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatLocation = (log) => {
    if (log.latitude && log.longitude) {
      return `${log.location || 'N/A'} (${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)})`;
    }
    return log.location || 'N/A';
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <h1>Logs de Escaneamento</h1>

          <div className="filters">
            <h3>Filtros</h3>
            <div className="filters-row">
              <div className="filter-group">
                <label htmlFor="startDate">Data Inicial:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-control"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="endDate">Data Final:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-control"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>

              {user?.role === 'adm' && (
                <div className="filter-group">
                  <label htmlFor="userId">Usuário:</label>
                  <select
                    id="userId"
                    name="userId"
                    className="form-control"
                    value={filters.userId}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos os usuários</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-group">
                <label htmlFor="description">Descrição:</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="form-control"
                  value={filters.description}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por descrição do QR code"
                />
              </div>

              <div className="filter-group">
                <label>&nbsp;</label>
                <div className="d-flex gap-2">
                  <button
                    onClick={fetchLogs}
                    className="btn btn-primary"
                  >
                    Aplicar Filtros
                  </button>
                  <button
                    onClick={() => setFilters({ startDate: '', endDate: '', userId: '', description: '' })}
                    className="btn btn-secondary"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="logs-table">
            <div className="table-header d-flex justify-content-between align-items-center">
              <h3>Registros de Escaneamento</h3>
              <div className="d-flex gap-2">
                <button
                  onClick={() => exportLogs('json')}
                  className="btn btn-success"
                  disabled={loading}
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => exportLogs('csv')}
                  className="btn btn-success"
                  disabled={loading}
                >
                  Exportar CSV
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Carregando logs...</p>
              </div>
            ) : logs.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Usuário</th>
                        <th>QR Code</th>
                        <th>Descrição</th>
                        <th>Localização</th>
                        <th>Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td>
                            <span className="badge badge-primary">
                              {log.username}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-success">
                              {log.qr_data}
                            </span>
                          </td>
                          <td>{log.qr_description}</td>
                          <td>{formatLocation(log)}</td>
                          <td>{formatDate(log.scanned_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Anterior
                    </button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.pages || 
                        Math.abs(page - pagination.page) <= 2
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && <span>...</span>}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={page === pagination.page ? 'active' : ''}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))
                    }
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Próximo
                    </button>
                  </div>
                )}

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Mostrando {logs.length} de {pagination.total} registros
                  </small>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted">Nenhum log encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Logs;
