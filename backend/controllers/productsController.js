const Product = require("../models/Product");
const Orders = require("../models/Orders");
const { countDocuments } = require("../models/User");

const addProduct = async (req, res) => {
  try {
    const { title, description, category, price} = req.body;

    const user = req.user;
    // const image = req.file 
    console.log(req.file)
    const image = req.file
    image_url = `http://localhost:5000/uploads/${image.filename}`

    await Product.create({
      userId: user.id,
      title,
      description,
      category,
      price,
      image: image_url
    });

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const showProducts = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    
    const page = Number(req.query.page) || 1
    const limit = 9
    const skip = (page - 1) * limit

    const products = await Product.find({})
    .populate("userId", "fullName email role")
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)

    return res.status(200).json({ 
      products, 
      totalProducts
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sellerProducts = async (req, res) => {
  try{
    const totalProducts = await Product.countDocuments({userId : req.user.id})
    const page = Number(req.query.page) || 1
    const limit = 9
    const skip = (page - 1) * limit

    const user = req.user
    const products = await Product.find({userId : req.user.id})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)

    return res.status(200).json({ 
      products,
      totalProducts
     })
  }catch(error){
    return res.status(500).json({
      message: error.message
    })
  }
}


const deleteProduct = async (req, res) => {

  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not authorized to delete it",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}


const updateProduct = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    // Find the product and ensure it belongs to the logged-in seller
    const product = await Product.findOne({ _id: productId, userId });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not authorized to update it",
      });
    }

    // Update fields if provided
    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;

    // If a new image is uploaded
    if (req.file) {
      product.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


const ProductCheckout = async (req, res) => {
  try{
    const user = req.user
    // Destructure expected fields from the frontend
    let { quantity, totalPrice, name, phone, address, productId } = req.body;

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    if (typeof totalPrice !== "number" || totalPrice <= 0) {
      return res.status(400).json({ message: "Total price must be a positive number" });
    }

    // Fetch the product to verify it exists and get the seller reference from product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const sellerId = product.userId
    // Create a single order document
    const order = await Orders.create({
      name,
      delivery_address: address,
      phone,
      quantity,
      total_price: totalPrice,
      product: productId,
      seller: sellerId,
      buyer: req.user.id
    });

    return res.status(201).json({ message: "Order placed successfully"});
  }catch(error){
    return res.status(500).json({ message: error.message });
  }
}

// Get all orders for the logged-in buyer
const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    const orders = await Orders.find({ buyer: buyerId })
      .populate({
        path: "product",
        select: "title price image description category"
      })
      .populate({
        path: "seller",
        select: "fullName name email"
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all orders for the logged-in seller
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await Orders.find({ seller: sellerId })
      .populate({
        path: "product",
        select: "title price image description category"
      })
      .populate({
        path: "buyer",
        select: "fullName name email"
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update order status (seller can change status of their orders)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.id;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Orders.findOne({ _id: id, seller: sellerId });
    if (!order) {
      return res.status(404).json({ message: "Order not found or you are not authorized to update it" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  showProducts,
  sellerProducts,
  deleteProduct,
  updateProduct,
  ProductCheckout,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus
};
