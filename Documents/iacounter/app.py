from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
from main import AIContentDetector

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Garante que a pasta de uploads existe
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Extensões permitidas
ALLOWED_EXTENSIONS = {
    'image': {'png', 'jpg', 'jpeg', 'gif'},
    'video': {'mp4', 'avi', 'mov', 'mkv'},
    'audio': {'mp3', 'wav', 'ogg'}
}

def allowed_file(filename, file_type):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS[file_type]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    file_type = request.form.get('type', 'image')
    
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    if not allowed_file(file.filename, file_type):
        return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
    
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Analisa o arquivo
        detector = AIContentDetector()
        
        if file_type == 'image':
            result = detector.analyze_image(filepath)
        elif file_type == 'video':
            result = detector.analyze_video(filepath)
        else:  # audio
            result = detector.analyze_audio(filepath)
        
        # Remove o arquivo após a análise
        os.remove(filepath)
        
        if result:
            return jsonify({
                'success': True,
                'is_ai_generated': result['is_ai_generated'],
                'confidence': f"{result['confidence']:.2%}",
                'details': result
            })
        else:
            return jsonify({'error': 'Não foi possível analisar o arquivo'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 