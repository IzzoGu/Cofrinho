import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import QrScanner from 'react-qr-scanner';
import Navbar from './Navbar';
import API_BASE_URL from '../config/api';

// Função para tentar diferentes URLs automaticamente
const tryApiRequest = async (requestFn) => {
  const fallbackUrls = [
    'https://192.168.0.35:9443',
    'http://192.168.0.35:8080',
    'http://192.168.0.35:5000',
    'http://192.168.0.35:3001',
    'http://192.168.0.35:4000',
    'https://localhost:9443',
    'http://localhost:8080',
    'http://localhost:5000'
  ];

  for (const url of fallbackUrls) {
    try {
      console.log(`Tentando conectar com: ${url}`);
      const result = await requestFn(url);
      console.log(`✅ Conexão bem-sucedida com: ${url}`);
      return result;
    } catch (error) {
      console.log(`❌ Falha ao conectar com: ${url}`, error.message);
      continue;
    }
  }
  
  throw new Error('Não foi possível conectar com nenhum servidor');
};

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraMode, setCameraMode] = useState('environment'); // 'environment' = traseira, 'user' = frontal

  useEffect(() => {
    // Verificar suporte à câmera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraSupported(true);
    } else {
      setCameraSupported(false);
      toast.warning('Câmera não suportada neste navegador. Use a entrada manual.');
    }

    // Solicitar permissão de localização
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Erro ao obter localização:', error);
          if (error.code === 1) {
            toast.warning('Localização negada. Use a entrada manual de localização.');
          }
        }
      );
    }
  }, []);

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const toggleCamera = () => {
    setCameraMode(prevMode => prevMode === 'environment' ? 'user' : 'environment');
  };

  const handleScan = (data) => {
    if (data) {
      handleQRCode(data);
    }
  };

  const handleError = (error) => {
    console.error('Erro no scanner:', error);
    
    if (error.name === 'NotAllowedError') {
      toast.error('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
    } else if (error.name === 'NotFoundError') {
      toast.error('Câmera não encontrada. Verifique se o dispositivo possui câmera.');
    } else if (error.name === 'NotSupportedError') {
      toast.error('Navegador não suporta acesso à câmera. Use Chrome ou Firefox.');
    } else if (error.message && error.message.includes('secure origins')) {
      toast.error('Acesso à câmera requer HTTPS. Use a entrada manual como alternativa.');
    } else {
      toast.error('Erro ao acessar a câmera: ' + error.message);
    }
  };

  const handleQRCode = async (qrData) => {
    if (!qrData) return;

    try {
      const token = localStorage.getItem('token');
      const response = await tryApiRequest(async (url) => {
        return await axios.post(`${url}/api/qr/scan`, {
          qrData,
          location: location || 'Localização não informada',
          latitude: position.latitude,
          longitude: position.longitude
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });

      if (response.data.success) {
        toast.success('QR Code escaneado com sucesso!');
        setScannedData(response.data.qrInfo);
        stopScanning();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao escanear QR code - Verifique sua conexão';
      toast.error(errorMessage);
    }
  };

  const handleManualInput = (e) => {
    if (e.key === 'Enter') {
      handleQRCode(e.target.value);
      e.target.value = '';
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setLocation('');
  };

  // Simulação de leitura QR (em produção, use uma biblioteca real)
  const simulateQRRead = () => {
    const qrCodes = ['PONTO_001', 'PONTO_002', 'PONTO_003', 'PONTO_004'];
    const randomQR = qrCodes[Math.floor(Math.random() * qrCodes.length)];
    handleQRCode(randomQR);
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <h1>Scanner de QR Code</h1>
          
          <div className="scanner-container">
            {!scannedData ? (
              <>
                <div className="card">
                  <h3>Configurações</h3>
                  <div className="form-group">
                    <label htmlFor="location">Localização (opcional):</label>
                    <input
                      type="text"
                      id="location"
                      className="form-control"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Portão Principal, Área A, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="manualQR">Ou digite o código manualmente:</label>
                    <input
                      type="text"
                      id="manualQR"
                      className="form-control"
                      onKeyPress={handleManualInput}
                      placeholder="Digite o código do QR e pressione Enter"
                    />
                  </div>
                </div>

                <div className="card">
                  <h3>Scanner de Câmera</h3>
                  {!cameraSupported ? (
                    <div className="text-center">
                      <div className="alert alert-warning">
                        <strong>Câmera não disponível</strong><br/>
                        O navegador não suporta acesso à câmera ou está bloqueado por questões de segurança.<br/>
                        Use a entrada manual abaixo ou acesse via HTTPS.
                      </div>
                      <button onClick={simulateQRRead} className="btn btn-secondary">
                        Simular QR Code
                      </button>
                    </div>
                  ) : !isScanning ? (
                    <div className="text-center">
                      <button onClick={startScanning} className="btn btn-primary">
                        Iniciar Scanner
                      </button>
                      <p className="text-muted mt-3">
                        Ou use o botão abaixo para simular um escaneamento
                      </p>
                      <button onClick={simulateQRRead} className="btn btn-secondary">
                        Simular QR Code
                      </button>
                    </div>
                  ) : (
                    <div className="scanner-overlay">
                      <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: '100%', maxWidth: '400px' }}
                        facingMode={cameraMode}
                        constraints={{
                          video: {
                            facingMode: { ideal: cameraMode }
                          }
                        }}
                      />
                      <div className="text-center mt-3">
                        <button onClick={stopScanning} className="btn btn-danger">
                          Parar Scanner
                        </button>
                        <button onClick={toggleCamera} className="btn btn-secondary ml-2">
                          {cameraMode === 'environment' ? '📷 Frontal' : '📷 Traseira'}
                        </button>
                        <p className="text-muted mt-2">
                          Posicione o QR code dentro do quadro
                          <br/>
                          <small>Câmera: {cameraMode === 'environment' ? 'Traseira' : 'Frontal'}</small>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card">
                <h3>QR Code Escaneado com Sucesso!</h3>
                <div className="text-center">
                  <div className="mb-3">
                    <span className="badge badge-success" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
                      {scannedData.code}
                    </span>
                  </div>
                  <p><strong>Descrição:</strong> {scannedData.description}</p>
                  <p><strong>Localização:</strong> {scannedData.location}</p>
                  <p><strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}</p>
                  
                  <div className="mt-3">
                    <button onClick={resetScanner} className="btn btn-primary">
                      Escanear Outro QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3>QR Codes Cadastrados</h3>
            <QRCodeList />
          </div>
        </div>
      </div>
    </>
  );
};

const QRCodeList = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await tryApiRequest(async (url) => {
        return await axios.get(`${url}/api/qr/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });
      setQrCodes(response.data);
    } catch (error) {
      console.error('Erro ao carregar QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando QR codes...</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Localização</th>
          </tr>
        </thead>
        <tbody>
          {qrCodes.map((qr) => (
            <tr key={qr.id}>
              <td>
                <span className="badge badge-primary">{qr.code}</span>
              </td>
              <td>{qr.description}</td>
              <td>{qr.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QRScanner;
