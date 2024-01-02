const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = async (filePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}`);

  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filePath} -o ${outPath} && cd ${outputPath} && ${outPath}`,
      (error, stdout, stderr) => {
        error && reject({ error, stderr });
        stderr && reject({ stderr });
        resolve(stdout);
      }
    );
  });
};

module.exports = { executeCpp };
