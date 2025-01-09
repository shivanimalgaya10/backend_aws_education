const isAuthenticated = (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "User not authenticated", success: false });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded; // Attach decoded user info
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  };
  export default isAuthenticated;
  