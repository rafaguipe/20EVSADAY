import { useEffect, useRef } from 'react';

const SoundEffect = ({ soundFile, play, volume = 0.5 }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Erro ao tocar som:', error);
      });
    }
  }, [play, volume]);

  return (
    <audio ref={audioRef} preload="auto">
      <source src={soundFile} type="audio/mpeg" />
      <source src={soundFile} type="audio/wav" />
      <source src={soundFile} type="audio/ogg" />
    </audio>
  );
};

export default SoundEffect; 