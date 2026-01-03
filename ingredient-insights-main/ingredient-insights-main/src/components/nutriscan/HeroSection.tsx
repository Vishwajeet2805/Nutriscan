import { Sparkles, Camera, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onScanClick: () => void;
}

export function HeroSection({ onScanClick }: HeroSectionProps) {
  return (
    <section className="relative py-12 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-2xl text-center">
        {/* Floating emoji decoration */}
        <div className="relative mb-6">
          <span className="text-6xl animate-float inline-block">🥗</span>
          <span className="absolute -left-4 top-0 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🍎</span>
          <span className="absolute -right-4 top-0 text-3xl animate-float" style={{ animationDelay: '1s' }}>🥑</span>
        </div>

        <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
          Understand What You're{' '}
          <span className="text-primary">Really</span> Eating
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
          Your AI co-pilot that turns confusing ingredient lists into clear, 
          personalized health insights — in seconds.
        </p>

        <Button
          size="lg"
          onClick={onScanClick}
          className="group relative px-8 py-6 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
        >
          <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
          Scan Ingredients
        </Button>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span>Photo scan</span>
          </div>
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-secondary" />
            <span>Text input</span>
          </div>
        </div>
      </div>
    </section>
  );
}
