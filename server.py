from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS
try:
    import google.generativeai as genai
except Exception:
    genai = None
try:
    from openai import OpenAI
except Exception:
    OpenAI = None
import requests
import os
import json
import tempfile
from urllib.parse import urlparse
from dotenv import load_dotenv
import logging

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

logging.basicConfig(level=logging.INFO)

NASA_API_KEY = os.getenv('NASA_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GEMINI_MODEL = (os.getenv('GEMINI_MODEL') or '').strip()
OPENAI_TRANSCRIBE_MODEL = os.getenv('OPENAI_TRANSCRIBE_MODEL', 'gpt-4o-mini-transcribe')
MAX_AUDIO_MB = int(os.getenv('MAX_AUDIO_MB', '20'))
NASA_SEARCH_LIMIT = int(os.getenv('NASA_SEARCH_LIMIT', '10'))

model = None
SELECTED_GEMINI_MODEL = None
GEMINI_INIT_ERROR = ''


def normalize_model_name(name):
    if not name:
        return ''
    return name if name.startswith('models/') else f'models/{name}'


def select_gemini_model(preferred_name):
    if not genai:
        return None

    preferred = normalize_model_name((preferred_name or '').strip())
    available = []
    list_failed = False

    try:
        for item in genai.list_models():
            methods = getattr(item, 'supported_generation_methods', []) or []
            if 'generateContent' in methods:
                available.append(item.name)
    except Exception:
        list_failed = True
        available = []

    if preferred:
        for name in available:
            if name == preferred or name.endswith(f"/{preferred}"):
                return name
        if available:
            for name in ('models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-1.0-pro'):
                if name in available:
                    return name
            return available[0]
        if list_failed:
            return 'models/gemini-1.5-flash'
        return preferred

    for name in ('models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-1.0-pro'):
        if name in available:
            return name

    return available[0] if available else 'models/gemini-1.5-flash'


if GEMINI_API_KEY and genai:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        SELECTED_GEMINI_MODEL = select_gemini_model(GEMINI_MODEL)
        if SELECTED_GEMINI_MODEL:
            model = genai.GenerativeModel(SELECTED_GEMINI_MODEL)
        else:
            GEMINI_INIT_ERROR = 'Не удалось выбрать модель Gemini.'
    except Exception as exc:
        GEMINI_INIT_ERROR = str(exc)
        model = None
elif not GEMINI_API_KEY:
    GEMINI_INIT_ERROR = 'GEMINI_API_KEY не указан.'
elif not genai:
    GEMINI_INIT_ERROR = 'Библиотека google-generativeai не установлена.'

openai_client = None
if OPENAI_API_KEY and OpenAI:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

ai_cache = {}
transcript_cache = {}
search_cache = {}

ALLOWED_AUDIO_EXT = ('.mp3', '.wav', '.m4a', '.ogg', '.flac')


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


def extract_json(text):
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            snippet = text[start:end + 1]
            try:
                return json.loads(snippet)
            except json.JSONDecodeError:
                return None
    return None


def build_prompt(payload, transcript=None):
    sound_name = payload.get('sound_name', 'космический сигнал')
    sound_description = payload.get('sound_description', '')
    sound_type = payload.get('sound_type', 'космическое явление')
    duration = payload.get('duration')
    center = payload.get('center')
    nasa_id = payload.get('nasa_id')
    keywords = payload.get('keywords') or []
    features = payload.get('features') or {}

    duration_text = f"Длительность записи: {duration} сек." if duration else "Длительность записи неизвестна."
    center_text = f"Центр NASA: {center}." if center else ""
    nasa_id_text = f"NASA ID: {nasa_id}." if nasa_id else ""
    keyword_text = f"Ключевые теги: {', '.join(keywords[:8])}." if keywords else ""

    feature_text = ""
    if features:
        energy = features.get('energy')
        peak = features.get('peak')
        band = features.get('band')
        low = features.get('low')
        mid = features.get('mid')
        high = features.get('high')
        feature_text = (
            "Данные спектра: "
            f"энергия {energy}%, пик {peak}%, доминирующий диапазон {band}. "
            f"Низкий {low}%, средний {mid}%, высокий {high}."
        )

    transcript_text = f"Текстовая транскрипция аудио: {transcript}" if transcript else "Транскрипция речи недоступна или не обнаружена."

    prompt = f"""
Ты — эксперт NASA по астрофизике и обработке космических сигналов.
Пользователь слушал сонфицированную запись: "{sound_name}".
Тип явления: {sound_type}.
Контекст: {sound_description}
{duration_text}
{center_text}
{nasa_id_text}
{keyword_text}
{feature_text}
{transcript_text}

Сформируй ответ строго в JSON без Markdown и без лишнего текста.
Формат:
{{
  "transcript": "...",
  "explanation": "...",
  "insights": ["...", "...", "..."],
  "disclaimer": "..."
}}
Требования:
- transcript: 2–3 предложения, если реальная транскрипция недоступна.
- explanation: 4–6 предложений научного объяснения простым языком.
- insights: 3 короткие смысловые заметки.
- disclaimer: 1 фраза о том, что это интерпретация сонфикации.
""".strip()

    return prompt


def is_audio_url(url):
    if not url:
        return False
    path = urlparse(url).path.lower()
    return path.endswith(ALLOWED_AUDIO_EXT)


def guess_suffix(url, content_type):
    path = urlparse(url).path
    ext = os.path.splitext(path)[1].lower()
    if ext in ALLOWED_AUDIO_EXT:
        return ext
    if content_type:
        if 'wav' in content_type:
            return '.wav'
        if 'ogg' in content_type:
            return '.ogg'
        if 'flac' in content_type:
            return '.flac'
        if 'mpeg' in content_type or 'mp3' in content_type:
            return '.mp3'
        if 'm4a' in content_type:
            return '.m4a'
    return '.mp3'


def download_audio(url):
    response = requests.get(url, stream=True, timeout=20)
    response.raise_for_status()

    max_bytes = MAX_AUDIO_MB * 1024 * 1024
    content_length = int(response.headers.get('Content-Length', 0))
    if content_length and content_length > max_bytes:
        raise ValueError('Аудио слишком большое для транскрипции.')

    suffix = guess_suffix(url, response.headers.get('Content-Type', ''))
    total = 0
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        for chunk in response.iter_content(chunk_size=512 * 1024):
            if not chunk:
                continue
            total += len(chunk)
            if total > max_bytes:
                tmp.close()
                os.unlink(tmp.name)
                raise ValueError('Аудио превышает лимит размера.')
            tmp.write(chunk)
        return tmp.name


def transcribe_audio(audio_url):
    if not openai_client or not audio_url:
        return None

    if audio_url in transcript_cache:
        return transcript_cache[audio_url]

    audio_path = None
    try:
        audio_path = download_audio(audio_url)
        with open(audio_path, 'rb') as audio_file:
            transcription = openai_client.audio.transcriptions.create(
                model=OPENAI_TRANSCRIBE_MODEL,
                file=audio_file,
                response_format='text'
            )
        text = getattr(transcription, 'text', None)
        if not text:
            text = str(transcription)
        text = text.strip()
        if len(text) < 3:
            text = 'Речь не обнаружена в аудиосигнале.'
        transcript_cache[audio_url] = text
        return text
    finally:
        if audio_path and os.path.exists(audio_path):
            os.unlink(audio_path)


def resolve_audio_url(item):
    links = item.get('links') or []
    for link in links:
        href = link.get('href') if isinstance(link, dict) else link
        if href and is_audio_url(href):
            return href

    asset_url = item.get('href')
    if not asset_url:
        return None

    try:
        assets_response = requests.get(asset_url, timeout=12)
        assets_response.raise_for_status()
        assets = assets_response.json()
        if isinstance(assets, list):
            for asset in assets:
                if is_audio_url(asset):
                    return asset
    except Exception:
        return None

    return None


def normalize_description(text):
    if not text:
        return ''
    cleaned = ' '.join(str(text).split())
    return cleaned[:320]


@app.route('/audio-proxy')
def audio_proxy():
    url = request.args.get('url', '').strip()
    if not url or not url.startswith(('http://', 'https://')):
        return jsonify({'success': False, 'error': 'Некорректный URL аудио'}), 400

    headers = {}
    range_header = request.headers.get('Range')
    if range_header:
        headers['Range'] = range_header

    try:
        upstream = requests.get(url, headers=headers, stream=True, timeout=20)
        status_code = upstream.status_code
        if status_code >= 400:
            return jsonify({'success': False, 'error': f'Аудио недоступно ({status_code})'}), 502

        def generate():
            for chunk in upstream.iter_content(chunk_size=512 * 1024):
                if chunk:
                    yield chunk

        response = Response(stream_with_context(generate()), status=status_code)
        content_type = upstream.headers.get('Content-Type', 'audio/mpeg')
        response.headers['Content-Type'] = content_type
        if 'Content-Length' in upstream.headers:
            response.headers['Content-Length'] = upstream.headers['Content-Length']
        if 'Content-Range' in upstream.headers:
            response.headers['Content-Range'] = upstream.headers['Content-Range']
        response.headers['Accept-Ranges'] = upstream.headers.get('Accept-Ranges', 'bytes')
        return response
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 502


@app.route('/analyze', methods=['POST'])
def analyze_sound():
    if not model:
        return jsonify({
            'success': False,
            'error': f'AI не настроен. {GEMINI_INIT_ERROR or "Проверьте GEMINI_API_KEY и GEMINI_MODEL."}'
        }), 400

    try:
        data = request.get_json(silent=True) or {}
        cache_key = f"{data.get('sound_name')}_{data.get('sound_type')}_{data.get('audio_url')}"

        if cache_key in ai_cache:
            app.logger.info("Использую кеш для %s", cache_key)
            return jsonify({
                'success': True,
                'analysis': ai_cache[cache_key].get('analysis', ''),
                'structured': ai_cache[cache_key].get('structured')
            })

        transcript = None
        audio_url = data.get('audio_url')
        if audio_url and openai_client:
            try:
                transcript = transcribe_audio(audio_url)
            except Exception as exc:
                app.logger.warning("Транскрипция не удалась: %s", exc)

        prompt = build_prompt(data, transcript)
        try:
            response = model.generate_content(prompt)
        except Exception as exc:
            message = str(exc)
            hint = ''
            if '404' in message or 'not found' in message:
                hint = 'Проверьте GEMINI_MODEL. Рекомендуется models/gemini-1.5-flash.'
            return jsonify({
                'success': False,
                'error': f'Ошибка Gemini API: {message}. {hint}'.strip()
            }), 500

        if not response or not getattr(response, 'text', None):
            return jsonify({
                'success': False,
                'error': 'AI не вернул ответ'
            }), 500

        analysis_text = response.text.strip()
        structured = extract_json(analysis_text) or {}

        if transcript:
            structured['transcript'] = transcript
        elif not structured.get('transcript'):
            structured['transcript'] = 'Речь не обнаружена или транскрипция недоступна.'

        if not structured.get('explanation'):
            structured['explanation'] = analysis_text
        if not structured.get('disclaimer'):
            structured['disclaimer'] = 'Текст — интерпретация сонфикации, а не буквальная речь космоса.'

        ai_cache[cache_key] = {
            'analysis': analysis_text,
            'structured': structured
        }

        return jsonify({
            'success': True,
            'analysis': analysis_text,
            'structured': structured
        })

    except Exception as exc:
        app.logger.error("Ошибка анализа: %s", exc)
        return jsonify({
            'success': False,
            'error': str(exc)
        }), 500


@app.route('/nasa-audio-search')
def nasa_audio_search():
    query = request.args.get('q', '').strip()
    limit = min(int(request.args.get('limit', NASA_SEARCH_LIMIT)), 25)

    if not query:
        return jsonify([])

    cache_key = f"{query}:{limit}"
    if cache_key in search_cache:
        return jsonify(search_cache[cache_key])

    try:
        response = requests.get(
            'https://images-api.nasa.gov/search',
            params={'q': query, 'media_type': 'audio'},
            timeout=12
        )
        response.raise_for_status()
        payload = response.json()
        items = payload.get('collection', {}).get('items', [])

        results = []
        for item in items:
            if len(results) >= limit:
                break

            data = (item.get('data') or [{}])[0]
            nasa_id = data.get('nasa_id') or data.get('title')
            audio_url = resolve_audio_url(item)
            if not audio_url:
                continue

            result = {
                'nasa_id': nasa_id,
                'title': data.get('title') or 'NASA аудио',
                'description': normalize_description(data.get('description') or data.get('description_508')),
                'audio_url': audio_url,
                'source_url': f"https://images.nasa.gov/details/{nasa_id}" if nasa_id else None,
                'date_created': data.get('date_created'),
                'keywords': data.get('keywords') or [],
                'center': data.get('center')
            }
            results.append(result)

        search_cache[cache_key] = results
        return jsonify(results)
    except Exception as exc:
        return jsonify({
            'success': False,
            'error': str(exc)
        }), 500


@app.route('/nasa-data')
def get_nasa_data():
    if not NASA_API_KEY:
        return jsonify({
            'success': False,
            'error': 'Не настроен ключ NASA_API_KEY.'
        }), 400

    try:
        response = requests.get(
            'https://api.nasa.gov/planetary/apod',
            params={'api_key': NASA_API_KEY, 'count': 6},
            timeout=12
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as exc:
        return jsonify({
            'success': False,
            'error': str(exc)
        }), 500


@app.route('/health')
def health_check():
    return jsonify({
        'status': 'online',
        'nasa_api': 'configured' if NASA_API_KEY else 'missing',
        'gemini_api': 'configured' if GEMINI_API_KEY else 'missing',
        'gemini_model': SELECTED_GEMINI_MODEL or GEMINI_MODEL or '',
        'gemini_error': GEMINI_INIT_ERROR,
        'openai_api': 'configured' if openai_client else 'missing',
        'cache_size': len(ai_cache)
    })


if __name__ == '__main__':
    print("=" * 50)
    print("NASA AI сервер запускается...")
    print(f"NASA API ключ: {'настроен' if NASA_API_KEY else 'отсутствует'}")
    print(f"AI API ключ: {'настроен' if GEMINI_API_KEY else 'отсутствует'}")
    if SELECTED_GEMINI_MODEL:
        print(f"Gemini модель: {SELECTED_GEMINI_MODEL}")
    print(f"Transcribe API ключ: {'настроен' if OPENAI_API_KEY else 'отсутствует'}")
    print("=" * 50)
    print("Сайт доступен по адресу: http://localhost:5000")
    print("API эндпоинты:")
    print("  GET  /health            - Проверка работоспособности")
    print("  POST /analyze           - Анализ звука ИИ + транскрипция")
    print("  GET  /nasa-audio-search - Поиск аудио NASA")
    print("  GET  /audio-proxy       - Прокси аудио для воспроизведения")
    print("  GET  /nasa-data         - Данные NASA APOD")
    print("=" * 50)
    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('FLASK_DEBUG') == '1'
    app.run(debug=debug, port=port, host='0.0.0.0')
