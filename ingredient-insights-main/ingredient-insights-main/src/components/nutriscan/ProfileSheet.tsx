import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UserProfile } from '@/types/nutriscan';
import { cn } from '@/lib/utils';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const commonAllergies = ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'];
const commonDiets = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-free', 'Dairy-free', 'Low sodium', 'Low sugar'];
const commonGoals = ['Weight loss', 'Muscle gain', 'Heart health', 'Blood sugar control', 'Reduce inflammation', 'Clean eating'];

function TagInput({ 
  label, 
  items, 
  suggestions,
  onAdd, 
  onRemove,
  placeholder 
}: {
  label: string;
  items: string[];
  suggestions: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const availableSuggestions = suggestions.filter(s => !items.includes(s));

  return (
    <div className="space-y-3">
      <label className="font-medium text-sm">{label}</label>
      
      {/* Current items */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              {item}
              <button onClick={() => onRemove(item)} className="hover:text-danger">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add custom */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="text-sm"
        />
        <Button type="button" variant="outline" size="icon" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick add suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.slice(0, 6).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onAdd(suggestion)}
              className="text-xs bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-full transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileSheet({ isOpen, onClose, profile, onUpdateProfile }: ProfileSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display">Your Health Profile</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Customize your preferences to get personalized alerts.
          </p>
        </SheetHeader>

        <div className="space-y-8">
          <TagInput
            label="🚨 Allergies"
            items={profile.allergies}
            suggestions={commonAllergies}
            onAdd={(item) => onUpdateProfile({ allergies: [...profile.allergies, item] })}
            onRemove={(item) => onUpdateProfile({ allergies: profile.allergies.filter(a => a !== item) })}
            placeholder="Add an allergy..."
          />

          <TagInput
            label="🥗 Dietary Restrictions"
            items={profile.dietaryRestrictions}
            suggestions={commonDiets}
            onAdd={(item) => onUpdateProfile({ dietaryRestrictions: [...profile.dietaryRestrictions, item] })}
            onRemove={(item) => onUpdateProfile({ dietaryRestrictions: profile.dietaryRestrictions.filter(d => d !== item) })}
            placeholder="Add a restriction..."
          />

          <TagInput
            label="🎯 Health Goals"
            items={profile.healthGoals}
            suggestions={commonGoals}
            onAdd={(item) => onUpdateProfile({ healthGoals: [...profile.healthGoals, item] })}
            onRemove={(item) => onUpdateProfile({ healthGoals: profile.healthGoals.filter(g => g !== item) })}
            placeholder="Add a goal..."
          />
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Save Preferences
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
