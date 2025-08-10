import { motion } from "framer-motion";
import TMusicCard from "../../typings/MusicCard";
import "./MusicCard.css";

// @ts-ignore
import useSound from "use-sound";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const MusicCard = ({
  albumArt,
  primaryColor,
  musicName,
  musicFilePath,
}: TMusicCard) => {
  // Debug logging
  console.log('MusicCard props:', {
    albumArt,
    primaryColor,
    musicName,
    musicFilePath
  });

  const style = {
    "--primary": primaryColor,
  } as React.CSSProperties;

  const location = useLocation();

  const [isPlaying, setIsPlaying] = useState(false);

  const [play, { stop, sound }] = useSound(musicFilePath, {
    volume: 0.5,
    onload: () => {
      console.log('Audio loaded successfully');
    },
    onloaderror: (error) => console.error('Audio load error:', error),
    onend: () => {
      console.log('Audio ended');
      setIsPlaying(false);
    }
  });

  const bootMusic = () => {
    console.log('Boot music called, isPlaying:', isPlaying);
    console.log('Music file path:', musicFilePath);
    console.log('Sound object:', sound);

    if (isPlaying) {
      // Pause the audio
      if (sound && typeof sound.pause === 'function') {
        sound.pause();
        console.log('Music paused using sound.pause()');
      } else {
        stop();
        console.log('Music stopped using stop()');
      }
      setIsPlaying(false);
    } else {
      // Play the audio
      try {
        if (sound && typeof sound.play === 'function') {
          sound.play();
          console.log('Music played using sound.play()');
        } else {
          play();
          console.log('Music played using play()');
        }
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing music:', error);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    // Stop music when navigating to different pages
    if (sound && typeof sound.stop === 'function') {
      sound.stop();
    } else {
      stop();
    }
    setIsPlaying(false);
  }, [location, stop, sound]);

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
        <div className="flex p-2">
          <p className="music-name text-sm">{musicName}</p>
          <button
            className="play-pause-btn border-white border-2 rounded-full w-24 text-center active:border-black text-sm"
            style={style}
            onClick={() => bootMusic()}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MusicCard;
