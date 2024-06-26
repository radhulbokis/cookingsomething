const userController = require("../models/registration");
const HashPasswordx = require("../security/hashing");
const jwt = require("jsonwebtoken");
const {StatusCodes} = require("http-status-codes")

const Login = async (req, res, next) => {
  console.log("\n");
  
  console.log(req.session);
  try {
    if (!req.session.user) {
      const { username, password } = req?.body;

      if (!username || !password)
        return res.status(StatusCodes.BAD_REQUEST).json({ alert: `Username or password not provided` });
      const userValidity = await userController.findOne({ username }).exec();

      if (!userValidity) {
        return res.status(403).json({ alert: `Invalid username` });
      } else {
        const secure = new HashPasswordx();
        const passwordMatch = secure.compare(password, userValidity.password);

        if (!passwordMatch)
          return res.status(StatusCodes.UNAUTHORIZED).json({ alert: "Invalid password" });

        // const accessTokenPayload = {
        //   username: userValidity.username,
        //   userId: userValidity._id,
        // };

        // const AccessToken = jwt.sign(
        //   accessTokenPayload,
        //   process.env.access_token,
        //   { expiresIn: "1h" }
        // );

        // const RefreshToken = jwt.sign(
        //   { username: userValidity.username },
        //   process.env.refresh_token,
        //   { expiresIn: "7d" }
        // );

        req.session.user = { username , _id: userValidity._id, maxAge: 60000 }; //it's not creating this

        return res.status(StatusCodes.OK).json({
          Alert: `${username} logged in!`,
          AccessToken,
          RefreshToken,
          username,
          id:userValidity._id,

        });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ Alert: `${req.session.user.username} already logged in!` });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  
};

const status = (req, res) => {
  try {
    if (req?.session?.user) {
      console.log("Load back!");
      return res.status(200).json({
        status: `${req.session.user.username} Logged In!`,
        username: req.session.user.username,
        Session: req.session,
      });
    } else {
      console.log("Cannot Load!");
      return res.status(401).json({ status: "User is not logged in" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    if (req?.session?.user) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).send("Internal Server Error");
        } else {
          return res.status(200).send("Logout successful");
        }
      });
    } else {
      return res.status(401).send("No user logged in!");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { Login, status, logout };