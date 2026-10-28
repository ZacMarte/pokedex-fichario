import { Book, Sparkles, Check } from 'lucide-react';

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <div className="brand">
          <span className="brand-mark"><span /></span>
          <span>MEU <b>FICHÁRIO</b></span>
        </div>
        <div className="landing-actions">
          <button className="btn-ghost" onClick={onLogin}>Entrar</button>
          <button className="btn-primary" onClick={onSignup}>Criar Conta</button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="eyebrow"><Sparkles size={14} /> SUA COLEÇÃO, SUA JORNADA</div>
          <h1>Organize sua <em>coleção</em> de cartas Pokémon.</h1>
          <p>
            Complete sua Pokédex, monte seus fichários virtuais 3x3 ou 4x4 e acompanhe
            seu progresso de onde estiver. Tudo salvo na sua conta.
          </p>
          <div className="landing-buttons">
            <button className="btn-primary large" onClick={onSignup}>
              Começar agora
            </button>
            <button className="btn-outline large" onClick={onLogin}>
              Já tenho conta
            </button>
          </div>
        </div>
        <div className="landing-visual">
          {/* Um mockup simples pra ilustrar, ou você pode colocar imagens reais depois */}
          <div className="mockup-card">
            <div className="mockup-header">
              <Book size={16} /> Meu Álbum
            </div>
            <div className="mockup-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="mockup-slot">
                  {i % 2 === 0 && <Check size={14} color="var(--lime)" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature-item">
          <span className="feature-icon"><Check size={18} /></span>
          <h3>Pokédex completa</h3>
          <p>Acompanhe todas as 1025 espécies, de Kanto a Paldea.</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon"><Book size={18} /></span>
          <h3>Fichários Virtuais</h3>
          <p>Monte álbuns personalizados com as cartas que você tem.</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon"><Sparkles size={18} /></span>
          <h3>Busca de cartas</h3>
          <p>Encontre as imagens das cartas oficiais direto na plataforma.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© 2026 ZacMarte — Todos os direitos reservados.</span>
      </footer>
    </main>
  );
}