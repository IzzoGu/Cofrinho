import argparse
import os
import cv2
import numpy as np
from scipy.io import wavfile
from scipy import signal
from PIL import Image
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

class AIContentDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        
    def analyze_image(self, image_path):
        """Analisa uma imagem para detectar se foi gerada por IA."""
        try:
            # Carrega a imagem
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Não foi possível carregar a imagem")
            
            # Extrai características da imagem
            features = self._extract_image_features(img)
            
            # Análise de padrões
            pattern_score = self._analyze_patterns(img)
            
            # Análise de artefatos de compressão
            compression_score = self._analyze_compression_artifacts(img)
            
            # Combina os scores
            final_score = (pattern_score + compression_score) / 2
            
            return {
                'is_ai_generated': final_score > 0.7,
                'confidence': final_score,
                'pattern_score': pattern_score,
                'compression_score': compression_score
            }
            
        except Exception as e:
            print(f"Erro ao analisar imagem: {str(e)}")
            return None

    def analyze_video(self, video_path):
        """Analisa um vídeo para detectar se foi gerado por IA."""
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError("Não foi possível abrir o vídeo")
            
            frame_scores = []
            frame_count = 0
            max_frames = 100  # Limita o número de frames para análise
            
            while cap.isOpened() and frame_count < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Analisa cada frame
                frame_result = self.analyze_image(frame)
                if frame_result:
                    frame_scores.append(frame_result['confidence'])
                
                frame_count += 1
            
            cap.release()
            
            if not frame_scores:
                return None
            
            # Calcula o score final do vídeo
            final_score = np.mean(frame_scores)
            
            return {
                'is_ai_generated': final_score > 0.7,
                'confidence': final_score,
                'frame_analysis_count': frame_count
            }
            
        except Exception as e:
            print(f"Erro ao analisar vídeo: {str(e)}")
            return None

    def analyze_audio(self, audio_path):
        """Analisa um arquivo de áudio para detectar se foi gerado por IA."""
        try:
            # Carrega o áudio
            sample_rate, audio_data = wavfile.read(audio_path)
            
            # Converte para mono se necessário
            if len(audio_data.shape) > 1:
                audio_data = np.mean(audio_data, axis=1)
            
            # Normaliza o áudio
            audio_data = audio_data / np.max(np.abs(audio_data))
            
            # Calcula o espectrograma
            frequencies, times, spectrogram = signal.spectrogram(audio_data, sample_rate)
            
            # Extrai características
            spectral_centroid = np.mean(frequencies * np.sum(spectrogram, axis=1))
            spectral_rolloff = np.percentile(frequencies, 85)
            spectral_flux = np.mean(np.diff(spectrogram, axis=1))
            
            # Análise de características
            features = np.array([
                spectral_centroid,
                spectral_rolloff,
                spectral_flux
            ])
            
            # Normaliza as características
            features = self.scaler.fit_transform(features.reshape(1, -1))
            
            # Análise de padrões de áudio
            pattern_score = self._analyze_audio_patterns(audio_data, sample_rate)
            
            return {
                'is_ai_generated': pattern_score > 0.7,
                'confidence': pattern_score,
                'features_analyzed': len(features)
            }
            
        except Exception as e:
            print(f"Erro ao analisar áudio: {str(e)}")
            return None

    def _extract_image_features(self, img):
        """Extrai características relevantes da imagem."""
        # Converte para escala de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calcula histograma
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        
        # Calcula gradientes
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobelx**2 + sobely**2)
        
        return np.concatenate([hist, gradient_magnitude.flatten()])

    def _analyze_patterns(self, img):
        """Analisa padrões na imagem que podem indicar geração por IA."""
        # Converte para escala de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Aplica FFT
        f = np.fft.fft2(gray)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
        
        # Ajusta para matriz quadrada
        min_dim = min(fshift.shape[0], fshift.shape[1])
        fshift_square = fshift[:min_dim, :min_dim]
        
        # Analisa simetria e padrões repetitivos
        symmetry_score = np.mean(np.abs(fshift_square - fshift_square.T))
        pattern_score = np.std(magnitude_spectrum)
        
        return (symmetry_score + pattern_score) / 2

    def _analyze_compression_artifacts(self, img):
        """Analisa artefatos de compressão que podem indicar manipulação."""
        # Converte para YCrCb
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        
        # Analisa blocos de compressão
        blocks = self._find_compression_blocks(ycrcb[:,:,0])
        
        return np.mean(blocks)

    def _find_compression_blocks(self, channel):
        """Encontra blocos de compressão em um canal de imagem."""
        # Aplica DCT
        dct = cv2.dct(np.float32(channel))
        
        # Analisa padrões de compressão
        block_score = np.std(dct)
        
        return block_score

    def _analyze_audio_patterns(self, audio_data, sample_rate):
        """Analisa padrões no áudio que podem indicar geração por IA."""
        # Calcula o espectrograma
        frequencies, times, spectrogram = signal.spectrogram(audio_data, sample_rate)
        
        # Analisa padrões de frequência
        freq_patterns = np.std(spectrogram, axis=1)
        
        # Analisa transições
        onset_env = np.diff(np.mean(spectrogram, axis=0))
        transition_score = np.std(onset_env)
        
        return (np.mean(freq_patterns) + transition_score) / 2

def main():
    parser = argparse.ArgumentParser(description='Detector de Conteúdo Gerado por IA')
    parser.add_argument('--input', required=True, help='Caminho do arquivo a ser analisado')
    parser.add_argument('--type', required=True, choices=['image', 'video', 'audio'],
                      help='Tipo de mídia (image, video, audio)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Erro: Arquivo {args.input} não encontrado")
        return
    
    detector = AIContentDetector()
    
    if args.type == 'image':
        result = detector.analyze_image(args.input)
    elif args.type == 'video':
        result = detector.analyze_video(args.input)
    else:  # audio
        result = detector.analyze_audio(args.input)
    
    if result:
        print("\nResultados da Análise:")
        print(f"Arquivo: {args.input}")
        print(f"Tipo: {args.type}")
        print(f"Gerado por IA: {'Sim' if result['is_ai_generated'] else 'Não'}")
        print(f"Confiança: {result['confidence']:.2%}")
        
        if 'pattern_score' in result:
            print(f"Score de Padrões: {result['pattern_score']:.2%}")
        if 'compression_score' in result:
            print(f"Score de Compressão: {result['compression_score']:.2%}")
    else:
        print("Não foi possível analisar o arquivo")

if __name__ == "__main__":
    main() 