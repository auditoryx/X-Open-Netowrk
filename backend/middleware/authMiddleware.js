const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Service = require("../models/Service");

// ✅ Middleware to protect routes
exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        res.status(401).json({ error: "Not authorized, token failed" });
    }
};

// ✅ Fix: Ensure  Middleware Exists
exports.isServiceOwner = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        if (!service.user || service.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized to modify this service" });
        }

        next();
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(500).json({ error: "Authorization error" });
    }
};

// ✅ Fix: Add the missing  function
exports.authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Not authorized for this action" });
        }
        next();
    };
};
