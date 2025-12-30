import { useState, useCallback } from 'react';

interface PredictionResult {
  class: string;
  confidence: number;
}

interface UsePredictionReturn {
  prediction: PredictionResult | null;
  isLoading: boolean;
  error: string | null;
  predict: (file: File) => Promise<void>;
  reset: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const usePrediction = (): UsePredictionReturn => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: PredictionResult = await response.json();
      setPrediction(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to analyze image. Please check if the API is running.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrediction(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { prediction, isLoading, error, predict, reset };
};
