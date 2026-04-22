// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// production config
const { merge } = require("webpack-merge");
const { resolve } = require("path");
const Dotenv = require("dotenv-webpack");
const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "production",
  output: {
    filename: "js/bundle.[contenthash].min.js",
    path: resolve(__dirname, "../../dist"),
    // Use runtime-detected base path so assets load under GitHub Project Pages subpath.
    publicPath: "auto",
  },
  devtool: "source-map",
  plugins: [new Dotenv()],
});
