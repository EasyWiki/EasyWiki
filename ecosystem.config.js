module.exports = {
    apps : [
    {
        name: 'EasyWiki',
        script: 'app/app.js',
        autorestart: true,
        watch: ["config.json", "dev-config.json", "app"],
        max_memory_restart: '1G',
        "wait_ready": true,
        env: {
            NODE_ENV: 'development',
            watch: ["dev-config.json", "app"],
            instances: 1
        },
        env_production: {
            NODE_ENV: 'production',
            watch: ["app"],
            instances: 4
        }
    }]
};