document.addEventListener('DOMContentLoaded', function () {
    const inputText = document.getElementById('inputText');
    const translateBtn = document.getElementById('translateBtn');
    const resultSection = document.getElementById('resultSection');
    const originalText = document.getElementById('originalText');
    const translatedText = document.getElementById('translatedText');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const deviceStatus = document.getElementById('deviceStatus');
    const exampleBtns = document.querySelectorAll('.example-btn');

    let isTranslating = false;

    checkHealth();

    function checkHealth() {
        fetch('/api/health')
            .then(res => res.json())
            .then(data => {
                deviceStatus.textContent = data.device === 'cuda' ? 'GPU' : 'CPU';
            })
            .catch(() => {
                deviceStatus.textContent = 'غير متصل';
            });
    }

    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            inputText.value = this.dataset.text;
            inputText.focus();
            translateBtn.classList.add('btn-pulse');
            setTimeout(() => translateBtn.classList.remove('btn-pulse'), 600);
        });
    });

    translateBtn.addEventListener('click', doTranslate);

    inputText.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            doTranslate();
        }
    });

    function doTranslate() {
        const text = inputText.value.trim();
        if (!text) {
            inputText.style.borderColor = '#c0392b';
            inputText.style.boxShadow = '0 0 20px rgba(192,57,43,0.2)';
            setTimeout(() => {
                inputText.style.borderColor = '';
                inputText.style.boxShadow = '';
            }, 1000);
            return;
        }

        if (isTranslating) return;
        isTranslating = true;

        loadingOverlay.classList.remove('hidden');
        translateBtn.disabled = true;

        fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        })
        .then(res => {
            if (!res.ok) throw new Error('Translation failed');
            return res.json();
        })
        .then(data => {
            originalText.textContent = data.input;
            translatedText.textContent = data.translation;
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        })
        .catch(err => {
            translatedText.textContent = '⚠️ حدث خطأ أثناء الترجمة';
            translatedText.style.color = '#c0392b';
            resultSection.classList.remove('hidden');
            console.error(err);
        })
        .finally(() => {
            loadingOverlay.classList.add('hidden');
            translateBtn.disabled = false;
            isTranslating = false;
        });
    }

    const style = document.createElement('style');
    style.textContent = `
        .btn-pulse {
            animation: btnPulse 0.6s ease-out;
        }
        @keyframes btnPulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.4); }
            100% { box-shadow: 0 0 0 15px rgba(201, 168, 76, 0); }
        }
    `;
    document.head.appendChild(style);
});
