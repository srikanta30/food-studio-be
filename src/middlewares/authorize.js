const User = require("../models/user");

const authorization = (permittedRole) => {
  return async (req, res, next) => {
    if (!permittedRole || permittedRole?.length == 0) {
      return next();
    }
    try{
        const user = await req.user.user;

        const userAllowed = await User.findOne({
          _id: user._id,
          role: permittedRole,
        })
          .lean()
          .exec();

        if (userAllowed){
            return next();
        } 
        else {
            return res
            .status(401)
            .json({ status: "failed", message: "Sorry, you don't permissions for that!" });
        }
    }
    catch (err) {
        return res.status(400).json({ error: err});
    } 
  };
};

module.exports = authorization;