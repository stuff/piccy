var merge = require("lodash/merge");

// sensible information for shipit are in that file :)
var secret = require("./shipit-secret");

module.exports = (shipit) => {
  require("shipit-deploy")(shipit);

  shipit.initConfig(
    merge(
      {
        default: {
          repositoryUrl: "git@github.com:stuff/piccy.git",
        },
      },
      secret
    )
  );

  shipit.blTask("install", async () => {
    await shipit.remote(`
        source ./.zshrc
        echo "node: $(node -v)"
        echo "yarn: $(yarn -v)"
        echo " "
        cd ./${shipit.releasePath}
        yarn install
    `);
  });

  shipit.blTask("build", async () => {
    await shipit.remote(`
        source ./.zshrc
        export REACT_APP_ANALYTIC_ID="${secret.config.analyticsId}"
        cd ./${shipit.releasePath}
        yarn build:editor
    `);
  });

  shipit.on("deployed", () => {
    shipit.start(["install", "build"]);
  });
};
