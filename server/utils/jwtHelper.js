const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, secretKey, {
        expiresIn: '1h'
    });
};
const verifyToken = (token) => {
    return jwt.verify(token, secretKey);
};
module.exports = { generateToken, verifyToken };
