import { useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import SectionTitle from "../../components/common/SectionTitle";
import { getPyodide } from "../../utils/pyodide";
import zipImagesScript from "../../scripts/zip_images.py?raw";

const MODEL_URL = "/pose_model/";

let model: any;
let webcam: any;
let ctx: any;
let labelContainer: any;
let maxPredictions: number;
let animFrameId: number;
let canvas: HTMLCanvasElement;
let latestPrediction: any;
let running = false;

async function init() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const size = 200;
  const flip = true;
  webcam = new tmPose.Webcam(size, size, flip);
  await webcam.setup();
  await webcam.play();

  const webcamContainer = document.getElementById("webcam-container")!;
  webcamContainer.innerHTML = "";

  canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.style.display = "block";
  ctx = canvas.getContext("2d")!;
  webcamContainer.appendChild(canvas);

  labelContainer = document.getElementById("label-container")!;
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  running = true;

  async function loop() {
    if (!running) return;
    webcam.update();
    await predict();
    animFrameId = requestAnimationFrame(loop);
  }

  animFrameId = requestAnimationFrame(loop);
}

async function predict() {
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);
  latestPrediction = prediction;

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  ctx.drawImage(webcam.canvas, 0, 0);
  if (pose) {
    const minPartConfidence = 0.5;
    tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
    tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
  }
}

function ClasificarPosturas() {
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [capturedImages, setCapturedImages] = useState<
    { data: string; label: string; id: number }[]
  >([]);
  const [downloading, setDownloading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    label: string;
  } | null>(null);

  async function handleStart() {
    try {
      setError("");
      running = false;
      if (webcam) {
        cancelAnimationFrame(animFrameId);
        try { webcam.stop(); } catch {}
      }
      await init();
      setStarted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleStop() {
    running = false;
    cancelAnimationFrame(animFrameId);
    if (webcam) {
      try { webcam.stop(); } catch {}
      const container = document.getElementById("webcam-container");
      if (container) container.innerHTML = "";
    }
    setStarted(false);
  }

  function handleCapture() {
    if (!webcam || !latestPrediction) return;

    const dataUrl = canvas.toDataURL("image/png");
    const base64Data = dataUrl.split(",")[1];

    let bestIdx = 0;
    let bestProb = 0;
    for (let i = 0; i < maxPredictions; i++) {
      if (latestPrediction[i].probability > bestProb) {
        bestProb = latestPrediction[i].probability;
        bestIdx = i;
      }
    }
    const label = latestPrediction[bestIdx].className;

    setCapturedImages((prev) => [
      ...prev,
      { data: base64Data, label, id: Date.now() },
    ]);
  }

  function handleDeleteImage(id: number) {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id));
  }

  function handleClearAll() {
    setCapturedImages([]);
  }

  function handleDownloadSingle(img: { data: string; label: string; id?: number }) {
    const binary = atob(img.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${img.label}_${img.id || Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadZip() {
    if (capturedImages.length === 0) return;
    setDownloading(true);

    try {
      const py = await getPyodide();
      py.globals.set("images_json", JSON.stringify(capturedImages));
      const result = await py.runPythonAsync(zipImagesScript);
      const parsed = JSON.parse(result);

      const binary = atob(parsed.zip);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = parsed.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al crear ZIP:", err);
    }

    setDownloading(false);
  }

  return (
    <section className="page">
      <div className="page-inner">
        <SectionTitle subtitle="Analiza y clasifica posturas corporales en tiempo real">
          Clasificar Posturas
        </SectionTitle>

        <div className="tm-container">
          <h3 className="tm-title">Teachable Machine Pose Model</h3>

          {error && <div className="tm-error">{error}</div>}

          {!started && (
            <button type="button" className="tm-btn" onClick={handleStart}>
              Prender Camara
            </button>
          )}

          {started && (
            <div className="tm-controls">
              <button
                type="button"
                className="tm-btn tm-btn-capture"
                onClick={handleCapture}
              >
                Capturar
              </button>
              <button
                type="button"
                className="tm-btn tm-btn-danger"
                onClick={handleStop}
              >
                Apagar Camara
              </button>
            </div>
          )}

          <div id="webcam-container" className="tm-webcam" />
          <div id="label-container" className="tm-labels" />
        </div>

        {capturedImages.length > 0 && (
          <div className="tm-gallery">
            <div className="tm-gallery-header">
              <h3 className="tm-title">
                Capturas ({capturedImages.length})
              </h3>
              <div className="tm-gallery-actions">
                <button
                  type="button"
                  className="tm-btn"
                  onClick={handleClearAll}
                >
                  Limpiar Todo
                </button>
                <button
                  type="button"
                  className="tm-btn tm-btn-success"
                  onClick={handleDownloadZip}
                  disabled={downloading}
                >
                  {downloading ? "Generando ZIP..." : "Descargar ZIP"}
                </button>
              </div>
            </div>

            <div className="tm-gallery-grid">
              {capturedImages.map((img) => (
                <div key={img.id} className="tm-gallery-item">
                  <img
                    src={`data:image/png;base64,${img.data}`}
                    alt={img.label}
                    className="tm-gallery-img"
                    onClick={() =>
                      setSelectedImage({ data: img.data, label: img.label })
                    }
                  />
                  <span className="tm-gallery-label">{img.label}</span>
                  <div className="tm-gallery-item-actions">
                    <button
                      type="button"
                      className="tm-btn-sm"
                      onClick={() => handleDownloadSingle(img)}
                    >
                      Descargar
                    </button>
                    <button
                      type="button"
                      className="tm-btn-sm tm-btn-sm-danger"
                      onClick={() => handleDeleteImage(img.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedImage && (
          <div
            className="tm-modal-overlay"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="tm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="tm-modal-close"
                onClick={() => setSelectedImage(null)}
              >
                X
              </button>
              <img
                src={`data:image/png;base64,${selectedImage.data}`}
                alt={selectedImage.label}
                className="tm-modal-img"
              />
              <p className="tm-modal-label">{selectedImage.label}</p>
              <button
                type="button"
                className="tm-btn tm-btn-success"
                onClick={() => handleDownloadSingle(selectedImage)}
              >
                Descargar Imagen
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ClasificarPosturas;
