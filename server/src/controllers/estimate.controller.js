import Estimate from '../models/Estimate.js';

export const saveEstimateBatch = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid estimate payload',
      });
    }

    const documents = items.map((item) => ({
      stt: Number(item.stt) || 0,
      feature: item.feature,
      requirement: item.requirement || '',
      description: item.description || '',
      complexity: item.complexity || 'Medium',
      estimatedHours: Number(item.estimatedHours) || 0,
      estimatedDays: Number(item.estimatedDays) || 0,
      hourlyRate: Number(item.hourlyRate) || 0,
      totalCost: Number(item.totalCost) || 0,
      notes: item.notes || '',
      product: item.product || '',
    }));

    await Estimate.deleteMany({});
    const saved = await Estimate.insertMany(documents);

    res.status(201).json({
      success: true,
      message: 'Estimate saved successfully',
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEstimates = async (req, res) => {
  try {
    const estimates = await Estimate.find().sort({ stt: 1 });
    res.json({
      success: true,
      data: estimates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
