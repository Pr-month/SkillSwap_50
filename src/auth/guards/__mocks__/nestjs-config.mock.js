module.exports = {
  registerAs: (key, factory) => Object.assign(factory, { KEY: key }),
  ConfigService: class ConfigService {},
};
