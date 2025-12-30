import React from 'react';
import { Leaf } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-8 animate-fade-up">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-foreground">
          Analyzing your plant...
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This may take a few seconds
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
