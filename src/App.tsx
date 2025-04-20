// Install dependencies (tensorflowjs, tensorflow-models, react-webcam) DONE
// setup webcam and canvas DONE
// load handpose model DONE
// detect hand DONE
// draw hand (points, lines) DONE
import { useEffect, useRef } from "react";
import "./App.css";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import { MESH_ANNOTATIONS } from "@tensorflow-models/handpose/dist/keypoints";
import * as tf from "@tensorflow/tfjs";

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadHandPose = async () => {
    // Ensure TensorFlow.js backend is ready
    await tf.setBackend("webgl"); // or 'cpu', 'wasm'
    await tf.ready();

    console.log("Loading Handpose Model");
    const handposeModel = await handpose.load();
    console.log("Model Loaded");
    setInterval(() => {
      detect(handposeModel);
    }, 10);
  };
  const detect = async (model: handpose.HandPose) => {
    const video = webcamRef.current?.video;
    const videoWidth = video?.videoWidth || 0;
    const videoHeight = video?.videoHeight || 0;
    // Set video width
    if (video) {
      video.width = videoWidth;
      video.height = videoHeight;
    }

    // Set canvas height and width
    if (canvasRef.current) {
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (video && ctx) {
      const hands = await model.estimateHands(video);
      console.log("hands:", hands);
      if (hands.length > 0) {
        const landmarks = hands[0].landmarks;
        // for (let i = 0; i < landmarks.length; i++) {
        //   const fingerPoints = landmarks[i];
        //   const x = fingerPoints[0];
        //   const y = fingerPoints[1];

        //   ctx.beginPath();
        //   ctx.arc(x, y, 5, 0, Math.PI * 2);
        //   ctx.fill();
        // }
        const fingers = Object.keys(MESH_ANNOTATIONS);
        console.log("fingers:", fingers, landmarks);
        const palmBase = fingers.pop() || "palmBase";
        const palmIndex = MESH_ANNOTATIONS[palmBase][0];
        const palmPoint = landmarks[palmIndex];
        for (let finger of fingers) {
          ctx.beginPath();
          ctx.moveTo(palmPoint[0], palmPoint[1]);
          const fingerPoints = MESH_ANNOTATIONS[finger];
          for (let i = 0; i < fingerPoints.length; i++) {
            const index = fingerPoints[i];
            const point = landmarks[index];
            const x = point[0];
            const y = point[1];
            ctx.strokeStyle = "rgb(1, 1, 192)";
            ctx.lineTo(x, y);
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
      }
    }
  };
  useEffect(() => {
    loadHandPose();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            width: "640px",
            height: "480px",
            position: "absolute",
            zIndex: "5",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            width: "640px",
            height: "480px",
            zIndex: "5",
          }}
        />
      </header>
    </div>
  );
}

export default App;
