import { useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/nutriscan/Header';
import { HeroSection } from '@/components/nutriscan/HeroSection';
import { IngredientInput } from '@/components/nutriscan/IngredientInput';
import { AnalysisView } from '@/components/nutriscan/AnalysisView';
import { ProfileSheet } from '@/components/nutriscan/ProfileSheet';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AnalysisResult } from '@/types/nutriscan';

type AppView = 'home' | 'input' | 'analysis';

export default function Index() {
  const [view, setView] = useState<AppView>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [originalInput, setOriginalInput] = useState('');
  
  const { profile, updateProfile, isLoaded } = useUserProfile();

  const handleAnalyze = async (input: string, isImage: boolean, imageBase64?: string) => {
    setIsAnalyzing(true);
    setOriginalInput(isImage ? 'Image scan' : input);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-ingredients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            ingredients: input,
            imageBase64: isImage ? imageBase64 : undefined,
            userProfile: profile,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setAnalysisResult(result);
      setOriginalInput(isImage ? 'Image scan' : input);
      setView('analysis');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze ingredients');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setIsProfileOpen(true)} />
      
      {view === 'home' && (
        <>
          <HeroSection onScanClick={() => setView('input')} />
          
          {/* Features preview */}
          <section className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-12 h-12 rounded-xl bg-safe/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-display font-semibold mb-2">Instant Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get a complete breakdown of every ingredient with health ratings
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-display font-semibold mb-2">Personalized</h3>
                <p className="text-sm text-muted-foreground">
                  Set your allergies and diet preferences for tailored alerts
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-display font-semibold mb-2">Ask Anything</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with AI to understand ingredients better
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {view === 'input' && (
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <IngredientInput
            onAnalyze={handleAnalyze}
            isLoading={isAnalyzing}
            onClose={() => setView('home')}
          />
        </div>
      )}

      {view === 'analysis' && analysisResult && (
        <AnalysisView
          result={analysisResult}
          originalInput={originalInput}
          profile={profile}
          onBack={() => setView('home')}
          onNewScan={() => {
            setAnalysisResult(null);
            setView('input');
          }}
        />
      )}

      <ProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
      />
    </div>
  );
}
