# IA Content Detector

Esta ferramenta foi desenvolvida para detectar conteúdo gerado por Inteligência Artificial em diferentes tipos de mídia (imagens, vídeos e áudios).

## Funcionalidades

- Detecção de imagens geradas por IA
- Análise de vídeos para identificar conteúdo sintético
- Verificação de áudios gerados por IA
- Interface de linha de comando para fácil utilização

## Requisitos

- Python 3.8 ou superior
- Dependências listadas em `requirements.txt`

## Instalação

1. Clone este repositório
2. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Uso

Para analisar um arquivo:
```bash
python main.py --input caminho/do/arquivo --type [image|video|audio]
```

Exemplos:
```bash
# Analisar uma imagem
python main.py --input imagem.jpg --type image

# Analisar um vídeo
python main.py --input video.mp4 --type video

# Analisar um áudio
python main.py --input audio.mp3 --type audio
```

## Como funciona

A ferramenta utiliza diferentes técnicas de análise para cada tipo de mídia:

- **Imagens**: Análise de padrões, artefatos de compressão e características específicas de imagens geradas por IA
- **Vídeos**: Detecção de inconsistências entre frames e análise de movimento
- **Áudios**: Análise de espectrogramas e características acústicas

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests. 