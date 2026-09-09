const jwt = require("jsonwebtoken");




const verifyToken = (req, res, next) => {

    const authHeader = req.header("Authorization");

    let jwtToken;


    // Check Authorization header
    if (authHeader === undefined) {

        return res.status(401).send("Authentication token required");

    } else {

        jwtToken = authHeader.split(" ")[1];

    }


    // Check token
    if (jwtToken === undefined) {

        return res.status(401).send("Invalid token");

    }


    try {

        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).send("Invalid or expired token");

    }
};


module.exports = verifyToken;