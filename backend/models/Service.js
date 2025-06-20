const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Associate with a User
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Service", ServiceSchema);
