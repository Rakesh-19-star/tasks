const verifyAdmin = (req, res, next) => {

    // Check whether logged-in user is an admin
    if (req.user.role !== "admin") {

        return res.status(403).json({
            success: false,
            message: "Access denied. Admins only."
        });

    }

    // User is an admin
    next();
};


module.exports = verifyAdmin;