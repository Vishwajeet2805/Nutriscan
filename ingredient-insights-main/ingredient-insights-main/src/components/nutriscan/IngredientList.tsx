import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IngredientAnalysis, HealthLevel } from '@/types/nutriscan';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface IngredientListProps {
  ingredients: IngredientAnalysis[];
}

const levelConfig: Record<HealthLevel, { color: string; bg: string; label: string }> = {
  safe: { color: 'text-safe', bg: 'bg-safe', label: 'Safe' },
  caution: { color: 'text-caution', bg: 'bg-caution', label: 'Moderate' },
  warning: { color: 'text-warning', bg: 'bg-warning', label: 'Caution' },
  danger: { color: 'text-danger', bg: 'bg-danger', label: 'Concern' },
};

function IngredientItem({ ingredient }: { ingredient: IngredientAnalysis }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = levelConfig[ingredient.level];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl transition-colors",
          "hover:bg-muted/50 cursor-pointer"
        )}>
          {/* Level indicator dot */}
          <div className={cn("w-3 h-3 rounded-full shrink-0", config.bg)} />
          
          <div className="flex-1 text-left">
            <span className="font-medium">{ingredient.name}</span>
          </div>
          
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            config.color,
            `${config.bg}/20`
          )}>
            {config.label}
          </span>
          
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="px-4 pb-4 ml-6 border-l-2 border-muted">
          <p className="text-sm text-muted-foreground mb-3">
            {ingredient.description}
          </p>
          
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-primary uppercase">Why this rating?</span>
                <p className="text-sm text-foreground/80">{ingredient.reasoning}</p>
              </div>
            </div>
            
            {ingredient.scientificContext && (
              <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                <span className="font-semibold">What the science says: </span>
                {ingredient.scientificContext}
              </div>
            )}
            
            {ingredient.uncertaintyNote && (
              <div className="flex items-start gap-2 text-xs text-warning border-t border-border pt-2 mt-2">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{ingredient.uncertaintyNote}</span>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function IngredientList({ ingredients }: IngredientListProps) {
  // Sort by health level (danger first)
  const sortedIngredients = [...ingredients].sort((a, b) => {
    const order: HealthLevel[] = ['danger', 'warning', 'caution', 'safe'];
    return order.indexOf(a.level) - order.indexOf(b.level);
  });

  const countByLevel = (level: HealthLevel) => 
    ingredients.filter(i => i.level === level).length;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-semibold text-lg mb-3">Ingredient Breakdown</h3>
        
        {/* Summary counts */}
        <div className="flex flex-wrap gap-2">
          {countByLevel('safe') > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-safe/20 text-safe">
              {countByLevel('safe')} safe
            </span>
          )}
          {countByLevel('caution') > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-caution/20 text-caution">
              {countByLevel('caution')} moderate
            </span>
          )}
          {countByLevel('warning') > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/20 text-warning">
              {countByLevel('warning')} caution
            </span>
          )}
          {countByLevel('danger') > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-danger/20 text-danger">
              {countByLevel('danger')} concern
            </span>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {sortedIngredients.map((ingredient, index) => (
          <IngredientItem key={index} ingredient={ingredient} />
        ))}
      </div>
    </div>
  );
}
