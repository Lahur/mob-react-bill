const { withGradleProperties } = require('@expo/config-plugins');
const os = require('os');
const path = require('path');

const JAVA_HOME_KEY = 'org.gradle.java.home';

function resolveJdk17Home() {
  return process.env.ANDROID_GRADLE_JAVA_HOME ?? path.join(os.homedir(), '.sdkman/candidates/java/17.0.20-tem');
}

module.exports = function withGradleJavaHome(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === JAVA_HOME_KEY),
    );
    config.modResults.push({ type: 'property', key: JAVA_HOME_KEY, value: resolveJdk17Home() });
    return config;
  });
};
