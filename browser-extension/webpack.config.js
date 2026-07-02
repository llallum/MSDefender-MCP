import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import path from 'path';

export default {
    mode : 'production',
    entry: {
        contentScript: "./src/content/index.ts",
        background: "./src/background/index.ts",
        react: "./src/react/index.tsx"
    },
    output: {
        path: path.resolve('dist'),
        filename: '[name].js',
        clean: true
    },
/*     optimization: {
        minimize: true,
        minimizer: [
            new (await import('terser-webpack-plugin')).default({
            exclude: /background\.js/
        })]
    }, */
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new CopyPlugin({
            patterns: [{
                from: path.resolve('./manifest.json'),
                to: path.resolve('dist')
            }]
        })
    ],
    module: {
        rules: [
            {
                test: /.(ts|tsx)$/,
                exclude: /node_modules/,
                use : 'ts-loader'
            },
            {
                test: /.(jsx|js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', {'runtime': 'automatic'}]
                        ]
                    }
                }
            }
        ]
    }
}