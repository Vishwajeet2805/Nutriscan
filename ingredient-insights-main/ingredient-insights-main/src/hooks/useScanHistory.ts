import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScanHistoryItem, AnalysisResult } from '@/types/nutriscan';
import { useAuth } from './useAuth';

export function useScanHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch history from database
  useEffect(() => {
    if (!user) {
      setHistory([]);
      setIsLoaded(true);
      return;
    }

    const fetchHistory = async () => {
      // Fetch only non-expired items (expires_at > now)
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch scan history:', error);
        setIsLoaded(true);
        return;
      }

      if (data) {
        // For history display, we store a simplified result
        // The full result is only shown when viewing the analysis
        const items: ScanHistoryItem[] = data.map((row) => ({
          id: row.id,
          inputLabel: row.product_name,
          result: {
            overallScore: row.health_score,
            verdict: getVerdictFromScore(row.health_score),
            summary: `Scanned on ${new Date(row.scanned_at).toLocaleDateString()}`,
            ingredients: row.ingredients.map((name: string) => ({
              name,
              level: 'safe' as const,
              description: '',
              reasoning: '',
            })),
            personalizedAlerts: [],
          },
          scannedAt: row.scanned_at,
        }));
        setHistory(items);
      }
      setIsLoaded(true);
    };

    fetchHistory();
  }, [user]);

  const addScan = useCallback(async (inputLabel: string, result: AnalysisResult) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('scan_history')
      .insert({
        user_id: user.id,
        product_name: inputLabel,
        ingredients: result.ingredients.map(i => i.name),
        health_score: result.overallScore,
        risk_level: result.verdict.toLowerCase(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save scan:', error);
      return;
    }

    if (data) {
      const newItem: ScanHistoryItem = {
        id: data.id,
        inputLabel,
        result,
        scannedAt: data.scanned_at,
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 50));
    }
  }, [user]);

  const removeScan = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete scan:', error);
      return;
    }

    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to clear history:', error);
      return;
    }

    setHistory([]);
  }, [user]);

  return { history, addScan, removeScan, clearHistory, isLoaded };
}

function getVerdictFromScore(score: number): 'Great' | 'Good' | 'Caution' | 'Avoid' {
  if (score >= 80) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Caution';
  return 'Avoid';
}
