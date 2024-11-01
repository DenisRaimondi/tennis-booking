const { execSync } = require("child_process");

const switchAccount = (environment) => {
  try {
    console.log(`🔄 Switching to ${environment} environment...`);

    // Usa il tuo account per test, l'account prod verrà configurato in seguito
    if (environment === "test") {
      console.log("Using test environment");
      execSync("firebase use test", { stdio: "inherit" });
    } else if (environment === "prod") {
      console.log("Using production environment");
      execSync("firebase use prod", { stdio: "inherit" });
    }

    console.log(`✅ Successfully switched to ${environment} environment`);
  } catch (error) {
    console.error(`❌ Error switching environment:`, error.message);
    process.exit(1);
  }
};

const environment = process.argv[2];
if (!environment || !["test", "prod"].includes(environment)) {
  console.error("Please specify environment: test or prod");
  process.exit(1);
}

switchAccount(environment);
