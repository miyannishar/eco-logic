import mongoose from 'mongoose';

const analysisResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imagePath: String,
    predictions: [{
        building: String,
        confidence: Number
    }],
    navigation: {
        current_location: String,
        directions: [String]
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const AnalysisResult = mongoose.models.AnalysisResult || mongoose.model('AnalysisResult', analysisResultSchema);
export default AnalysisResult; 