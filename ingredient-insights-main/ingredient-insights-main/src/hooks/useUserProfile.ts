import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/nutriscan';
import { useAuth } from './useAuth';

const defaultProfile: UserProfile = {
  allergies: [],
  dietaryRestrictions: [],
  healthGoals: [],
  healthIssues: [],
};

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch profile from database
  useEffect(() => {
    if (!user) {
      setProfile(defaultProfile);
      setIsLoaded(true);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
        setIsLoaded(true);
        return;
      }

      if (data) {
        setProfile({
          allergies: data.allergies || [],
          dietaryRestrictions: data.dietary_restrictions || [],
          healthGoals: data.health_goals || [],
          healthIssues: data.health_issues || [],
        });
      }
      setIsLoaded(true);
    };

    fetchProfile();
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        allergies: newProfile.allergies,
        dietary_restrictions: newProfile.dietaryRestrictions,
        health_goals: newProfile.healthGoals,
        health_issues: newProfile.healthIssues,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update profile:', error);
    }
  }, [profile, user]);

  const clearProfile = useCallback(async () => {
    setProfile(defaultProfile);
    
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        allergies: [],
        dietary_restrictions: [],
        health_goals: [],
        health_issues: [],
      })
      .eq('user_id', user.id);
  }, [user]);

  return { profile, updateProfile, clearProfile, isLoaded };
}
