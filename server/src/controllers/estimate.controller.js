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

export const createEstimate = async (req, res) => {
  try {
    const item = req.body;
    const document = await Estimate.create({
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
    });
    res.status(201).json({
      success: true,
      message: 'Estimate created successfully',
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;
    const document = await Estimate.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found',
      });
    }

    res.json({
      success: true,
      message: 'Estimate updated successfully',
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Estimate.findByIdAndDelete(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found',
      });
    }

    res.json({
      success: true,
      message: 'Estimate deleted successfully',
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};