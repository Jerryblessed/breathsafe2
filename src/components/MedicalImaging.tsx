// Updated MedicalImaging.tsx with full UI restored
import React, { useState, useRef } from 'react';
import {
  Upload, Camera, Brain, AlertTriangle, CheckCircle, Loader, FileImage, Download, Share2
} from 'lucide-react';

interface ClassificationResult {
  prediction: string;
  confidence: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  timestamp: Date;
  explanation?: string;
  simulated?: boolean;
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
      console.warn('Backend unavailable, using mock data.');
      const mockPredictions = [
        { class: 'Colon Benign', confidence: 0.92, risk: 'low' },
        { class: 'Lung Adenocarcinoma', confidence: 0.87, risk: 'critical' },
        { class: 'Colon Adenocarcinoma', confidence: 0.78, risk: 'high' },
        { class: 'Lung Benign', confidence: 0.95, risk: 'low' },
        { class: 'Lung Squamous Cell Carcinoma', confidence: 0.83, risk: 'critical' },
      ];
      const random = mockPredictions[Math.floor(Math.random() * mockPredictions.length)];
      setResult({
        prediction: random.class,
        confidence: random.confidence,
        riskLevel: random.risk as ClassificationResult['riskLevel'],
        recommendations: getRecommendations(random.class),
        timestamp: new Date(),
        explanation: 'This is a simulated result due to backend timeout.',
        simulated: true
      });
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Histopathology Image Analyzer</h1>
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="mx-auto max-h-64" />
          ) : (
            <div>
              <Upload className="mx-auto mb-2" />
              <p>Click to upload histopathology image</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={classifyImage}
        disabled={!selectedImage || isAnalyzing}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">Prediction Result</h2>
          <p><strong>Prediction:</strong> {result.prediction}</p>
          <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
          <p><strong>Risk Level:</strong> {result.riskLevel}</p>
          <p className="mt-4 font-medium">Recommendations:</p>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>

          {result.simulated && (
            <p className="mt-2 text-yellow-600 text-sm">⚠️ This is a simulated result. Real backend was unavailable.</p>
          )}

          {result.explanation && (
            <div className="mt-4 p-3 border rounded bg-gray-50">
              <p className="text-sm text-gray-700 whitespace-pre-line">{result.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalImaging;
