import { useEffect, useRef, useState } from "react";
import { Trash2, Check, ArrowRight, RefreshCw } from "lucide-react";
import Tesseract from "tesseract.js";

const WORDS_TO_LEARN = ["A", "B", "C", "D", "E", "CAT", "DOG", "SUN"];

function Learn() {
    const videoRef = useRef(null);
    const videoCanvasRef = useRef(null);
    const drawCanvasRef = useRef(null);
    const [targetWord, setTargetWord] = useState(WORDS_TO_LEARN[0]);
    const [feedback, setFeedback] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);

    let lastPoint = null;
    let isProcessing = false;

    useEffect(() => {
        const video = videoRef.current;
        const videoCanvas = videoCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;

        if (!video || !videoCanvas || !drawCanvas) return;

        const vCtx = videoCanvas.getContext("2d");
        const dCtx = drawCanvas.getContext("2d");

        const hands = new window.Hands({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        hands.onResults((results) => {
            // Always draw live video
            vCtx.save();
            vCtx.scale(-1, 1);
            vCtx.drawImage(
                video,
                -videoCanvas.width,
                0,
                videoCanvas.width,
                videoCanvas.height
            );
            vCtx.restore();

            if (results.multiHandLandmarks?.length) {
                const lm = results.multiHandLandmarks[0];

                // Landmarks
                const indexTip = lm[8];
                const indexPIP = lm[6];

                const middleTip = lm[12];
                const ringTip = lm[16];
                const pinkyTip = lm[20];

                // 👆 Index finger pointed condition
                const indexUp = indexTip.y < indexPIP.y;
                const middleUp = middleTip.y < lm[10].y;

                // Other fingers down
                const othersDown =
                    ringTip.y > lm[14].y &&
                    pinkyTip.y > lm[18].y;

                // Draw: Index UP, Middle DOWN, Others DOWN
                const isDrawing = indexUp && !middleUp && othersDown;

                // Erase: Index UP, Middle UP, Others DOWN
                const isErasing = indexUp && middleUp && othersDown;

                if (isDrawing || isErasing) {
                    const x = (1 - indexTip.x) * drawCanvas.width;
                    const y = indexTip.y * drawCanvas.height;

                    if (isErasing) {
                        dCtx.globalCompositeOperation = "destination-out";
                        dCtx.lineWidth = 30; // Thicker for eraser
                        dCtx.lineCap = "round";
                    } else {
                        dCtx.globalCompositeOperation = "source-over";
                        dCtx.strokeStyle = "#3b82f6";
                        dCtx.lineWidth = 12; // Thicker line for better OCR
                        dCtx.lineCap = "round";
                    }

                    if (lastPoint) {
                        dCtx.beginPath();
                        dCtx.moveTo(lastPoint.x, lastPoint.y);
                        dCtx.lineTo(x, y);
                        dCtx.stroke();
                    }

                    lastPoint = { x, y };
                } else {
                    lastPoint = null;
                }
            } else {
                lastPoint = null;
            }
        });

        // Camera loop
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            video.srcObject = stream;
            video.play();

            const processFrame = async () => {
                if (!isProcessing && video.readyState === 4) {
                    isProcessing = true;
                    await hands.send({ image: video });
                    isProcessing = false;
                }
                requestAnimationFrame(processFrame);
            };

            processFrame();
        });
    }, []);

    const clearCanvas = () => {
        const canvas = drawCanvasRef.current;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        setFeedback("");
    };

    const nextWord = () => {
        const nextIndex = (wordIndex + 1) % WORDS_TO_LEARN.length;
        setWordIndex(nextIndex);
        setTargetWord(WORDS_TO_LEARN[nextIndex]);
        clearCanvas();
    };

    const checkAccuracy = async () => {
        setIsChecking(true);
        setFeedback("Analyzing...");

        const canvas = drawCanvasRef.current;

        try {
            // Need to process the image a bit for better OCR
            // Create a temporary canvas with white background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');

            // Fill white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw the transparent drawing canvas on top
            ctx.drawImage(canvas, 0, 0);

            const { data: { text } } = await Tesseract.recognize(
                tempCanvas,
                'eng',
                { logger: m => console.log(m) }
            );

            const recognizedText = text.trim().toUpperCase().replace(/[^A-Z]/g, '');
            console.log("Recognized:", recognizedText);

            if (recognizedText.includes(targetWord) || recognizedText === targetWord) {
                setFeedback("Correct! Great job! 🎉");
            } else {
                setFeedback(`Try again! Detected: "${recognizedText || '?'}"`);
            }
        } catch (error) {
            console.error(error);
            setFeedback("Error analyzing. Try again.");
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2 className="text-2xl font-bold" style={{ marginBottom: "1rem" }}>
                Learn to Write
            </h2>

            <div style={{ marginBottom: "2rem" }}>
                <p className="text-secondary" style={{ marginBottom: "0.5rem" }}>Draw this:</p>
                <div style={{
                    fontSize: "4rem",
                    fontWeight: "bold",
                    color: "var(--accent)",
                    letterSpacing: "0.5rem"
                }}>
                    {targetWord}
                </div>
                <p className="text-secondary" style={{ minHeight: "1.5rem", color: feedback.includes("Correct") ? "#10b981" : "inherit" }}>
                    {feedback}
                </p>
            </div>

            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
                <button onClick={clearCanvas} className="btn btn-outline" disabled={isChecking}>
                    <Trash2 size={18} /> Clear
                </button>
                <button onClick={checkAccuracy} className="btn btn-primary" disabled={isChecking}>
                    {isChecking ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />} Check
                </button>
                <button onClick={nextWord} className="btn btn-outline" disabled={isChecking}>
                    Next <ArrowRight size={18} />
                </button>
            </div>

            <div className="drawing-container">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ display: "none" }}
                />

                {/* Video layer */}
                <canvas
                    ref={videoCanvasRef}
                    width="800"
                    height="600"
                />

                {/* Drawing layer */}
                <canvas
                    ref={drawCanvasRef}
                    width="800"
                    height="600"
                    style={{ pointerEvents: "none" }}
                />
            </div>
        </div>
    );
}

export default Learn;
