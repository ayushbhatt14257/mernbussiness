const jwt = require('jsonwebtoken');
const User = require("../model/userschema");


const Authenticate = async(req, res, next) => {
    try {
        const token = req.cookies.jwttoken;
        const verfiyToken = jwt.verify(token, process.env.SECRET_KEY);

        const rootUser = await User.findOne({ _id: verfiyToken._id, "tokens.token": token });

        if (!rootUser) { throw new Error('user Not Found') }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();


    } catch (error) {
        res.status(401).send('Unauthorized: No Token Provided');
        console.log(error);
    }

}

module.exports = Authenticate