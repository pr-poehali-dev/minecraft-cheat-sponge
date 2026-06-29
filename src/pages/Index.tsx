import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface Particle {
  id: number;
  left: number;
  bottom: number;
  size: number;
  color: string;
  duration: number;
}

const FEATURES = [
  { key: 'killaura', label: 'KillAura', icon: 'Swords', desc: 'Авто-атака по врагам' },
  { key: 'flight', label: 'Fly', icon: 'Plane', desc: 'Свободный полёт' },
  { key: 'xray', label: 'X-Ray', icon: 'Eye', desc: 'Просмотр сквозь блоки' },
  { key: 'speed', label: 'Speed', icon: 'Zap', desc: 'Ускорение движения' },
];

const Index = () => {
  const [active, setActive] = useState(false);
  const [banned, setBanned] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    killaura: true, flight: false, xray: true, speed: false,
  });
  const [glow, setGlow] = useState([70]);
  const [particleRate, setParticleRate] = useState([50]);

  const spawnParticle = useCallback(() => {
    const colors = ['180 100% 50%', '320 100% 55%', '270 100% 60%'];
    setParticles((prev) => [
      ...prev.slice(-40),
      {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        bottom: Math.random() * 30,
        size: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 1.5 + Math.random() * 1.5,
      },
    ]);
  }, []);

  useEffect(() => {
    if (!active || banned) return;
    const interval = setInterval(spawnParticle, 600 - particleRate[0] * 5);
    return () => clearInterval(interval);
  }, [active, banned, particleRate, spawnParticle]);

  const playBanSound = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.9, ctx.currentTime);
    master.connect(ctx.destination);

    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.35;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.3);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.8, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.33);
    }

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'square';
    sub.frequency.setValueAtTime(70, now);
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    sub.connect(subGain);
    subGain.connect(master);
    sub.start(now);
    sub.stop(now + 1.2);

    setTimeout(() => ctx.close(), 1500);
  }, []);

  const handleActivate = () => {
    if (banned) return;
    if (!active) {
      setActive(true);
      setTimeout(() => {
        setActive(false);
        setBanned(true);
        playBanSound();
      }, 2500);
    }
  };

  const reset = () => {
    setBanned(false);
    setActive(false);
    setParticles([]);
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-foreground font-rajdhani relative overflow-hidden grid-bg">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none animate-float-up"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            background: `hsl(${p.color})`,
            boxShadow: `0 0 ${10 + glow[0] / 5}px hsl(${p.color})`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent animate-scan" />
      </div>

      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-neon-magenta/15 blur-[120px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-cyan/15 blur-[120px]" />

      <div className="relative z-10 container max-w-3xl py-10 px-4">
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 border border-neon-cyan/30 rounded-full text-xs tracking-[0.3em] text-neon-cyan box-glow-cyan">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow" />
            MINECRAFT UTILITY
          </div>
          <h1 className="font-orbitron font-black text-5xl md:text-7xl tracking-wider">
            <span className="text-neon-cyan text-glow-cyan animate-flicker">SPONGE</span>
            <span className="text-neon-magenta text-glow-magenta"> CHEAT</span>
          </h1>
          <p className="mt-3 text-muted-foreground tracking-widest uppercase text-sm">
            v1.0.0 · нелегальная сборка
          </p>
        </header>

        <section
          className={`relative rounded-2xl border p-8 mb-6 backdrop-blur-sm transition-all duration-500 animate-fade-in ${
            banned
              ? 'border-red-500/60 bg-red-950/30'
              : active
              ? 'border-neon-magenta box-glow-magenta bg-neon-magenta/5'
              : 'border-neon-cyan/30 box-glow-cyan bg-black/40'
          }`}
        >
          {banned ? (
            <div className="text-center py-4">
              <Icon name="ShieldX" size={64} className="mx-auto text-red-500 mb-4 animate-flicker" />
              <h2 className="font-orbitron font-bold text-3xl text-red-500 mb-2 tracking-wider">
                ВЫ ЗАБАНЕНЫ
              </h2>
              <p className="text-red-300/80 mb-6">
                Античит обнаружил активацию. Доступ к серверу заблокирован.
              </p>
              <button
                onClick={reset}
                className="font-orbitron px-6 py-3 rounded-lg border border-red-500/50 text-red-300 hover:bg-red-500/20 transition-all tracking-widest uppercase text-sm"
              >
                <Icon name="RotateCcw" size={16} className="inline mr-2" />
                Сбросить
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="font-orbitron text-xl tracking-widest uppercase mb-1 text-foreground/90">
                {active ? 'ИНЪЕКЦИЯ В ПРОЦЕССЕ' : 'СТАТУС: ОЖИДАНИЕ'}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {active ? 'Античит сканирует клиент...' : 'Активируй чит на свой страх и риск'}
              </p>
              <button
                onClick={handleActivate}
                disabled={active}
                className={`group relative font-orbitron font-bold text-lg tracking-[0.2em] uppercase px-12 py-5 rounded-xl border-2 transition-all duration-300 ${
                  active
                    ? 'border-neon-magenta text-neon-magenta animate-pulse-glow cursor-wait'
                    : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-[#05060f] hover:box-glow-cyan'
                }`}
              >
                <Icon
                  name={active ? 'Loader' : 'Power'}
                  size={22}
                  className={`inline mr-3 ${active ? 'animate-spin' : ''}`}
                />
                {active ? 'Активация...' : 'Активировать'}
              </button>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-4 mb-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.key}
              className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 hover:border-neon-cyan/40 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon
                    name={f.icon}
                    size={20}
                    className={toggles[f.key] ? 'text-neon-cyan' : 'text-muted-foreground'}
                  />
                  <span className="font-orbitron text-sm tracking-wider">{f.label}</span>
                </div>
                <Switch
                  checked={toggles[f.key]}
                  onCheckedChange={(v) => setToggles((p) => ({ ...p, [f.key]: v }))}
                />
              </div>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-neon-purple/30 bg-black/40 backdrop-blur-sm p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="SlidersHorizontal" size={20} className="text-neon-purple" />
            <h3 className="font-orbitron tracking-widest uppercase text-sm">Настройки</h3>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground/80">Интенсивность свечения</span>
              <span className="text-neon-cyan font-orbitron">{glow[0]}%</span>
            </div>
            <Slider value={glow} onValueChange={setGlow} max={100} step={1} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground/80">Плотность частиц</span>
              <span className="text-neon-magenta font-orbitron">{particleRate[0]}%</span>
            </div>
            <Slider value={particleRate} onValueChange={setParticleRate} max={100} step={1} />
          </div>
        </section>

        <footer className="text-center mt-8 text-xs text-muted-foreground tracking-widest">
          <Icon name="TriangleAlert" size={14} className="inline mr-1 text-yellow-500/70" />
          Демонстрация. Использование читов нарушает правила серверов.
        </footer>
      </div>
    </div>
  );
};

export default Index;