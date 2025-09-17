import { useEffect, useRef } from 'react';

const SoundEffect = ({ soundFile, play, volume = 0.5 }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Erro ao tocar som:', error);
        
        // Se for NotAllowedError, aguardar interação do usuário
        if (error.name === 'NotAllowedError') {
          console.log('Som bloqueado pelo navegador. Aguardando interação do usuário...');
          
          const playOnInteraction = () => {
            audioRef.current.play().catch(() => {
              console.log('Ainda não foi possível tocar o som');
            });
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
          };
          
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('keydown', playOnInteraction);
        }
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