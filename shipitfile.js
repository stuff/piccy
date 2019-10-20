module.exports = shipit => {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      deployTo: './apps/piccy.site',
      repositoryUrl: 'git@github.com:stuff/piccy.git',
      key: '~/.ssh/id_rsa'
    },
    production: {
      servers: `stuff@piccy.site`
    }
  });

  shipit.blTask('yarn:install', async () => {
    await shipit.remote(`
        source ./.zshrc
        echo "node: $(node -v)"
        echo "yarn: $(yarn -v)"
        echo " "
        cd ./${shipit.releasePath}
        yarn install
    `);
  });

  shipit.blTask('build:client', async () => {
    await shipit.remote(`
        source ./.zshrc
        cd ./${shipit.releasePath}
        yarn workspace @stuff/piccy-editor build
    `);
  });

  shipit.on('deployed', () => {
    shipit.start(['yarn:install', 'build:client']);
  });
};
