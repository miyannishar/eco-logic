import mongoose from 'mongoose';
import { connectMongoDB } from './mongodb';

// Model imports
import User from '../models/user';
import Analysis from '../models/analysis';
import AnalysisResult from '../models/analysisResult';

// Export the connection function
export { connectMongoDB };

// Model getter functions to ensure models are available
export const getUserModel = () => {
  return mongoose.models.User || User;
};

export const getAnalysisModel = () => {
  return mongoose.models.Analysis || Analysis;
};

export const getAnalysisResultModel = () => {
  return mongoose.models.AnalysisResult || AnalysisResult;
};

// Convenience function to connect and get a model in one call
export const getConnectedModel = async (modelName) => {
  await connectMongoDB();
  
  switch (modelName) {
    case 'User':
      return getUserModel();
    case 'Analysis':
      return getAnalysisModel();
    case 'AnalysisResult':
      return getAnalysisResultModel();
    default:
      throw new Error(`Model ${modelName} not found`);
  }
}; 