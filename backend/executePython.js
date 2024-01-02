const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const executePython = async (filePath) => {
  const jobId = path.basename(filePath).split(".")[0];

  return new Promise((resolve, reject) => {
    exec(`python ${filePath}`, (error, stdout, stderr) => {
      error && reject({ error, stderr });
      stderr && reject({ stderr });
      resolve(stdout);
    });
  });
};

module.exports = { executePython };
