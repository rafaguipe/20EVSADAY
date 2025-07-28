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
  // Padrão para vídeos normais: youtube.com/watch?v= ou youtu.be/
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (match) return match[1];
  
  // Padrão para vídeos ao vivo: youtube.com/live/
  match = url.match(/youtube\.com\/live\/([^&\n?#]+)/);
  if (match) return match[1];
  
  return null;
};

// Função para gerar URL da thumbnail
const getYouTubeThumbnail = (videoId, isLive = false) => {
  if (!videoId) return null;
  
  // Para vídeos ao vivo, tentar primeiro o formato live
  if (isLive) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
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
  },
  {
    title: "Aplicativo do EV",
    url: "https://www.youtube.com/live/KgxhsOHddTg?si=zoZBIxSPEUaexcIm"
  }
];

const PaperGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
`;

const PaperCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PaperThumbnail = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
`;

const PaperInfo = styled.div`
  padding: 16px;
`;

const PaperTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  line-height: 1.4;
`;

const PaperAuthor = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #6a6a6a;
  margin-bottom: 8px;
`;

const PaperLink = styled.a`
  color: #4a6a8a;
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  
  &:hover {
    color: #357a6a;
    text-decoration: underline;
  }
`;

const papers = [
  {
    title: "Estado Vibracional: Instrumento de Autopesquisa",
    author: "Ivelise Vicenzi",
    url: "https://reposicons.org/jspui/bitstream/123456789/8385/1/Estado%20Vibracional_Instrumento%20de%20Autopesquisa.pdf",
    description: "Resultados da aplicação diária da técnica do estado vibracional durante cinco anos"
  }
];

const VerbetesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const VerbeteCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const VerbeteTitle = styled.h4`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  line-height: 1.3;
`;

const VerbeteMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const VerbeteTag = styled.span`
  background: #4a6a8a;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
`;

const VerbeteAuthor = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #6a6a6a;
  margin-bottom: 8px;
`;

const VerbeteLink = styled.a`
  color: #357a6a;
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  
  &:hover {
    color: #4a6a8a;
    text-decoration: underline;
  }
`;

const verbetes = [
  {
    title: "Estado Vibracional",
    author: "W. V. - Waldo Vieira",
    especialidade: "Energossomatologia",
    tematologia: "Homeostático",
    url: "https://enciclopediadaconscienciologia.org/855-estado-vibracional",
    ref: "p. 15,500 a 15,506"
  },
  {
    title: "Efeito do Estado Vibracional",
    author: "W. V. - Waldo Vieira",
    especialidade: "Energossomatologia",
    tematologia: "Homeostático",
    url: "https://enciclopediadaconscienciologia.org/872-efeito-do-estado-vibracional",
    ref: "p. 14,250 a 14,253"
  },
  {
    title: "Autoqualificação do Estado Vibracional",
    author: "V. S. B. - Victor Bolfe",
    especialidade: "Energossomatologia",
    tematologia: "Homeostático",
    url: "https://enciclopediadaconscienciologia.org/3845-autoqualificacao-do-estado-vibracional",
    ref: "p. 5,835 a 5,840"
  },
  {
    title: "Impedimento ao Estado Vibracional",
    author: "W. V. - Waldo Vieira",
    especialidade: "Energossomatologia",
    tematologia: "Nosográfico",
    url: "https://enciclopediadaconscienciologia.org/856-impedimento-ao-estado-vibracional",
    ref: "p. 18,585 a 18,588"
  },
  {
    title: "Interação Estado Vibracional–Recin",
    author: "J. P. P. - João Paulo Pedote",
    especialidade: "Reciclologia",
    tematologia: "Homeostático",
    url: "https://enciclopediadaconscienciologia.org/5352-interacao-estado-vibracionalrecin",
    ref: "p. 19,567 a 19,573"
  },
  {
    title: "Sinergismo Estado Vibracional–Tenepes",
    author: "F. N. A. - Flávio Amado",
    especialidade: "Autodespertologia",
    tematologia: "Homeostático",
    url: "https://enciclopediadaconscienciologia.org/2881-sinergismo-estado-vibracionaltenepes",
    ref: "p. 30,909 a 30,913"
  },
  {
    title: "Efeito do Estado Vibracional na Desperticidade",
    author: "G. L. W. - Gabriel Lara",
    especialidade: "Paraterapeuticologia",
    tematologia: "Homeostático",
    url: "https://enciclopediadaconscienciologia.org/6792-efeito-do-estado-vibracional-na-desperticidade",
    ref: ""
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
          const isLive = video.url.includes('/live/');
          
          return (
            <VideoCard key={index}>
              <VideoLink href={video.url} target="_blank" rel="noopener noreferrer">
                <VideoThumbnail 
                  src={videoId && !isLive ? getYouTubeThumbnail(videoId, isLive) : '/assets/placeholder-live.svg'} 
                  alt={video.title}
                  onError={(e) => {
                    if (videoId && !isLive) {
                      // Tentar diferentes qualidades de thumbnail para vídeos normais
                      const fallbacks = [
                        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                        `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
                        '/assets/placeholder-workshop.png'
                      ];
                      
                      const currentSrc = e.target.src;
                      const currentIndex = fallbacks.indexOf(currentSrc);
                      const nextIndex = currentIndex + 1;
                      
                      if (nextIndex < fallbacks.length) {
                        e.target.src = fallbacks[nextIndex];
                      } else {
                        // Se todos os fallbacks falharem, usar placeholder
                        e.target.src = '/assets/placeholder-workshop.png';
                      }
                    } else {
                      // Para vídeos ao vivo ou sem ID, usar placeholder específico
                      e.target.src = isLive ? '/assets/placeholder-live.svg' : '/assets/placeholder-workshop.png';
                    }
                  }}
                />
                <VideoInfo>
                  <VideoTitle>{video.title}</VideoTitle>
                  <VideoLink href={video.url} target="_blank" rel="noopener noreferrer">
                    {isLive ? 'Assistir Live →' : 'Assistir no YouTube →'}
                  </VideoLink>
                </VideoInfo>
              </VideoLink>
            </VideoCard>
          );
        })}
      </VideoGrid>
    </Section>

    <Section>
      <SectionTitle>Papers & Artigos</SectionTitle>
      <PaperGrid>
        {papers.map((paper, index) => (
          <PaperCard key={index}>
            <PaperLink href={paper.url} target="_blank" rel="noopener noreferrer">
              <PaperThumbnail>
                📄
              </PaperThumbnail>
              <PaperInfo>
                <PaperTitle>{paper.title}</PaperTitle>
                <PaperAuthor>Por: {paper.author}</PaperAuthor>
                <PaperLink href={paper.url} target="_blank" rel="noopener noreferrer">
                  Ler Paper →
                </PaperLink>
              </PaperInfo>
            </PaperLink>
          </PaperCard>
        ))}
      </PaperGrid>
    </Section>

    <Section>
      <SectionTitle>Verbetes da Enciclopédia da Conscienciologia</SectionTitle>
      <VerbetesGrid>
        {verbetes.map((verbete, index) => (
          <VerbeteCard key={index}>
            <VerbeteTitle>{verbete.title}</VerbeteTitle>
            <VerbeteMeta>
              <VerbeteTag>{verbete.especialidade}</VerbeteTag>
              <VerbeteTag>{verbete.tematologia}</VerbeteTag>
              {verbete.ref && <VerbeteTag>Ref: {verbete.ref}</VerbeteTag>}
            </VerbeteMeta>
            <VerbeteAuthor>Por: {verbete.author}</VerbeteAuthor>
            <VerbeteLink href={verbete.url} target="_blank" rel="noopener noreferrer">
              Ler Verbete →
            </VerbeteLink>
          </VerbeteCard>
        ))}
      </VerbetesGrid>
    </Section>


  </Container>
);

export default Multimidia; 