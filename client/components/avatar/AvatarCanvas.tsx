import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Play,
  Pause,
  BookOpen,
  BarChart3,
  Cloud,
  Database,
  Network,
  ShieldCheck,
  FileText,
  Layers,
} from "lucide-react";

/**
 * Real-time, fully client-side 3D talking-avatar with rich futuristic UI backdrop -
 * matches the precise visual aesthetics of the AI Learning hub (concentric halo rings,
 * glowing stage platform, current topic badge, topic mastery badge, and dynamic
 * web-scraped keyword pills).
 *
 * Background is completely transparent in WebGL so Three.js head sits directly
 * on top of the futuristic stage.
 */
export default function AvatarCanvas({
  audioUrl: propAudioUrl,
  autoPlay = false,
  onPlayClick,
  onEnded,
  currentTopic = "Cloud Computing",
  exploredPercentage = 68,
  masteryPercentage = 82,
  keywords = [
    { title: "SaaS", subtitle: "Cloud Services" },
    { title: "Virtualization", subtitle: "Core Technology" },
    { title: "Networking", subtitle: "Internet Architecture" },
    { title: "Security", subtitle: "Data Leakage & Privacy" },
  ],
}: {
  audioUrl?: string;
  autoPlay?: boolean;
  onPlayClick?: () => void;
  onEnded?: () => void;
  currentTopic?: string;
  exploredPercentage?: number;
  masteryPercentage?: number;
  keywords?: Array<{ title: string; subtitle: string }>;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Mesh with a mouth/jaw morph target, and that target's index.
  const faceMeshRef = useRef<THREE.Mesh | null>(null);
  const mouthIndexRef = useRef<number | null>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const hasAutoPlayedRef = useRef(false);

  // Plays `url` through AudioContext -> AnalyserNode -> speakers.
  const playAudio = async (url: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (!audioCtxRef.current) {
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.fftSize);
      }

      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";

      const source = audioCtxRef.current.createMediaElementSource(audio);
      source.connect(analyserRef.current!);
      analyserRef.current!.connect(audioCtxRef.current.destination);

      audio.onended = () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
      };

      audioRef.current = audio;
      setCurrentUrl(url);

      await audioCtxRef.current.resume();
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("[AvatarCanvas] Audio play failed:", err);
      setIsPlaying(false);
    }
  };

  // Prepares audio URL without auto-playing unless autoPlay prop is explicitly true
  useEffect(() => {
    if (propAudioUrl) {
      setCurrentUrl(propAudioUrl);
      if (autoPlay && !hasAutoPlayedRef.current) {
        hasAutoPlayedRef.current = true;
        playAudio(propAudioUrl);
      }
    }
  }, [propAudioUrl, autoPlay]);

  // Three.js setup - scene, camera, renderer, lights, model, render loop.
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background so the HTML backdrop & stage show through cleanly

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current!.clientWidth / mountRef.current!.clientHeight,
      0.1,
      5,
    );
    camera.position.set(0, 0.3, 1.3);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current!.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(0, 2, 2);
    scene.add(dirLight);

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load("/avatar/face9.glb", (gltf) => {
      if (disposed) return;
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y += 0.3;

      model.traverse((obj: any) => {
        if (obj.isMesh && obj.morphTargetDictionary) {
          const candidates = [
            "mouthOpen",
            "JawOpen",
            "viseme_aa",
            "viseme_O",
            "MouthOpen",
            "mouth_open",
          ];
          const foundTarget = candidates.find((key) => obj.morphTargetDictionary[key] !== undefined);
          if (foundTarget) {
            faceMeshRef.current = obj;
            mouthIndexRef.current = obj.morphTargetDictionary[foundTarget];
            obj.frustumCulled = false;
          }
        }
      });

      scene.add(model);
      setModelReady(true);
    });

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (
        faceMeshRef.current &&
        mouthIndexRef.current !== null &&
        analyserRef.current &&
        dataArrayRef.current
      ) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current as any);

        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const v = (dataArrayRef.current[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);
        const lipValue = Math.min(Math.max(rms * 10, 0), 1);

        faceMeshRef.current.morphTargetInfluences![mouthIndexRef.current] = lipValue;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      rendererRef.current.setSize(clientWidth, clientHeight);
      cameraRef.current.aspect = clientWidth / clientHeight;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      audioCtxRef.current?.close();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    const targetUrl = propAudioUrl || currentUrl;
    if (audioRef.current && currentUrl === targetUrl) {
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    if (targetUrl) {
      await playAudio(targetUrl);
      return;
    }
    if (onPlayClick) {
      onPlayClick();
    }
  };

  const activeKeywords = keywords && keywords.length >= 4 ? keywords : [
    { title: "SaaS", subtitle: "Cloud Services" },
    { title: "Virtualization", subtitle: "Core Technology" },
    { title: "Networking", subtitle: "Internet Architecture" },
    { title: "Security", subtitle: "Data Leakage & Privacy" },
  ];

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-3xl overflow-hidden shadow-xl border border-indigo-100/80 bg-gradient-to-tr from-[#EFF4FF] via-[#F4F0FF] to-[#EDF2FE] group select-none">
      {/* 1. Curved Ambient Wave Backdrop & Concentric Halo Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sweeping soft gradient ribbons */}
        <div className="absolute -top-32 -left-20 w-[140%] h-[380px] bg-gradient-to-r from-blue-200/40 via-purple-200/30 to-indigo-200/40 blur-3xl transform -rotate-6 rounded-[100%]" />
        <div className="absolute -bottom-32 -right-20 w-[140%] h-[380px] bg-gradient-to-l from-indigo-200/40 via-cyan-200/30 to-blue-200/40 blur-3xl transform rotate-6 rounded-[100%]" />

        {/* Halo Rings & Glow behind Avatar Head */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-full bg-cyan-300/25 blur-3xl animate-pulse" />
          <div className="absolute w-[440px] sm:w-[500px] h-[440px] sm:h-[500px] rounded-full border border-cyan-400/25 shadow-[0_0_50px_rgba(56,189,248,0.15)]" />
          <div className="absolute w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] rounded-full border border-indigo-400/20" />
        </div>

        {/* Stage / Pedestal reflection platform */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[680px] h-[100px]">
          <div className="w-full h-full rounded-[100%] bg-gradient-to-t from-cyan-400/20 via-blue-400/10 to-transparent border-t border-cyan-300/70 shadow-[0_-8px_25px_rgba(6,182,212,0.25)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#22d3ee]" />
        </div>

        {/* Ambient floating document icons */}
        <div className="absolute top-14 left-[38%] w-8 h-10 rounded-lg bg-white/40 border border-white/60 backdrop-blur-sm shadow-sm rotate-12 flex items-center justify-center opacity-60">
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        <div className="absolute bottom-24 right-[30%] w-9 h-11 rounded-lg bg-white/40 border border-white/60 backdrop-blur-sm shadow-sm -rotate-6 flex items-center justify-center opacity-60">
          <Layers className="w-4 h-4 text-indigo-400" />
        </div>
      </div>

      {/* 2. Top-Left Badge: Current Topic */}
      <div className="absolute top-4 left-4 z-20 max-w-[220px] sm:max-w-[260px] bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl p-3 transition-transform hover:scale-[1.02]">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] font-extrabold tracking-wider uppercase text-indigo-400">CURRENT TOPIC</span>
            <h4 className="text-xs font-bold text-gray-800 truncate" title={currentTopic}>
              {currentTopic}
            </h4>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 font-medium">
          <span>Unit II</span>
          <span className="font-bold text-indigo-600">{exploredPercentage}% explored</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${exploredPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. Top-Right Badge: Topic Mastery */}
      <div className="absolute top-4 right-4 z-20 bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-transform hover:scale-[1.02]">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-2 ring-emerald-400/25 shrink-0">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-black text-gray-800 leading-none">{masteryPercentage}%</div>
          <div className="text-[10px] font-semibold text-gray-500 mt-0.5">Topic Mastery</div>
        </div>
      </div>

      {/* 4. Floating Keyword / Web-Scraped Topic Cards */}
      {/* Top Left Floating Pill */}
      {activeKeywords[0] && (
        <div className="absolute top-[28%] left-4 sm:left-6 z-20 bg-white/85 backdrop-blur-md border border-white/80 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5 max-w-[190px] transition-transform hover:scale-105">
          <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Cloud className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-800 truncate">{activeKeywords[0].title}</div>
            <div className="text-[10px] text-gray-500 truncate">{activeKeywords[0].subtitle}</div>
          </div>
        </div>
      )}

      {/* Bottom Left Floating Pill */}
      {activeKeywords[1] && (
        <div className="absolute bottom-[20%] left-6 sm:left-10 z-20 bg-white/85 backdrop-blur-md border border-white/80 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5 max-w-[200px] transition-transform hover:scale-105">
          <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-800 truncate">{activeKeywords[1].title}</div>
            <div className="text-[10px] text-gray-500 truncate">{activeKeywords[1].subtitle}</div>
          </div>
        </div>
      )}

      {/* Top Right Floating Pill */}
      {activeKeywords[2] && (
        <div className="absolute top-[32%] right-4 sm:right-6 z-20 bg-white/85 backdrop-blur-md border border-white/80 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5 max-w-[200px] transition-transform hover:scale-105">
          <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-800 truncate">{activeKeywords[2].title}</div>
            <div className="text-[10px] text-gray-500 truncate">{activeKeywords[2].subtitle}</div>
          </div>
        </div>
      )}

      {/* Bottom Right Floating Pill */}
      {activeKeywords[3] && (
        <div className="absolute bottom-[20%] right-6 sm:right-10 z-20 bg-white/85 backdrop-blur-md border border-white/80 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5 max-w-[200px] transition-transform hover:scale-105">
          <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-800 truncate">{activeKeywords[3].title}</div>
            <div className="text-[10px] text-gray-500 truncate">{activeKeywords[3].subtitle}</div>
          </div>
        </div>
      )}

      {/* 5. Three.js Transparent WebGL Layer */}
      <div ref={mountRef} className="absolute inset-0 z-10 w-full h-full pointer-events-auto" />

      {/* 6. Model Loading Spinner */}
      {!modelReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/40 backdrop-blur-xs">
          <div className="w-7 h-7 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      )}

      {/* 7. Play/Pause Action Button Overlay */}
      {modelReady && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer tracking-wide"
            title={isPlaying ? "Pause Avatar Speech" : "Play Avatar Explanation"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Explanation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{propAudioUrl || currentUrl ? "Play Explanation" : "Start Explanation"}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
