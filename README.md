# EasyWiki
EasyWiki is wiki software designed with simplicity and easy.

It is powered by git, bulma and nodejs, and has a very easy setup process.

EasyWiki is also fully customizable. You can use any bulma theme and there are also a few included with the wiki.

## Installation
1. Download the latest release and extract it.

2. Go to config.json you should see the follwing configuration:

```json
{
    "Style":
    {
        "title": "EasyWiki",
        "theme": "lux-light"
    },
    "Web":
    {
        "port": 443,
        "cookieSecret": "password",
        "ssl":
        {
            "key": "ssl/ssl.key",
            "cert": "ssl/ssl.crt"
        }
    },
    "Gitter":
    {
        "repo": "https://github.com/WatcherWhale/EasyWiki-Testrepo.git"
    }
}
```

3. Change everything to your liking.

4. Now add your ssl certificates to the correct location (default: `<easywiki dir>/ssl`).

5. Open a terminal here and type `npm start`, EasyWiki should now start.