const express = require("express");
const db = require("../src/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const router = express.Router();


// ======================================================
// REGISTER
// POST /api/auth/register
// ======================================================

router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;


        // --------------------------------------------------
        // 1. Required field validation
        // --------------------------------------------------

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // --------------------------------------------------
        // 2. Email format validation
        // --------------------------------------------------

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });

        }


        // --------------------------------------------------
        // 3. Password validation
        // --------------------------------------------------

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });

        }


        // --------------------------------------------------
        // 4. Check if email already exists
        // --------------------------------------------------

        const existingUserQuery = `
            SELECT id
            FROM users
            WHERE email = ?
        `;


        const existingUser = await new Promise((resolve, reject) => {

            db.get(
                existingUserQuery,
                [email],
                (err, user) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }

                }
            );

        });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });

        }


        // --------------------------------------------------
        // 5. Hash password
        // --------------------------------------------------

        const hashedPassword = await bcrypt.hash(password, 10);


        // --------------------------------------------------
        // 6. Insert user
        // --------------------------------------------------

        const sql = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `;


        db.run(
            sql,
            [name, email, hashedPassword, "user"],

            function (err) {

                if (err) {

                    console.error(
                        "Registration error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Failed to register user"
                    });

                }


                // --------------------------------------------------
                // 7. Registration successful
                // --------------------------------------------------

                return res.status(201).json({
                    success: true,
                    message: "User registered successfully",
                    userId: this.lastID
                });

            }
        );

    } catch (error) {

        console.error(
            "Registration error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });

    }

});


// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post("/login", async (req, res) => {

    const { email, password } = req.body;
    


    try {

        // --------------------------------------------------
        // 1. Find user by email
        // --------------------------------------------------

        const userQuery = `
            SELECT *
            FROM users
            WHERE email = ?
        `;


        db.get(
            userQuery,
            [email],

            async (err, dbUser) => {

                // --------------------------------------------------
                // Database error
                // --------------------------------------------------

                if (err) {

                    console.error(
                        "Database error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }


                // --------------------------------------------------
                // User not found
                // --------------------------------------------------

                if (dbUser === undefined) {

                    return res.status(400).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }


                // --------------------------------------------------
                // 2. Compare entered password with hashed password
                // --------------------------------------------------
                

                const isPasswordMatch =
                    await bcrypt.compare(
                        password,
                        dbUser.password
                    );


                // --------------------------------------------------
                // 3. Login successful
                // --------------------------------------------------

               if (isPasswordMatch) {

    const token = jwt.sign(
        {
            userId: dbUser.id,
            email: dbUser.email,
            role:dbUser.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return res.status(200).json({
        success: true,
        message: "Login successful",
        token: token
    });

}


                // --------------------------------------------------
                // 4. Wrong password
                // --------------------------------------------------

                else {

                    return res.status(400).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }
            }
        );

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});



// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;