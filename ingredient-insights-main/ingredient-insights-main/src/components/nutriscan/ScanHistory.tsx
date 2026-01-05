import { History, Trash2, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScanHistoryItem, AnalysisResult } from '@/types/nutriscan';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ScanHistoryProps {
  history: ScanHistoryItem[];
  onSelectScan: (result: AnalysisResult, inputLabel: string) => void;
  onRemoveScan: (id: string) => void;
  onClearHistory: () => void;
}

function getVerdictColor(verdict: string) {
  switch (verdict) {
    case 'Great':
      return 'bg-safe text-white';
    case 'Good':
      return 'bg-safe/70 text-white';
    case 'Caution':
      return 'bg-warning text-white';
    case 'Avoid':
      return 'bg-danger text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function ScanHistory({ history, onSelectScan, onRemoveScan, onClearHistory }: ScanHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-muted-foreground mb-2">No scan history yet</h3>
        <p className="text-sm text-muted-foreground/70">
          Your scanned products will appear here for 8 weeks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">Recent Scans</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear all
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => onSelectScan(item.result, item.inputLabel)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', getVerdictColor(item.result.verdict))}>
                    {item.result.verdict}
                  </span>
                  <span className="text-lg font-semibold">{item.result.overallScore}</span>
                </div>
                
                <p className="text-sm font-medium line-clamp-2 mb-1">
                  {item.inputLabel}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.scannedAt), { addSuffix: true })}
                </p>

                {item.result.personalizedAlerts.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-warning">
                    <AlertCircle className="w-3 h-3" />
                    <span>{item.result.personalizedAlerts.length} alert{item.result.personalizedAlerts.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </button>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveScan(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground pt-4">
        Scans are automatically deleted after 8 weeks
      </p>
    </div>
  );
}
