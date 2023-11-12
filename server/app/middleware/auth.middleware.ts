import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers["authorization"];

  /**
   * We need to split the header to get the token, since the header is in the format:
   * Authorization: Bearer <token>
   *
   * We also don't check if token is provided, since we do that in the auth.middleware.ts,
   * which we always use in combination with this guard.
   */
  const token = authHeader && (authHeader as string).split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const decodedToken = jwt.decode(token) as JwtPayload;

  if (decodedToken && decodedToken.exp! < Date.now() / 1000) {
    return res.status(401).json({
      message: "Access token has expired",
    });
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid token",
        });
      }

      (req as any).user = user;

      next();
    }
  );
}
