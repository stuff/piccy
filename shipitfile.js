module.exports = shipit => {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      deployTo: './apps/piccy.site',
      repositoryUrl: 'git@github.com:stuff/piccy.git',
      key: '~/.ssh/id_rsa'
    },
    production: {
      servers: `stuff@51.15.165.99`
    }
  });

  shipit.blTask('install', async () => {
    await shipit.remote(`
        source ./.zshrc
        echo "node: $(node -v)"
        echo "yarn: $(yarn -v)"
        echo " "
        cd ./${shipit.releasePath}
        yarn install
    `);
  });

  shipit.blTask('build', async () => {
    await shipit.remote(`
        source ./.zshrc
        cd ./${shipit.releasePath}
        yarn workspace @stuff/piccy-editor build
    `);
  });

  shipit.blTask('restart', async () => {
    await shipit.remote(`
        pm2 restart piccy
    `);
  });

  shipit.on('deployed', () => {
    shipit.start(['install', 'build', 'restart']);
  });
};
