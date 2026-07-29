import os
import torch
from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__,
    template_folder=os.path.join(BASE_DIR, 'app', 'templates'),
    static_folder=os.path.join(BASE_DIR, 'app', 'static'),
)
MODEL_DIR = os.path.join(BASE_DIR, 'models', 'arat5_reg')
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

MAX_SOURCE_LEN = 64
MAX_TARGET_LEN = 64

tokenizer = None
model = None

dialect_map = {
    'egy': 'Egyptian',
    'glf': 'Gulf',
    'lev': 'Levantine',
    'reg': 'General',
}


def load_model():
    global tokenizer, model
    if tokenizer is None or model is None:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, local_files_only=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_DIR, local_files_only=True).to(DEVICE)
        model.eval()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    text = data['text'].strip()
    if not text:
        return jsonify({'error': 'Empty text'}), 400

    load_model()

    inputs = tokenizer(text, return_tensors='pt', truncation=True, max_length=MAX_SOURCE_LEN).to(DEVICE)

    with torch.no_grad():
        output_ids = model.generate(**inputs, max_length=MAX_TARGET_LEN)

    translation = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    return jsonify({
        'input': text,
        'translation': translation,
    })


@app.route('/api/health', methods=['GET'])
def health():
    load_model()
    return jsonify({'status': 'ok', 'device': DEVICE})


if __name__ == '__main__':
    print(f'Loading AraT5 model from {MODEL_DIR}...')
    load_model()
    print(f'Model loaded on {DEVICE}')
    app.run(host='0.0.0.0', port=5000, debug=False)
