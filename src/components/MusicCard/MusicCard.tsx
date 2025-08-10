import { motion } from "framer-motion";
import TMusicCard from "../../typings/MusicCard";
import "./MusicCard.css";

import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const MusicCard = ({
  albumArt,
  primaryColor,
  musicName,
  musicFilePath,
}: TMusicCard) => {


  const style = {
    "--primary": primaryColor,
  } as React.CSSProperties;

  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.src = musicFilePath;
    audio.volume = 0.5;
    audio.preload = 'metadata';

    // Audio event listeners
    audio.addEventListener('loadstart', () => {
      setIsLoading(true);
      setAudioError(null);
    });

    audio.addEventListener('canplay', () => {
      setIsLoading(false);
    });

    audio.addEventListener('loadeddata', () => {
      setIsLoading(false);
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setAudioError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    });

    audioRef.current = audio;

    return () => {
      // Cleanup
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [musicFilePath]);

  const bootMusic = async () => {
    // Mark user interaction
    if (!userInteracted) {
      setUserInteracted(true);
    }

    if (!audioRef.current) {
      console.error('Audio element not initialized');
      return;
    }

    const audio = audioRef.current;

    try {
      if (isPlaying) {
        // Pause the audio
        audio.pause();
      } else {
        // Play the audio
        setIsLoading(true);
        setAudioError(null);

        // For mobile compatibility, try to unlock audio context
        if (!userInteracted) {
          // Create a silent audio to unlock the audio context
          const silentAudio = new Audio();
          silentAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
          try {
            await silentAudio.play();
            silentAudio.pause();
          } catch (e) {
            console.log('Silent audio unlock failed:', e);
          }
        }

        // Ensure audio is loaded
        if (audio.readyState < 2) {
          console.log('Audio not ready, loading...');
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('Audio load timeout'));
            }, 10000); // 10 second timeout

            const onCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve(void 0);
            };
            const onError = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('Audio failed to load'));
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
            audio.load();
          });
        }

        // Multiple attempts to play
        let playAttempts = 0;
        const maxAttempts = 3;

        while (playAttempts < maxAttempts) {
          try {
            const playPromise = audio.play();

            if (playPromise !== undefined) {
              await playPromise;
              console.log('Music started playing');
              break;
            }
          } catch (playError) {
            playAttempts++;
            console.warn(`Play attempt ${playAttempts} failed:`, playError);

            if (playAttempts >= maxAttempts) {
              throw playError;
            }

            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing music:', error);
      setIsLoading(false);
      setIsPlaying(false);

      // Show user-friendly error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setAudioError('Tap to enable audio');
        } else if (error.message.includes('timeout')) {
          setAudioError('Audio loading timeout - try again');
        } else {
          setAudioError('Audio unavailable - try again');
        }
      } else {
        setAudioError('Audio error - try again');
      }
    }
  };

  useEffect(() => {
    // Stop music when navigating to different pages
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [location]);

  return (
    <div className="h-full m-2 p-2 md:p-0 wrapper-bg-full">
      <motion.div
        className="wrapper-bg-card flex items-center md:flex-col md:w-80 gap-5 md:p-2 rounded-lg sticky top-0"
        initial={{ translateY: "0px" }}
      >
        <img
          className="album-art rounded-lg w-24 h-24 md:w-auto md:h-auto pointer-events-none select-none"
          src={albumArt}
        ></img>
        <div className="flex flex-col p-2 gap-2">
          <p className="music-name text-sm">{musicName}</p>
          <button
            className="play-pause-btn border-white border-2 rounded-full w-24 text-center active:border-black text-sm disabled:opacity-50"
            style={style}
            onClick={() => bootMusic()}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
          </button>
          {audioError && (
            <p className="text-red-400 text-xs text-center">{audioError}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MusicCard;
