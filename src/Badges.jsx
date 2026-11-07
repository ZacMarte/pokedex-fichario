import { useMemo } from 'react';

export function GenerationBadges({ gen, owned }) {
  const badgesInfo = useMemo(() => {
    const totalInGen = gen.end - gen.start + 1;
    const ownedInGen = [...owned].filter(id => id >= gen.start && id <= gen.end).length;
    const progress = ownedInGen / totalInGen;
    // Usa o gen.totalBadges que veio lá do App.jsx
    const earned = Math.floor(progress * gen.totalBadges);
    return { earned };
  }, [gen, owned]);

  // Se por algum motivo a geração não tiver totalBadges, usa 8 como fallback
  const totalBadges = gen.totalBadges || 8;

  return (
    <div className="gen-badges-row">
      {Array.from({ length: totalBadges }).map((_, index) => {
        const isUnlocked = index < badgesInfo.earned;
        const badgeImage = `/badges/${gen.name}${index + 1}.png`;
        
        return (
          <div key={index} className={`badge-slot mini ${isUnlocked ? 'is-unlocked' : ''}`}>
            <img 
              src={badgeImage} 
              alt={`Insígnia ${index + 1}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.classList.add('badge-fallback');
              }}
            />
          </div>
        );
      })}
    </div>
  );
}