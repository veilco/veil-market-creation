require("dotenv").config();
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  entry: isProduction
    ? ["babel-polyfill", "./src/index.ts"]
    : ["./src/index.ts"],
  mode: process.env.NODE_ENV || "development",
  output: {
    publicPath: "/",
    path: path.join(__dirname, "./dist/static")
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(woff|png|jpg|gif)$/,
        use: {
          loader: "url-loader",
          options: { limit: 10000 }
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
      filename: "./index.html",
      favicon: "./src/images/favicon.ico"
    }),
    isProduction ? undefined : new ErrorOverlayPlugin(),
    new webpack.EnvironmentPlugin([
      "NODE_ENV",
      "API_URL",
      "NETWORK_ID",
      "ETHEREUM_HTTP"
    ]),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      reportFilename: "../webpack-report.html"
    })
  ].filter(t => t),
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    hot: true,
    port: 9000,
    historyApiFallback: true
  },
  devtool: "cheap-module-source-map"
};
