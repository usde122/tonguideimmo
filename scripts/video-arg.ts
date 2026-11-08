import {videos} from '../src/videos/index';

/** Lit l'id de vidéo passé en argument (par défaut : la première du registre). */
export const getVideo = () => {
  const id = process.argv[2] ?? videos[0].id;
  const video = videos.find((v) => v.id === id);
  if (!video) {
    console.error(`Vidéo inconnue : ${id}. Disponibles : ${videos.map((v) => v.id).join(', ')}`);
    process.exit(1);
  }
  return video;
};
