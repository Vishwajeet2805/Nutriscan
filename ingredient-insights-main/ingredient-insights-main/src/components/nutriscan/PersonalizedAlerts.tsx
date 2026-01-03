import { AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalizedAlertsProps {
  alerts: string[];
}

export function PersonalizedAlerts({ alerts }: PersonalizedAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-safe/10 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-safe/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-safe" />
        </div>
        <div>
          <span className="font-medium text-safe">All Clear!</span>
          <p className="text-sm text-muted-foreground">
            No conflicts with your dietary preferences
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-danger/10 rounded-2xl p-4 ring-1 ring-danger/20">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-danger" />
        <span className="font-semibold text-danger">Personal Alerts</span>
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div 
            key={index}
            className="flex items-start gap-2 bg-background/50 rounded-lg p-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 shrink-0" />
            <span className="text-sm text-foreground">{alert}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
