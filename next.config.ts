import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Suppress ONNX runtime warnings
    config.ignoreWarnings = [
      /CleanUnusedInitializersAndNodeArgs/,
      /onnxruntime/
    ];
    return config;
  },
};

export default nextConfig;
