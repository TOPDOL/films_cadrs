// === СЮДА ВСТАВЬ ССЫЛКУ ИЗ TEACHABLE MACHINE ===
const URL = "https://teachablemachine.withgoogle.com/models/ТВОЯ_ССЫЛКА/";
// ===============================================

let model, maxPredictions;

const startCameraBtn = document.getElementById('start-camera');
const takePhotoBtn = document.getElementById('take-photo');
const fileUpload = document.getElementById('file-upload');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const resultBox = document.getElementById('result-box');
const movieTitle = document.getElementById('movie-title');

// Загружаем нейросеть при открытии страницы
async function init() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Нейросеть успешно загружена!");
    } catch (e) {
        console.error("Ошибка загрузки модели. Проверь ссылку!", e);
        movieTitle.textContent = "Ошибка загрузки ИИ ❌";
    }
}
init();

// Включение камеры
startCameraBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.classList.remove('hidden');
        preview.classList.add('hidden');
        startCameraBtn.classList.add('hidden');
        takePhotoBtn.classList.remove('hidden');
    } catch (err) {
        alert('Ошибка доступа к камере: ' + err.message);
    }
});

// Создание фото
takePhotoBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    showPreviewAndAnalyze(imageDataUrl);
});

// Загрузка скриншота из файлов
fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showPreviewAndAnalyze(e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Показ картинки и запуск анализа
function showPreviewAndAnalyze(imageSrc) {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    video.classList.add('hidden');
    takePhotoBtn.classList.add('hidden');
    startCameraBtn.classList.remove('hidden');
    
    preview.src = imageSrc;
    preview.classList.remove('hidden');
    resultBox.classList.remove('hidden');
    
    movieTitle.textContent = "Анализируем кадр ⏳...";
    movieTitle.style.color = "#a0a0a0";

    // Ждем, пока картинка прогрузится в тег img, затем отдаем ИИ
    preview.onload = () => {
        predictImage();
    }
}

// Настоящий анализ через ИИ
async function predictImage() {
    if (!model) {
        movieTitle.textContent = "Модель еще не загрузилась!";
        return;
    }

    // ИИ делает предсказание
    const prediction = await model.predict(preview);
    
    // Сортируем результаты от самого вероятного к наименее вероятному
    prediction.sort((a, b) => b.probability - a.probability);
    
    const bestMatch = prediction[0]; // Берем лучший результат
    const confidence = Math.round(bestMatch.probability * 100); // Переводим в проценты

    // Если ИИ уверен больше чем на 60%
    if (confidence > 60) {
        movieTitle.textContent = `${bestMatch.className} (${confidence}%)`;
        movieTitle.style.color = "#64b5f6";
    } else {
        movieTitle.textContent = "Не могу узнать фильм 🤔";
        movieTitle.style.color = "#ff5252"; // Красный цвет ошибки
    }
}
