const { PythonShell } = require("python-shell");
const path = require("path");

function runPythonScript(argsObject) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: "text",
      pythonOptions: ["-u"],
      scriptPath: path.resolve(__dirname, "../routers"),
      args: [JSON.stringify(argsObject)],
    };

    PythonShell.run("a.py", options, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = runPythonScript;
