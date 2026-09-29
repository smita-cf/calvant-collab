


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     return [
//       { source: "/user-service/:path*", destination: "http://localhost:4000/:path*" },
//       // add more as other flows need them, e.g.:
//       // { source: "/compliance-brain/:path*", destination: "http://localhost:4014/:path*" },
//     ];
//   },
// };

// module.exports = nextConfig;