import jwt from "jsonwebtoken";

const decodeCookieToken = (token) => {
   if (!token) return null;
   try {
      return jwt.verify(token, process.env.JWT_SECRET);
   } catch (error) {
      return null;
   }
};

const resolveAuthFromCookies = (req) => {
   const contextHeader = req.headers["x-auth-context"];
   const context = Array.isArray(contextHeader) ? contextHeader[0] : contextHeader;
   const cookies = req.cookies || {};

   // Keep backward compatibility with legacy "token" while preferring scoped cookies.
   const userCandidates = [cookies.userToken, cookies.token];
   const adminCandidates = [cookies.adminToken, cookies.token];

   if (context === "admin") {
      for (const token of adminCandidates) {
         const decoded = decodeCookieToken(token);
         if (decoded?.role === "admin") return decoded;
      }
   }

   if (context === "user") {
      for (const token of userCandidates) {
         const decoded = decodeCookieToken(token);
         if (decoded?.role === "user" && decoded?.id) return decoded;
      }
   }

   for (const token of [...userCandidates, ...adminCandidates]) {
      const decoded = decodeCookieToken(token);
      if (decoded) return decoded;
   }

   return null;
};

export const protect=(req,res,next)=>{
   const decoded = resolveAuthFromCookies(req);
   if(!decoded){
      return res.status(401).json({message:"Not Authorized",success:false})
   }
   req.user=decoded;
   next();
}

export const adminOnly=(req,res,next)=>{
   const decoded = resolveAuthFromCookies(req);
   if(!decoded){
      return res.status(401).json({message:"Not Authorized",success:false})
   }
   req.admin=decoded;
   if(req.admin.role === "admin" && req.admin.email===process.env.ADMIN_EMAIL){
      return next();
   }
   return res.status(403).json({ message: "Admin access required", success: false });
}