const Queue = require("bull");
const Job = require("./models/job.model");
const { executeCpp } = require("./executeCpp");
const { executeJs } = require("./executeJs");
const { executePython } = require("./executePython");
const fs = require("fs");
const path = require("path");

const jobQueue = new Queue("job-queue");
const NUM_WORKER = 5;

jobQueue.process(NUM_WORKER, async ({ data }) => {
  console.log("data", data);
  const { id } = data;
  const job = await Job.findById(id);
  if (job === undefined || job === null) {
    throw new Error("Job not found");
  }

  try {
    job["startedAt"] = new Date();
    // execute the file
    let output;
    if (job.language === "cpp") {
      output = await executeCpp(job.filePath);
    } else if (job.language === "js") {
      output = await executeJs(job.filePath);
    } else {
      output = await executePython(job.filePath);
    }
    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;

    await job.save();
  } catch (e) {
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(e);
    await job.save();
  }
  return true;
});

const outputPath = path.join(__dirname, "codes");

jobQueue.on("completed", async (job, result) => {
  // delete the file
  console.log("job completed");

  const jobId = job.data.id;
  const jobf = await Job.findById(jobId);
  console.log("filePath", jobf);
  const filePath = jobf.filePath;
  const base = path.basename(filePath);
  const pathx = path.join(outputPath, base);
  console.log("base", pathx);
  fs.unlink(pathx, (err) => {
    if (err) {
      console.log("err in deleting file", err);
    }
  });
  // fs.rm(filePath, (err) => {
  //   if (err) {
  //     console.log("err in deleting file", err);
  //   }
  // });
});

jobQueue.on("failed", (err) => {
  console.log("job failed", err);
});

const addJobQueue = async (jobId) => {
  await jobQueue.add({ id: jobId });
};

module.exports = { addJobQueue };
