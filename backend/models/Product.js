const mongoose = require("mongoose")
const User = require("./User")

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: String, required: true}
},
{
    timestamps: true
}
)

module.exports = mongoose.model("Product", productSchema)
