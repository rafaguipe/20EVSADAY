import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 32px 16px;
  max-width: 900px;
  margin: 0 auto;
  background: ${({ theme }) => theme.background};
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 32px;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
`;

const VideoCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const VideoThumbnail = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const VideoInfo = styled.div`
  padding: 16px;
`;

const VideoTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  line-height: 1.4;
`;

const VideoLink = styled.a`
  color: #4a6a8a;
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  
  &:hover {
    color: #357a6a;
    text-decoration: underline;
  }
`;

// Função para extrair o ID do vídeo do YouTube
const getYouTubeVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

// Função para gerar URL da thumbnail
const getYouTubeThumbnail = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const videos = [
  {
    title: "O que é Estado Vibracional?",
    url: "https://www.youtube.com/watch?v=bqvBu3DIMQ4"
  },
  {
    title: "O poder do Estado Vibracional",
    url: "https://www.youtube.com/watch?v=nkUoL-pMDi0"
  },
  {
    title: "MBE + EV: Técnica da Mobilização Básica das Energias",
    url: "https://youtu.be/FPjtUkKkVUs?si=wpsKx-Dz0h6BuAjc"
  }
];

const Multimidia = () => (
  <Container>
    <Title>Referências Multimídia sobre EV</Title>
    <Section>
      <SectionTitle>Vídeos</SectionTitle>
      <VideoGrid>
        {videos.map((video, index) => {
          const videoId = getYouTubeVideoId(video.url);
          return (
            <VideoCard key={index}>
              <VideoLink href={video.url} target="_blank" rel="noopener noreferrer">
                <VideoThumbnail 
                  src={getYouTubeThumbnail(videoId)} 
                  alt={video.title}
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                />
                <VideoInfo>
                  <VideoTitle>{video.title}</VideoTitle>
                  <VideoLink href={video.url} target="_blank" rel="noopener noreferrer">
                    Assistir no YouTube →
                  </VideoLink>
                </VideoInfo>
              </VideoLink>
            </VideoCard>
          );
        })}
      </VideoGrid>
    </Section>
  </Container>
);

export default Multimidia; 