import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
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
        }
      );
    }
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (error) {
      toast.error('Erro ao acessar a câmera: ' + error.message);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCode = async (qrData) => {
    if (!qrData) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/qr/scan', {
        qrData,
        location: location || 'Localização não informada',
        latitude: position.latitude,
        longitude: position.longitude
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('QR Code escaneado com sucesso!');
        setScannedData(response.data.qrInfo);
        stopScanning();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao escanear QR code';
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
                  {!isScanning ? (
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
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="scanner-video"
                      />
                      <div className="scanner-frame"></div>
                      <div className="text-center mt-3">
                        <button onClick={stopScanning} className="btn btn-danger">
                          Parar Scanner
                        </button>
                        <p className="text-muted mt-2">
                          Posicione o QR code dentro do quadro
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
      const response = await axios.get('/api/qr/list', {
        headers: { Authorization: `Bearer ${token}` }
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
