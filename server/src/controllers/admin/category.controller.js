import Category from '../../models/Category.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Danh mục không tồn tại' 
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    const category = new Category({
      name,
      description,
      imageUrl
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, imageUrl, isActive },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Danh mục không tồn tại' 
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Danh mục không tồn tại' 
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
