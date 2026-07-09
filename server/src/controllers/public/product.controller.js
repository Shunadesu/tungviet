import Product from '../../models/Product.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, limit = 20, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query.categoryId = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const skip = (page - 1) * limit;
    
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sản phẩm không tồn tại' 
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
