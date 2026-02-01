import { useEffect, useRef } from "react";

function App() {
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);

  let lastPoint = null;
  let isProcessing = false;

  useEffect(() => {
    const video = videoRef.current;
    const videoCanvas = videoCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;

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

        // âœ‹ Index finger pointed condition
        const indexUp = indexTip.y < indexPIP.y;
        const othersDown =
          middleTip.y > indexPIP.y &&
          ringTip.y > indexPIP.y &&
          pinkyTip.y > indexPIP.y;

        if (indexUp && othersDown) {
          const x = (1 - indexTip.x) * drawCanvas.width;
          const y = indexTip.y * drawCanvas.height;

          dCtx.strokeStyle = "red";
          dCtx.lineWidth = 4;
          dCtx.lineCap = "round";

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

    // Camera loop (stable)
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
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Air Drawing (Index Finger Only)</h2>

      <button
        onClick={clearCanvas}
        style={{ marginBottom: "10px", padding: "6px 12px" }}
      >
        Clear Canvas
      </button>

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
        width="640"
        height="480"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* Drawing layer */}
      <canvas
        ref={drawCanvasRef}
        width="640"
        height="480"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default App;