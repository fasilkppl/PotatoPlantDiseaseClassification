import React, { useState, useCallback, useEffect } from 'react';
import { Leaf, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploader from './ImageUploader';
import PredictionResult from './PredictionResult';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { usePrediction } from '@/hooks/usePrediction';

const PlantDiseaseDetector: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { prediction, isLoading, error, predict, reset } = usePrediction();

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleClear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    reset();
  }, [previewUrl, reset]);

  const handleAnalyze = useCallback(() => {
    if (selectedImage) {
      predict(selectedImage);
    }
  }, [selectedImage, predict]);

  const handleRetry = useCallback(() => {
    if (selectedImage) {
      predict(selectedImage);
    }
  }, [selectedImage, predict]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
          <Leaf className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Potato Plant Disease Detector
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a potato plant image to detect diseases using AI
        </p>
      </div>

      {/* Main Card */}
      <div className="glass-card-strong rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Image Upload Section */}
        <ImageUploader
          onImageSelect={handleImageSelect}
          selectedImage={selectedImage}
          previewUrl={previewUrl}
          onClear={handleClear}
          isLoading={isLoading}
        />

        {/* Action Buttons */}
        {selectedImage && !isLoading && !prediction && !error && (
          <div className="flex gap-3 animate-fade-up">
            <Button
              variant="glass"
              onClick={handleClear}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={handleAnalyze}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Error State */}
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {/* Prediction Result */}
        {prediction && !isLoading && (
          <>
            <PredictionResult prediction={prediction} />
            <Button
              variant="glass"
              onClick={handleClear}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Analyze Another Image
            </Button>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-white/60">
        Powered by Deep Learning • Built with ❤️
      </p>
    </div>
  );
};

export default PlantDiseaseDetector;
