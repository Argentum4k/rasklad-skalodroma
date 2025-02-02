import React, {useEffect, useState} from 'react';
import {decodePoints, encodePoints, generateRandomPoints} from "../utils/utils.js";

const holdDelay = 200;
const PointDisplay = () => {
    const [width, setWidth] = useState(150); // начальная ширина в см
    const [height, setHeight] = useState(265); // начальная высота в см
    const [numberOfPoints, setNumberOfPoints] = useState(30);
    const [points, setPoints] = useState([]);
    const [showCoordinates, setShowCoordinates] = useState(false);
    const [tooltip, setTooltip] = useState({visible: false, x: 0, y: 0, coordinates: ''});
    const [zoom, setZoom] = useState(2.5);
    const [draggedPoint, setDraggedPoint] = useState(null);
    const [bgImg, setBgImg] = useState(null);
    const [ready, setReady] = useState(false);
    const [holdStarter, setHoldStarter] = useState(null);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('data')) {
            const encodedData = urlParams.get('data');
            const decodedPoints = decodePoints(encodedData);
            setPoints(decodedPoints);
            setNumberOfPoints(decodedPoints.length);
        }
        setReady(true);
        // setInterval(()=>{console.log(points,points[5])}, 3000);// пачму пустооо
    }, [])

    useEffect(() => {
        if (ready && !draggedPoint) saveToUrl();
    }, [points, points.length])


    const saveToUrl = () => {
        const encodedPoints = encodePoints(points);
        // const shareableUrl = `${window.location.origin}/?data=${encodedPoints}`; // попадает на корень гх а не на себя
        // history.pushState(null, '', shareableUrl);
        const url = new URL(window.location);
        url.searchParams.set('data', encodedPoints);
        window.history.pushState({}, '', url);
    }

    const handleGenerateClick = () => {
        const calculatedPoints = Math.ceil((width * height) / 10000 * 7); // 7 точек на квадратный метр
        setNumberOfPoints(calculatedPoints);
        const newPoints = generateRandomPoints(width, height, numberOfPoints);
        setPoints(newPoints);
    };

    const handleDragStart = (index) => {
        setDraggedPoint(index);
        console.log(index, points[index]);
        setHoldStarter(setTimeout(function () {
            setHoldStarter(null);
        }, holdDelay))
    };

    const handleDragEnd = () => {
        setDraggedPoint(null)
        if (holdStarter) {
            clearTimeout(holdStarter);
            // run click-only operation here
        }
    };

    const handleDrag = (e) => {
        if (draggedPoint !== null) {
            const rect = e.target.getBoundingClientRect();
            const x =((e.clientX - rect.left) / zoom);
            const y = ((e.clientY - rect.top) / zoom);

            // Ensure the point stays within the bounds of the rectangle
            const boundedX = Math.max(5, Math.min(x, width - 5));
            const boundedY = Math.max(5, Math.min(y, height - 5));

            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                const oldPoint = updatedPoints[draggedPoint];
                updatedPoints[draggedPoint] = {
                    ...oldPoint,
                    x: boundedX,
                    y: boundedY,
                };
                return updatedPoints;
            });
        }
    };

    function resizePoint(point) {
        if (holdStarter) {
            point.size = (point.size + 1) % 3;
            saveToUrl();
        }
    }

    function recolorPoint(e, point) {
        e.preventDefault();
        if(point.color) point.color = (point.color + 1) % 3;
        else point.color = 1;
        saveToUrl();
    }

    function onAddPoint() {
        setPoints((prevPoints) => prevPoints.concat(generateRandomPoints(width, height, 1)));
        setNumberOfPoints(numberOfPoints + 1);
    }

    function onRemovePoint() {
        setPoints((prevPoints) => prevPoints.slice(0, -1));
        setNumberOfPoints(numberOfPoints - 1);
    }

    return (
        <>
            <h1 className="text-3xl font-bold underline mb-8">Генерация точек на поверхности скалодрома</h1>
            <div className="sm:flex justify-center gap-8 space-y-4">
                <div className="flex flex-col gap-4 items-start">
                    <label htmlFor={'width'}>
                        Ширина (см):
                    </label>
                    <input id={'width'} type="number" value={width} className="border"
                           onChange={(e) => setWidth(e.target.value)}/>
                    <label htmlFor={'height'}>
                        Высота (см):
                    </label>
                    <input id={'height'} type="number" value={height} className="border"
                           onChange={(e) => setHeight(e.target.value)}/>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleGenerateClick}>Сгенерировать точки
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setShowCoordinates(!showCoordinates)}>
                        {showCoordinates ? 'Скрыть координаты' : 'Показать координаты'}</button>
                    <p>Количество точек: {points.length}</p>
                    <div className="space-x-1">
                        <button onClick={onAddPoint}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Добавить
                        </button>
                        <button onClick={onRemovePoint}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Убрать
                        </button>
                    </div>
                    <p></p>
                    <div className="flex gap-2 items-center">
                        <span>зум:</span>
                        <button className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-4 rounded"
                                onClick={() => setZoom(zoom - 0.1)}>-
                        </button>
                        {zoom.toFixed(1)}
                        <button className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-4 rounded"
                                onClick={() => setZoom(zoom + 0.1)}>+
                        </button>
                    </div>
                    <span>добавить фон:</span>
                    <input type={'file'} onChange={(e) => setBgImg(e.target.files[0])}/>

                </div>
                <div className="скалодром"
                     style={{
                         // transform: `scale(${zoom})`,
                         // transformOrigin: '0 0',
                         position: 'relative',
                         width: `${width * zoom}px`,
                         height: `${height * zoom}px`,
                         border: '2px solid black',
                         backgroundSize: 'cover',
                         backgroundImage: bgImg ? `url(${URL.createObjectURL(bgImg)})` : 'none',
                         // zoom: zoom,
                     }}
                     onMouseMove={handleDrag}
                     onMouseUp={handleDragEnd}
                     onMouseLeave={handleDragEnd}
                >
                    {points.map((point, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                left: point.x * zoom,
                                top: point.y * zoom,
                                width: (point.size * 3 + 6) * zoom + 'px',
                                height: (point.size * 3 + 6) * zoom + 'px',
                                backgroundColor: point.color? ['red', 'orange', 'green'][point.color] : 'red',
                                // backgroundColor: point.size === 0 ? 'red' : point.size === 1 ? 'orange' : 'green',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                translate: '-50% -50%',
                            }}
                            onMouseEnter={() => setTooltip({
                                visible: true,
                                x: point.x * zoom,
                                y: point.y * zoom,
                                coordinates: {
                                    left: point.x.toFixed(1),
                                    top: point.y.toFixed(1),
                                    right: (width - point.x).toFixed(1),
                                    bottom: (height - point.y).toFixed(1)
                                }

                            })}
                            onMouseLeave={() => setTooltip({...tooltip, visible: false})}
                            onMouseDown={() => handleDragStart(index)}
                            onClick={() => resizePoint(point)}
                            onContextMenu={(e) => {recolorPoint(e, point)}}
                            // title={` X=${point.offsetX} см, Y=${point.offsetY} см`}
                        >
                            {showCoordinates && (
                                <div style={{
                                    position: 'absolute',
                                    left: '5px',
                                    top: '-20px',
                                    fontSize: '12px',
                                    color: 'black',
                                    backgroundColor: 'white',
                                    padding: '2px',
                                    border: '1px solid gray',
                                    borderRadius: '3px',
                                    whiteSpace: 'nowrap',
                                }}>
                                    X: {point.x.toFixed(2)} см, Y: {point.y.toFixed(2)} см
                                </div>
                            )}
                        </div>
                    ))}
                    {tooltip.visible && (
                        <div style={{
                            position: 'absolute',
                            left: tooltip.x + 10,
                            top: tooltip.y - 30,
                            backgroundColor: 'white',
                            border: '1px solid gray',
                            padding: '5px',
                            borderRadius: '3px',
                            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
                            pointerEvents: 'none',
                            fontSize: '12px',
                            textAlign: 'left'
                        }}>
                            <p>top: {tooltip.coordinates.top} см</p>
                            <p>left: {tooltip.coordinates.left} см</p>
                            <p>bottom: {tooltip.coordinates.bottom} см</p>
                            <p>right: {tooltip.coordinates.right} см</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PointDisplay;
