"use client";

import { useEffect, useRef, useState } from "react";


export const vowels = ["అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ౠ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ", "అం", "అః"];

export const consonants = [
  "క", "ఖ", "గ", "ఘ", "ఙ",
  "చ", "ఛ", "జ", "ఝ", "ఞ",
  "ట", "ఠ", "డ", "ఢ", "ణ",
  "త", "థ", "ద", "ధ", "న",
  "ప", "ఫ", "బ", "భ", "మ",
  "య", "ర", "ల", "వ",
  "శ", "ష", "స", "హ",
  "ళ", "క్ష", "ఱ",
];

// 🎨 colors
const palette = ["#000000", "#d63054", "#2563eb", "#16a34a", "#f59e0b", "#a855f7"];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [category, setCategory] = useState<"vowels" | "consonants">("vowels");
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(20);

  const letters = category === "vowels" ? vowels : consonants;
  const letter = letters[index];

  // 🔊 speak Telugu letter
  const speakLetter = (text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return; // Check if speech synthesis is available
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "te-IN";
    synth.cancel();
    synth.speak(utterance);
  };

  // 📏 Canvas fills entire screen like Telugu101
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Canvas fills entire screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawBackground();
  };

  // 📝 Draw MASSIVE letter that fills ENTIRE SCREEN
  const drawBackground = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Clear canvas - transparent so gradient background shows
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate initial font size based on the smaller dimension of the screen
    const smallerDimension = Math.min(canvas.width, canvas.height);
    let fontSize = smallerDimension * 0.6; // Start with 60% of the smaller dimension

    // Set font properties for accurate measurement and rendering
    ctx.font = `bold ${fontSize}px "Noto Sans Telugu", "Noto Sans", Arial, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Measure the text to get its actual width and height
    const metrics = ctx.measureText(letter);
    const letterWidth = metrics.width;
    const letterHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent; // More accurate height

    // Calculate the scaling factor to fit the letter within a target area,
    // ensuring a margin and keeping it proportional.
    const targetWidth = canvas.width * 0.7; // Aim to fill 80% of the screen width
    const targetHeight = canvas.height * 0.6; // Aim to fill 80% of the screen height

    const scaleX = targetWidth / letterWidth;
    const scaleY = targetHeight / letterHeight;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to fit both dimensions

    fontSize = fontSize * scale;

    // Apply the final, scaled font size
    ctx.font = `bold ${fontSize}px "Noto Sans Telugu", "Noto Sans", Arial, serif`;

    // Draw MASSIVE dotted letter outline
    ctx.setLineDash([Math.max(2, fontSize * 0.02), Math.max(1, fontSize * 0.01)]); // Scale dashes with font size
    ctx.strokeStyle = "rgba(60,60,60,0.6)";
    // Adjust lineWidth to be relative to the scaled font size for better visual consistency
    ctx.lineWidth = Math.max(2, fontSize * 0.01); // Scale with font size

    ctx.strokeText(letter, canvas.width / 2, canvas.height / 2);
    ctx.setLineDash([]); // Reset line dash
  };

  // ⚡ initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // redraw when letter changes
  useEffect(() => {
    drawBackground(); // Changed from resizeCanvas to directly drawBackground
  }, [index, category, letter , drawBackground]); // Depend on 'letter' as well

  // Update line width when the state changes
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [lineWidth]);

  // 🎨 drawing handlers
  const getXY = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      // offsetX/offsetY can be unreliable if element has CSS transforms or margins.
      // Calculating from clientX/clientY is more robust.
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    speakLetter(letter);
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getXY(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color; // Set stroke style when starting
    ctx.lineWidth = lineWidth; // Set line width when starting
  };

  const endDrawing = () => {
    setDrawing(false);
    // No need to beginPath here, it's done on startDrawing or when clearing.
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getXY(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    // To create a continuous stroke, we don't call beginPath() and moveTo() here.
    // Instead, we move the "pen" to the new position for the next line segment.
    ctx.beginPath(); // Start a new path segment to avoid connecting unrelated strokes
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => drawBackground();
  const nextLetter = () => setIndex((i) => (i + 1) % letters.length);
  const prevLetter = () => setIndex((i) => (i - 1 + letters.length) % letters.length);
  const switchCategory = (c: "vowels" | "consonants") => {
    setCategory(c);
    setIndex(0); // Reset index to the first letter of the new category
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-blue-50 to-green-50 overflow-hidden">
      {/* Fullscreen Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
      />

      {/* Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex flex-col items-center gap-4">
          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold text-blue-900 text-center drop-shadow-lg">
            తెలుగు అక్షరాలు ✏️
          </h1>

          {/* Category Tabs */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => switchCategory("vowels")}
              className={`px-4 py-2 rounded-xl text-base font-bold ${
                category === "vowels"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur text-gray-700 border-2 border-gray-300"
              }`}
            >
              అచ్చులు ({vowels.length})
            </button>
            <button
              onClick={() => switchCategory("consonants")}
              className={`px-4 py-2 rounded-xl text-base font-bold ${
                category === "consonants"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur text-gray-700 border-2 border-gray-300"
              }`}
            >
              హల్లులు ({consonants.length})
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex flex-col items-center gap-3">
          {/* Navigation */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={prevLetter}
              className="px-4 py-3 bg-orange-500 text-white rounded-xl text-lg font-bold shadow-lg"
            >
              ⬅️
            </button>
            <button
              onClick={clearCanvas}
              className="px-4 py-3 bg-red-500 text-white rounded-xl text-lg font-bold shadow-lg"
            >
              🧹
            </button>
            <button
              onClick={nextLetter}
              className="px-4 py-3 bg-orange-500 text-white rounded-xl text-lg font-bold shadow-lg"
            >
              ➡️
            </button>
          </div>

          {/* Colors */}
          <div className="flex gap-2 items-center bg-white/80 backdrop-blur rounded-xl p-2">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 shadow-md"
                style={{ backgroundColor: c, borderColor: c === color ? "#000" : "#fff" }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-lg"
            />
          </div>

          {/* Pen Size */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-xl p-2">
            <span className="text-sm font-bold text-blue-800">Pen:</span>
            <input
              type="range"
              min={10}
              max={50}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm font-bold text-blue-700">{lineWidth}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}