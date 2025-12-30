import PlantDiseaseDetector from '@/components/PlantDiseaseDetector';
import FloatingLeaves from '@/components/FloatingLeaves';

const Index = () => {
  return (
    <main className="gradient-bg min-h-screen px-4 py-8 sm:py-12 relative overflow-hidden">
      <FloatingLeaves />
      <div className="container max-w-4xl mx-auto relative z-10">
        <PlantDiseaseDetector />
      </div>
    </main>
  );
};

export default Index;
