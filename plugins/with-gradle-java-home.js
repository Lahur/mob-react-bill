const { withGradleProperties } = require('@expo/config-plugins');
const fs = require('fs');
const os = require('os');
const path = require('path');

const JAVA_HOME_KEY = 'org.gradle.java.home';

function resolveJdk17Home() {
  return process.env.ANDROID_GRADLE_JAVA_HOME ?? path.join(os.homedir(), '.sdkman/candidates/java/17.0.20-tem');
}

// Only pin org.gradle.java.home when the resolved JDK actually exists on this machine.
// Remote builders (e.g. EAS) have their own JDK layout, so this is a local-dev-only override.
module.exports = function withGradleJavaHome(config) {
  const jdkHome = resolveJdk17Home();
  if (!fs.existsSync(jdkHome)) {
    return config;
  }

  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === JAVA_HOME_KEY),
    );
    config.modResults.push({ type: 'property', key: JAVA_HOME_KEY, value: jdkHome });
    return config;
  });
};
