const express = require("express");
const { protect, isServiceOwner } = require("../middleware/authMiddleware");
const Service = require("../models/Service");

const router = express.Router();

// ✅ Fetch all services (Public)
router.get("/", async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch services" });
    }
});

// ✅ Fetch a single service by ID (Public)
router.get("/:id", async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ error: "Service not found" });
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving service" });
    }
});

// ✅ Create a new service (Protected)
router.post("/", protect, async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const newService = new Service({ name, description, price, provider: req.user._id });
        await newService.save();
        res.status(201).json(newService);
    } catch (error) {
        res.status(400).json({ error: "Failed to create service" });
    }
});

// ✅ Update a service by ID (Protected & Owner Only)
router.put("/:id", protect, isServiceOwner, async (req, res) => {
    try {
        const allowedUpdates = ["name", "description", "price"];
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        const sanitizedBody = updates.reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            sanitizedBody,
            { new: true, runValidators: true }
        );
        if (!updatedService) return res.status(404).json({ error: "Service not found" });
        res.json(updatedService);
    } catch (error) {
        res.status(400).json({ error: "Failed to update service" });
    }
});

// ✅ Delete a service by ID (Protected & Owner Only)
router.delete("/:id", protect, isServiceOwner, async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(req.params.id);
        if (!deletedService) return res.status(404).json({ error: "Service not found" });
        res.json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete service" });
    }
});

module.exports = router;
