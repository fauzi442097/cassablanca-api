const { isNullOrUndefined } = require("./helper");

const parseEnv = (name, defaultVal) => {
  let env = process.env[name];
  if (!env) {
    if (isNullOrUndefined(defaultVal)) {
      throw new Error(`Missing environment variable for ${name}`);
    }
    env = defaultVal;
  }

  return env;
};

const parseEnvNumber = (name, defaultVal) => {
  const number = parseInt(parseEnv(name, `${defaultVal}`));
  if (isNaN(number)) {
    throw new Error(`Bad environment variable for ${name}: Not a Number`);
  }
  return number;
};

const parseEnvBoolean = (name, defaultVal) => {
  return parseEnv(name, `${defaultVal}`).toLowerCase() === "true";
};

module.exports = {
  parseEnv,
  parseEnvNumber,
  parseEnvBoolean,
};
