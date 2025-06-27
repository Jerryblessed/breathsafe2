// Updated MedicalImaging.tsx with backend-only classification and improved UI
import React, { useState, useRef } from 'react';
import {
  Upload, Brain, Loader
} from 'lucide-react';

interface ClassificationResult {
  prediction: string;
  confidence: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  timestamp: Date;
  explanation?: string;
}

const MedicalImaging: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRecommendations = (prediction: string): string[] => {
    const baseRecommendations = {
      'Colon Adenocarcinoma': [
        'Immediate consultation with an oncologist required',
        'Schedule comprehensive staging workup',
        'Consider genetic counseling for family members',
        'Discuss treatment options including surgery and chemotherapy'
      ],
      'Colon Benign': [
        'Continue regular screening as recommended',
        'Maintain healthy diet rich in fiber',
        'Monitor for any changes in bowel habits',
        'Follow up with gastroenterologist as scheduled'
      ],
      'Lung Adenocarcinoma': [
        'Urgent referral to thoracic oncology team',
        'Complete staging with CT and PET scans',
        'Molecular testing for targeted therapy options',
        'Smoking cessation support if applicable'
      ],
      'Lung Benign': [
        'Regular follow-up imaging as recommended',
        'Avoid smoking and secondhand smoke exposure',
        'Monitor for respiratory symptoms',
        'Maintain good respiratory hygiene'
      ],
      'Lung Squamous Cell Carcinoma': [
        'Immediate thoracic surgery consultation',
        'Complete staging and biomarker testing',
        'Multidisciplinary team evaluation',
        'Consider clinical trial eligibility'
      ]
    };
    return baseRecommendations[prediction as keyof typeof baseRecommendations] || ['Consult a doctor.'];
  };

  const getRiskLevel = (prediction: string): 'low' | 'high' | 'critical' => {
    if (prediction.includes('Benign')) return 'low';
    if (prediction.includes('Squamous') || prediction.includes('Adenocarcinoma')) return 'critical';
    return 'high';
  };

  const classifyImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      const res = await fetch('https://gibbon-clever-bream.ngrok-free.app/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to get response from backend');
      const data = await res.json();

      const risk = getRiskLevel(data.prediction);

      const classification: ClassificationResult = {
        prediction: data.prediction,
        confidence: data.confidence / 100,
        riskLevel: risk,
        recommendations: getRecommendations(data.prediction),
        timestamp: new Date(),
        explanation: data.ai_explanation,
      };

      setResult(classification);
    } catch (error) {
      console.error('Error:', error);
      alert('Unable to analyze image at the moment. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Histopathology Image Analyzer</h1>

      <div className="mb-6 border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white shadow-sm text-center cursor-pointer hover:bg-blue-50 transition"
           onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        {imagePreview ? (
          <img src={imagePreview} alt="preview" className="mx-auto max-h-64 rounded" />
        ) : (
          <div className="text-gray-500">
            <Upload className="mx-auto w-10 h-10 mb-3" />
            <p className="text-lg font-medium">Click to upload a histopathology image</p>
            <p className="text-sm">Supported formats: PNG, JPG, JPEG</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={classifyImage}
          disabled={!selectedImage || isAnalyzing}
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {isAnalyzing ? <Loader className="animate-spin mr-2 w-4 h-4" /> : <Brain className="mr-2 w-4 h-4" />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </div>

      {result && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Result</h2>
          <div className="space-y-2">
            <p><strong>Prediction:</strong> {result.prediction}</p>
            <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
            <p><strong>Risk Level:</strong> <span className={`capitalize font-semibold ${
              result.riskLevel === 'low' ? 'text-green-600' :
              result.riskLevel === 'moderate' ? 'text-yellow-600' :
              result.riskLevel === 'high' ? 'text-orange-600' : 'text-red-600'
            }`}>{result.riskLevel}</span></p>

            {result.explanation && (
              <div className="bg-gray-50 border-l-4 border-blue-300 p-4 rounded">
                <p className="text-sm text-gray-700 whitespace-pre-line">{result.explanation}</p>
              </div>
            )}

            <div>
              <p className="font-medium mt-4">Recommendations:</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalImaging;
