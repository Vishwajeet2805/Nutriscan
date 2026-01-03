import { cn } from '@/lib/utils';
import { AnalysisResult } from '@/types/nutriscan';
import { CheckCircle2, AlertTriangle, XCircle, ThumbsUp } from 'lucide-react';

interface HealthScoreCardProps {
  result: AnalysisResult;
}

const verdictConfig = {
  Great: { icon: CheckCircle2, color: 'text-safe', bg: 'bg-safe/10', ring: 'ring-safe/30' },
  Good: { icon: ThumbsUp, color: 'text-primary', bg: 'bg-primary/10', ring: 'ring-primary/30' },
  Caution: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/30' },
  Avoid: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', ring: 'ring-danger/30' },
};

export function HealthScoreCard({ result }: HealthScoreCardProps) {
  const config = verdictConfig[result.verdict];
  const Icon = config.icon;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-safe';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-danger';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-safe';
    if (score >= 60) return 'bg-primary';
    if (score >= 40) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className={cn(
      "rounded-2xl p-6 ring-2",
      config.bg,
      config.ring
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center",
          config.bg
        )}>
          <Icon className={cn("w-8 h-8", config.color)} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={cn("text-4xl font-bold font-display", getScoreColor(result.overallScore))}>
              {result.overallScore}
            </span>
            <span className="text-muted-foreground text-sm">/100</span>
          </div>
          
          <div className={cn(
            "inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2",
            config.bg,
            config.color
          )}>
            {result.verdict}
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", getProgressColor(result.overallScore))}
              style={{ width: `${result.overallScore}%` }}
            />
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-foreground/90 leading-relaxed">
        {result.summary}
      </p>
    </div>
  );
}
