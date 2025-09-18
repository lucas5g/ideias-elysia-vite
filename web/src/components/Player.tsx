import { IconButton } from '@chakra-ui/react';
import { PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { useRef, useState } from 'react';

interface Props {
  audio: string;
}

export function Player({ audio }: Readonly<Props>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio(audio);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }

    const el = audioRef.current;

    if (el.paused) {
      el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }

  return (
    <IconButton
      onClick={handleAudio}
      rounded={'full'}
      variant={'surface'}
      >
      {isPlaying ? <PauseIcon size={23} /> : <PlayIcon size={23} />}
    </IconButton>

  );
}
