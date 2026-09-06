const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Needed for .lottie files
config.resolver.assetExts.push("lottie");

module.exports = config;
