module.exports = env => {
    const isDev = env === 'dev';
    return {
        mode: isDev ? "development" : "production",
        entry: {
            xdompath: "./src/index.js",
            "xdompath.global": "./globalScoping.js"
        },
        devtool: 'eval-source-map',
        devServer: {
            static: './dist',
          },
          
        optimization: {
            minimize: !isDev
        },
        output: {
            path: __dirname + "/dist",
            filename: `[name]${isDev ? '' : '.min'}.js`,
            publicPath: '/dist/',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader'
                }
            ]
        }
    }; 
};