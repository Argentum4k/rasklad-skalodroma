

export const generateRandomPoints = (width, height, numberOfPoints) => {
    const points = [];
    const cols = Math.ceil(Math.sqrt(numberOfPoints)); // Количество столбцов
    const rows = Math.ceil(numberOfPoints / cols); // Количество строк
    const squareWidth = width / cols; // Ширина квадрата
    const squareHeight = height / rows; // Высота квадрата

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const centerX = col * squareWidth + squareWidth / 2;
            const centerY = row * squareHeight + squareHeight / 2;

            // Генерация случайных смещений в пределах квадрата
            const offsetX = (Math.random() * squareWidth) - (squareWidth / 2);
            const offsetY = (Math.random() * squareHeight) - (squareHeight / 2);

            const pointX = centerX + offsetX;
            const pointY = centerY + offsetY;

            // Проверка выхода за пределы
            if (pointX >= 3 && pointX <= width-3 && pointY >= 3 && pointY <= height-3) {
                points.push({
                    x: pointX,
                    y: pointY,
                    // offsetX: offsetX.toFixed(2),
                    // offsetY: offsetY.toFixed(2),
                    size: 0,
                    color: 0,
                });

                // Проверка на количество точек, чтобы не превышать его
                if (points.length >= numberOfPoints) {
                    return points;
                }
            } else {
                col --;
            }
        }
    }

    return points;
};
// Функция для кодирования точек в строку
export const encodePoints = (points) => {
    return btoa(JSON.stringify(points)); // Используем Base64 для кодирования
};

// Функция для декодирования точек из строки
export const decodePoints = (encoded) => {
    const json = atob(encoded); // Декодируем Base64
    return JSON.parse(json); // Парсим строку в объект
};