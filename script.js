// === СЮДА ВСТАВЬ ССЫЛКУ ИЗ TEACHABLE MACHINE ===
const URL = "https://teachablemachine.withgoogle.com/models/DMv955vy_/";
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

// Элементы формы обратной связи
const feedbackSection = document.getElementById('feedback-section');
const correctMovieInput = document.getElementById('correct-movie');
const submitFeedbackBtn = document.getElementById('submit-feedback');
const feedbackMessage = document.getElementById('feedback-message');

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

takePhotoBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    showPreviewAndAnalyze(imageDataUrl);
});

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
    
    // Прячем форму обратной связи на время загрузки
    feedbackSection.classList.add('hidden');
    
    movieTitle.textContent = "Анализируем кадр ⏳...";
    movieTitle.style.color = "#a0a0a0";

    preview.onload = () => {
        predictImage();
    }
}

async function predictImage() {
    if (!model) {
        movieTitle.textContent = "Модель еще не загрузилась!";
        return;
    }

    const prediction = await model.predict(preview);
    prediction.sort((a, b) => b.probability - a.probability);
    
    const bestMatch = prediction[0];
    const confidence = Math.round(bestMatch.probability * 100);

    if (confidence > 60) {
        movieTitle.textContent = `${bestMatch.className} (${confidence}%)`;
        movieTitle.style.color = "#00e676";
    } else {
        movieTitle.textContent = "Не могу узнать фильм 🤔";
        movieTitle.style.color = "#ff416c";
    }

    // Показываем блок обратной связи после того, как ИИ выдал ответ
    feedbackSection.classList.remove('hidden');
    
    // Сбрасываем форму (если пользователь загружает уже вторую картинку)
    correctMovieInput.style.display = 'block';
    submitFeedbackBtn.style.display = 'inline-block';
    feedbackMessage.style.display = 'none';
    correctMovieInput.value = '';
}

// Обработка кнопки "Отправить правильный ответ"
submitFeedbackBtn.addEventListener('click', () => {
    const userMovie = correctMovieInput.value.trim();
    if (userMovie !== "") {
        // Имитируем отправку данных на сервер
        correctMovieInput.style.display = 'none';
        submitFeedbackBtn.style.display = 'none';
        
        feedbackMessage.textContent = `Спасибо! Кадр из фильма "${userMovie}" отправлен на анализ для дообучения нейросети. 🚀`;
        feedbackMessage.style.display = 'block';
    } else {
        alert("Пожалуйста, напиши название фильма перед отправкой.");
    }
});
