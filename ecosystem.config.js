module.exports = {
    apps : [
    {
        name: 'EasyWiki',
        script: 'app/app.js',
        instances: 1,
        autorestart: true,
        watch: ["config.json", "dev-config.json", "app"],
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }]
};