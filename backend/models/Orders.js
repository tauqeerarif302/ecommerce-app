const mongoose = require("mongoose")
const Product = require("./Product")
const User = require("./User")

const orderSchema = new mongoose.Schema({
    name: {type: String, required: true},
    delivery_address: {type: String, required: true},
    phone: {type: String, required: true},
    quantity: {type: Number, required: true},
    total_price:{type: Number, required: true},
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model("Orders", orderSchema)
