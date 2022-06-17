import fs from "fs";
import path from "path";
import { createConsoleLogger } from "@iamyth/logger";

const FileDirectory = {
    src: path.join(__dirname, "..", "icons"),
};

export function renameAssets() {
    const logger = createConsoleLogger("Rename Helper");
    const directories = fs.readdirSync(FileDirectory.src);

    logger.task("Scanning icons/");
    const projectFolders = directories.filter((_) => fs.statSync(path.join(FileDirectory.src, _)).isDirectory());

    for (const project of projectFolders) {
        const location = path.join(FileDirectory.src, project);
        logger.task(`Scanning icons/${project} for svg files`);
        const files = fs.readdirSync(location);
        const svgs = files.filter((_) => _.endsWith(".svg"));
        svgs.forEach((fileName) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- name is present
            const nameWithoutExtension = fileName.split(".svg").shift()!;
            // TODO/ add case for '&'
            const newName = nameWithoutExtension.toLowerCase().replace(/&/g, "").replace(/ /g, "-");
            if (newName !== nameWithoutExtension) {
                logger.info(`Rename ${nameWithoutExtension} -> ${newName}`);
                fs.renameSync(path.join(location, fileName), path.join(location, `${newName}.svg`));
            }
        });
    }

    logger.task("All asset have been renamed.");
}

renameAssets();
