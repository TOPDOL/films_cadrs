const startCameraBtn = document.getElementById('start-camera');
const takePhotoBtn = document.getElementById('take-photo');
const fileUpload = document.getElementById('file-upload');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const resultBox = document.getElementById('result-box');
const movieTitle = document.getElementById('movie-title');

// Включение камеры
startCameraBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.style.display = 'block';
        preview.style.display = 'none';
        startCameraBtn.style.display = 'none';
        takePhotoBtn.style.display = 'inline-block';
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
    // Останавливаем камеру, если она работала
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    video.style.display = 'none';
    takePhotoBtn.style.display = 'none';
    startCameraBtn.style.display = 'inline-block';
    
    preview.src = imageSrc;
    preview.style.display = 'block';
    
    resultBox.classList.remove('hidden');
    movieTitle.textContent = "Анализируем кадр...";
    movieTitle.style.color = "#a3a3a3";

    // Сюда нужно подключить реальный API (Teachable Machine, Google Vision и т.д.)
    analyzeImage(imageSrc);
}

// Функция-заглушка для ИИ
function analyzeImage(base64Image) {
    // Имитация задержки сети/обработки (2 секунды)
    setTimeout(() => {
        // В реальном проекте здесь будет ответ от нейросети.
        // Пока выводим случайный результат для теста.
        const mockMovies = ["Матрица (1999)", "Интерстеллар (2014)", "Бойцовский клуб (1999)"];
        const randomMovie = mockMovies[Math.floor(Math.random() * mockMovies.length)];
        
        movieTitle.textContent = randomMovie;
        movieTitle.style.color = "#00ff00";
    }, 2000);
}
