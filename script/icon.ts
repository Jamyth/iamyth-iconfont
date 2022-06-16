import fs from "fs";
import path from "path";
import yargs from "yargs";
import generate from "svgtofont";
import { createConsoleLogger } from "@iamyth/logger";

const logger = createConsoleLogger("Icon Generator");

const FileDirectory = {
    src: path.join(__dirname, "..", "icons"),
    dist: path.join(__dirname, "..", "fonts"),
};

async function run() {
    const argument = yargs.parseSync();

    const projectName = argument._[0];

    if (typeof projectName === "number") {
        logger.error(["Project name must be string, got", `${projectName}`], true);
        process.exit(1);
    }

    const project = path.resolve(FileDirectory.src, projectName);
    const outDir = path.resolve(FileDirectory.dist, projectName);

    if (!fs.existsSync(project) || !fs.statSync(project).isDirectory()) {
        logger.error(["Project name does not exist in src/"], true);
        process.exit(1);
    }

    if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
        logger.info("Output directory is not found, generating...");
        fs.mkdirSync(outDir, { recursive: true });
    } else {
        logger.info("Output directory is not empty, cleaning...");
        fs.rmSync(outDir, { recursive: true });
    }

    logger.task("Generating Icons...");

    await generate({
        src: project,
        dist: outDir,
        fontName: projectName,
        css: true,
    });

    logger.task("Icon Generation Completes, Congratulations !");
}

run();
