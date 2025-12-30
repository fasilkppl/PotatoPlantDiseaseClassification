import React from 'react';
import { CheckCircle2, AlertTriangle, Leaf, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictionResultProps {
  prediction: {
    class: string;
    confidence: number;
  };
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction }) => {
  const isHealthy = prediction.class.toLowerCase() === 'healthy';
  const confidencePercent = (prediction.confidence * 100).toFixed(2);

  const getStatusConfig = () => {
    if (isHealthy) {
      return {
        icon: CheckCircle2,
        bgClass: 'bg-success/10',
        iconClass: 'text-success',
        borderClass: 'border-success/20',
        label: 'Healthy Plant',
        description: 'Your plant appears to be in good health!',
      };
    }
    return {
      icon: AlertTriangle,
      bgClass: 'bg-warning/10',
      iconClass: 'text-warning',
      borderClass: 'border-warning/20',
      label: prediction.class,
      description: 'Disease detected. Consider consulting an expert.',
    };
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="animate-fade-up space-y-4">
      {/* Main Result Card */}
      <div
        className={cn(
          "p-5 rounded-2xl border transition-all duration-300",
          config.bgClass,
          config.borderClass
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              isHealthy ? "bg-success/20" : "bg-warning/20"
            )}
          >
            <StatusIcon className={cn("w-6 h-6", config.iconClass)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground">
              {config.label}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="p-5 rounded-2xl bg-muted/50 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Confidence Score
            </span>
          </div>
          <span className="text-2xl font-bold text-primary">
            {confidencePercent}%
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
        <Leaf className="w-3 h-3" />
        <span>AI-powered plant disease detection</span>
      </div>
    </div>
  );
};

export default PredictionResult;
