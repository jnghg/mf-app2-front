const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const Dotenv = require("dotenv-webpack");
const deps = require("../package.json").dependencies;

module.exports = () => {
  return {
    entry: "./src/index",
    devServer: {
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, "../dist"),
      },
      port: 3002,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    output: {
      path: path.resolve(__dirname, "..", "build"),
      publicPath: process.env.FRONT_HOST,
      uniqueName: "app2_mf",
      pathinfo: false,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".css"],
      alias: {
        "@shared": path.resolve(__dirname, "..", "src", "shared"),
      },
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
                ["@babel/preset-react", { runtime: "automatic" }],
              ],
              plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "app2",
        library: { type: "var", name: "app2" },
        filename: "app2.js",
        exposes: {
          "./Button": path.resolve(
            __dirname,
            "..",
            "src",
            "app2",
            "view",
            "index.ts"
          ),
        },
        shared: {
          react: {
            eager: true,
            requiredVersion: deps["react"],
            singleton: true,
          },
          "react-dom": {
            eager: true,
            requiredVersion: deps["react-dom"],
            singleton: true,
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
      new Dotenv({
        path: path.resolve(__dirname, `.env.${process.env.APP_ENV}`),
      }),
    ],
  };
};
