import { useState, useEffect } from 'react';

const sprite = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const TOTAL_POKEMON = 1025;

// Função pra gerar um ID aleatório que não seja igual ao anterior
const getRandomPokemonId = (currentId) => {
  let newId;
  do {
    newId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  } while (newId === currentId);
  return newId;
};

export default function HeroShowcase() {
  const [currentId, setCurrentId] = useState(() => getRandomPokemonId(0));
  const [nextId, setNextId] = useState(() => getRandomPokemonId(currentId));
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentId(nextId);
        setNextId(getRandomPokemonId(nextId));
        setIsTransitioning(false);
      }, 1000);

    }, 4000);

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className="hero-showcase">
      <img
        key={`current-${currentId}`}
        src={sprite(currentId)}
        alt="Pokémon atual"
        className={`showcase-img ${isTransitioning ? 'fade-out' : 'fade-in'}`}
      />
      
      <img
        key={`next-${nextId}`}
        src={sprite(nextId)}
        alt="Próximo Pokémon"
        className={`showcase-img ${isTransitioning ? 'fade-in' : 'fade-out'}`}
      />
    </div>
  );
}