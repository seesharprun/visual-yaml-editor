/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
'use strict';

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const webpack = require('webpack');

/** @type WebpackConfig */
const webExtensionConfig = {
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
	target: 'node', // extensions run in a Node.js context
	entry: './src/web/extension.ts',
	output: {
		filename: 'extension.js',
		path: path.join(__dirname, './dist/web'),
		libraryTarget: 'commonjs',
		devtoolModuleFilenameTemplate: '../../[resource-path]'
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'], // support ts-files and js-files
		alias: {
			// provides alternate implementation for node module and source files
		}
	},
	module: {
		rules: [{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader'
			}]
		}]
	},
	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1 // disable chunks by default
		})
	],
	externals: {
		'vscode': 'commonjs vscode', // ignored because it doesn't exist
	},
	performance: {
		hints: false
	},
	devtool: 'nosources-source-map', // create a source map that points to the original source file
	infrastructureLogging: {
		level: "log", // enables logging required for problem matchers
	},
};

/** @type WebpackConfig */
const webviewConfig = {
	mode: 'none',
	target: 'web', // webview scripts run in a browser-like context
	entry: './src/web/webview.tsx',
	output: {
		filename: 'webview.js',
		path: path.join(__dirname, './dist/web'),
		libraryTarget: 'umd',
		devtoolModuleFilenameTemplate: '../../[resource-path]'
	},
	resolve: {
		mainFields: ['browser', 'module', 'main'],
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		fallback: {
			'assert': require.resolve('assert')
		}
	},
	module: {
		rules: [{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader'
			}]
		},
		{
			test: /\.css$/,
			use: ['style-loader', 'css-loader', 'postcss-loader']
		},
		{
			test: /validator\.generated\.js$/,
			type: 'javascript/auto'
		}]
	},
	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	],
	performance: {
		hints: false
	},
	devtool: 'nosources-source-map',
};

module.exports = [webExtensionConfig, webviewConfig];