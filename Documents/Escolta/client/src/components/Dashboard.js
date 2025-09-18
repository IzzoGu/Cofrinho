import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from './Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 0,
    activeUsers: 0,
    scansToday: 0,
    topQRCodes: []
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Buscar estatísticas (apenas admin)
      if (user?.role === 'adm') {
        const statsResponse = await axios.get('/api/logs/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsResponse.data);
      }

      // Buscar logs recentes
      const logsResponse = await axios.get('/api/logs?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentLogs(logsResponse.data.logs);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <h1>Dashboard</h1>
          <p className="text-muted">Bem-vindo, {user?.username}!</p>

          {user?.role === 'adm' && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.totalScans}</div>
                <div className="stat-label">Total de Escaneamentos</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.scansToday}</div>
                <div className="stat-label">Escaneamentos Hoje</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.activeUsers}</div>
                <div className="stat-label">Usuários Ativos (7 dias)</div>
              </div>
            </div>
          )}

          <div className="card">
            <h2>Ações Rápidas</h2>
            <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
              {(user?.role === 'escolta' || user?.role === 'adm') && (
                <Link to="/scanner" className="btn btn-primary">
                  Escanear QR Code
                </Link>
              )}
              <Link to="/logs" className="btn btn-secondary">
                Ver Logs
              </Link>
              {user?.role === 'adm' && (
                <Link to="/admin" className="btn btn-success">
                  Painel Admin
                </Link>
              )}
            </div>
          </div>

          <div className="card">
            <h2>Logs Recentes</h2>
            {recentLogs.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>QR Code</th>
                      <th>Localização</th>
                      <th>Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.username}</td>
                        <td>
                          <span className="badge badge-primary">
                            {log.qr_data}
                          </span>
                        </td>
                        <td>{log.location || log.qr_location}</td>
                        <td>{formatDate(log.scanned_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">Nenhum log encontrado.</p>
            )}
            <div className="text-center mt-3">
              <Link to="/logs" className="btn btn-secondary">
                Ver Todos os Logs
              </Link>
            </div>
          </div>

          {user?.role === 'adm' && stats.topQRCodes.length > 0 && (
            <div className="card">
              <h2>QR Codes Mais Escaneados</h2>
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
                          <span className="badge badge-primary">
                            {qr.qr_data}
                          </span>
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
      </div>
    </>
  );
};

export default Dashboard;
