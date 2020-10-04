/**
 * Deploy the contents of the `/build` folder to GitHub Pages.
 */

const task = require("./task"),
    deploy = require("./deploy.gh"),
    party = process.env.party,
    web = process.env.web || party + ".xceder.com",
    env = {
        endpoint: process.env.endpoint,
        build: process.env.build,

        sourceMapPath: "./sourceMaps/" + party + "/",
        distFolder: "build/" + party,
        CNAME: web,
        url: "https://github.com/xcedertechnology/" + party + ".git",
    };

if (!party) throw "must specify the party parameter";

module.exports = task("deploy " + party, () => {
    return deploy(env);
});
