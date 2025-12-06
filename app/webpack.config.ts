// import path from 'path';

// import webpack from 'webpack';

// import Dotenv from 'dotenv-webpack';

// import WebpackBar from 'webpackbar';

// import { CleanWebpackPlugin } from 'clean-webpack-plugin';

// import CopyPlugin from 'copy-webpack-plugin';

// import HtmlWebpackPlugin from 'html-webpack-plugin';

// import MiniCssExtractPlugin from 'mini-css-extract-plugin';

// import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

// import getPublicUrlOrPath from 'react-dev-utils/getPublicUrlOrPath';

// import fs from 'fs';

// const appDirectory = fs.realpathSync(process.cwd());

// const resolveApp = (relativePath: any) =>
//     path.resolve(appDirectory, relativePath);

// const publicUrlOrPath = getPublicUrlOrPath(
//     process.env.NODE_ENV === 'development',

//     require(resolveApp('package.json')).homepage,

//     process.env.PUBLIC_URL
// );

// type Mode = 'production' | 'development';

// interface EnvVariables {
//     mode?: Mode;

//     // analyzer?: boolean;

//     port?: number;

//     // platform?: BuildPlatform;
// }

// const WebpackConfig = (env: EnvVariables) => {
//     const isDev = env.mode === 'development';

//     const config: webpack.Configuration = {
//         mode: env.mode ?? 'development',

//         entry: path.resolve(__dirname, 'src', 'index.tsx'),

//         output: {
//             filename: 'static/js/outbound.[contenthash].js',

//             chunkFilename: 'static/js/outbound.[contenthash:8].chunk.js',

//             assetModuleFilename: 'static/outbound/outbound.[hash][ext]',

//             path: path.join(process.cwd(), 'build'),

//             publicPath: publicUrlOrPath,

//             devtoolModuleFilenameTemplate: (info: any) =>
//                 path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
//         },

//         plugins: [
//             new WebpackBar(),

//             new Dotenv(),

//             new CleanWebpackPlugin(),

//             new HtmlWebpackPlugin({
//                 template: './public/index.html',

//                 inject: 'head',
//             }),

//             new CopyPlugin({
//                 patterns: [
//                     {
//                         from: 'public/assets',

//                         to: 'assets',
//                     },
//                 ],
//             }),

//             !isDev &&
//                 new MiniCssExtractPlugin({
//                     filename: 'static/css/outbound/[name].[contenthash:8].css',

//                     chunkFilename:
//                         'static/css/outbound/[name].[contenthash:8].css',
//                 }),
//         ].filter(Boolean),

//         resolve: {
//             extensions: ['.tsx', '.jsx', '.ts', '.js', '.css', '.scss'],

//             alias: {
//                 src: path.resolve(__dirname, 'src'),

//                 '@mts': path.resolve(__dirname, 'node_modules/@mts'),
//             },
//         },

//         devtool: isDev && 'inline-source-map',

//         devServer: {
//             port: 3000,

//             open: {
//                 target: ['/'],

//                 app: {
//                     name: 'Google Chrome',
//                 },
//             },

//             static: {
//                 directory: resolveApp('public'),

//                 publicPath: [publicUrlOrPath],
//             },

//             historyApiFallback: {
//                 disableDotRule: true,

//                 index: publicUrlOrPath,
//             },

//             devMiddleware: { publicPath: publicUrlOrPath.slice(0, -1) },

//             proxy: [
//                 {
//                     context: ['/admin/api/v1/fe/events'],

//                     target: 'https://mtsbridgedev.mts-corp.ru/bridgeoutboundback',

//                     ws: true,

//                     pathRewrite: { '/admin': '' },

//                     secure: false,

//                     changeOrigin: true,
//                 },

//                 {
//                     context: ['/auth', '/login', '/refresh'],

//                     target: 'https://bridgeauth.mtsbridgedev.mts-corp.ru',

//                     secure: false,

//                     changeOrigin: true,
//                 },

//                 {
//                     context: ['/admin'],

//                     target: 'https://mtsbridgedev.mts-corp.ru/bridgeoutboundback',

//                     pathRewrite: { '/admin': '' },

//                     secure: false,

//                     changeOrigin: true,
//                 },
//             ],
//         },

//         optimization: {
//             splitChunks: {
//                 minSize: 5000,

//                 cacheGroups: {
//                     reactVendor: {
//                         test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,

//                         name: 'reactVendor',

//                         chunks: 'all',

//                         priority: 1,
//                     },

//                     defaultVendor: {
//                         test: /[\\/]node_modules[\\/]/,

//                         name: 'defaultVendor',

//                         chunks: 'all',

//                         minChunks: 1,

//                         priority: 1,
//                     },
//                 },
//             },
//         },

//         module: {
//             rules: [
//                 {
//                     test: /\.(js|jsx|ts|tsx)?$/,

//                     use: [
//                         {
//                             loader: 'babel-loader',

//                             options: {
//                                 presets: [
//                                     '@babel/preset-typescript',

//                                     [
//                                         '@babel/preset-react',

//                                         { runtime: 'automatic' },
//                                     ],
//                                 ],
//                             },
//                         },
//                     ],

//                     exclude: /[\\/]node_modules[\\/]/,
//                 },

//                 {
//                     test: /\.(scss|css)$/i,

//                     use: [
//                         isDev ? 'style-loader' : MiniCssExtractPlugin.loader,

//                         'css-loader',

//                         // {

//                         //  loader: 'css-loader',

//                         //  options: {

//                         //      modules: {

//                         //          localIdentName: isDev

//                         //              ? '[path][name]__[local]'

//                         //              : '[hash:base64]',

//                         //      },

//                         //  },

//                         // },

//                         'sass-loader',
//                     ],
//                 },
//             ],
//         },
//     };

//     return config;
// };

// export default WebpackConfig;
