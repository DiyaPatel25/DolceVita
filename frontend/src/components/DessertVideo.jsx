import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Muted looping clip that plays only while on screen. Clips that aren't `eager` don't download
// until scrolled near, and people who ask for reduced motion get a still image with a play button.
const DessertVideo = ({ src, poster, label, eager = false }) => {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [near, setNear] = useState(eager);
  const [autoplay] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          if (autoplay) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoplay]);

  const toggle = () => {
    const video = ref.current;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div className="relative w-full h-full bg-slate">
      {/* autoPlay starts it as soon as the file attaches; the observer pauses it off screen */}
      <video
        ref={ref}
        src={near ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={autoplay}
        preload={eager ? "auto" : "none"}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full h-full object-cover"
      />
      {!autoplay && (
        <button
          onClick={toggle}
          aria-label={playing ? `Pause video: ${label}` : `Play video: ${label}`}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-chalk/70 text-cream flex items-center justify-center"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}
    </div>
  );
};

export default DessertVideo;
