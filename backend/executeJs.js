const { exec } = require("child_process");

const executeJs = async (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`node ${filePath}`, (error, stdout, stderr) => {
      error && reject({ error, stderr });
      stderr && reject({ stderr });
      resolve(stdout);
    });
  });
};

module.exports = { executeJs };
