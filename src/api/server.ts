require("dotenv").config();
import path from "path";
import { ApolloServer } from "apollo-server-express";
import createContext from "./createContext";
import { typeDefs, resolvers } from "./schema";
import RateLimit from "express-rate-limit";
import express from "express";
import compression from "compression";
import ms from "ms";

async function start() {
  const context = await createContext();
  const app = express();

  app.use(compression());

  // Rate limit incoming requests by IP address
  app.use(
    new RateLimit({
      windowMs: ms("1m"),
      max: 100, // 1.6 per second-ish
      message: {
        errors: ["Too many requests, please try again later."]
      } as any
    })
  );

  app.use((req, res, next) => {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get("x-forwarded-proto") !== "https") {
      return res.redirect("https://" + req.get("host") + req.url);
    }
    next();
  });

  const apollo = new ApolloServer({ typeDefs, resolvers, context });
  (apollo as any).applyMiddleware({ app });

  app.use(express.static(path.join(__dirname, "../../dist/static")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../../dist/static", "index.html"));
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀  Server ready on port ${port}`);
  });
}

start();
