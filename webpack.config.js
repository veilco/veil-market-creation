const HtmlWebPackPlugin = require("html-webpack-plugin");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const path = require("path");

module.exports = {
  entry: ["./src/index.ts"],
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: ["node_modules"],
    alias: {
      src: path.join(__dirname, "src")
    }
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    process.env.NODE_ENV !== "production" ? new ErrorOverlayPlugin() : undefined
  ].filter(t => t),
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    hot: true,
    port: 9000
  },
  devtool: "cheap-module-source-map"
};
