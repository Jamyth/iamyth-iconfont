import fs from "fs";
import path from "path";
import yargs from "yargs";
import generate from "svgtofont";
import { Utility, PrettierUtil } from "@iamyth/devtool-utils";
import { createConsoleLogger } from "@iamyth/logger";

class IconGenerator {
    private readonly logger = createConsoleLogger("Icon Generator");

    private readonly projectName = String(yargs.parseSync()._[0]);
    private readonly templateDirectory = path.join(__dirname, "template");
    private readonly iconsDirectory = path.join(__dirname, "..", "icons");
    private readonly fontDirectory = path.join(__dirname, "..", "fonts");

    private projectDirectory: string = "";
    private outputDirectory: string = "";
    private cssContent: string = "";
    private iconClassList: string[] = [];

    async run() {
        try {
            this.checkPrecondition();
            this.prepareOutputDirectory();
            await this.generateContent();
            this.getContent();
            this.parseClassList();
            this.removeUnwantedFiles();
            this.generateReactComponent();
            this.generateCSS();
            this.formatDocument();
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(error);
            } else {
                console.error(error);
            }
            process.exit(1);
        }
    }

    private checkPrecondition() {
        this.logger.task("Checking Preconditions...");

        const projectDirectory = path.join(this.iconsDirectory, this.projectName);
        const outputDirectory = path.join(this.fontDirectory, this.projectName);
        if (this.projectName === "undefined") throw new Error("Project name must be provided as the first argument");
        if (!this.isValidDirectory(projectDirectory)) throw new Error("Project is not a valid directory");

        this.projectDirectory = projectDirectory;
        this.outputDirectory = outputDirectory;
    }

    private prepareOutputDirectory() {
        this.logger.task(["Copying template files to", this.outputDirectory]);
        Utility.prepareEmptyDirectory(this.outputDirectory);

        for (const file of fs.readdirSync(this.templateDirectory)) {
            const srcPath = path.join(this.templateDirectory, file);
            const distPath = path.join(this.outputDirectory, path.basename(file, ".template"));
            fs.copyFileSync(srcPath, distPath);
        }
    }

    private async generateContent() {
        this.logger.task("Generating Icon Fonts...");
        await generate({
            src: this.projectDirectory,
            dist: this.outputDirectory,
            fontName: this.projectName,
            css: true,
            svgicons2svgfont: {
                fontHeight: 1000,
                normalize: true,
            },
        });
    }

    private getContent() {
        const cssFilePath = path.join(this.outputDirectory, `${this.projectName}.css`);
        this.cssContent = fs.readFileSync(cssFilePath, { encoding: "utf-8" });
    }

    private parseClassList() {
        this.logger.task("Parsing CSS Icon Classlist...");
        const classNameReg = new RegExp(`.${this.projectName}-(.*):before`, "g");
        this.iconClassList =
            this.cssContent.match(classNameReg)?.map((_) => _.substring(1).replace(":before", "")) ?? [];
        this.logger.info(["Parsed CSS class, total", String(this.iconClassList.length)]);
    }

    private removeUnwantedFiles() {
        this.logger.task("Removing unwanted files...");
        const cssExtensions = ["css", "less", "module.less", "scss", "styl"];
        const fontExtensions = ["eot", "svg", "symbol.svg", "woff2"];

        for (const ext of [...cssExtensions, ...fontExtensions]) {
            const filePath = path.join(this.outputDirectory, `${this.projectName}.${ext}`);
            fs.unlinkSync(filePath);
        }
    }

    private generateReactComponent() {
        this.logger.task("Generating React Component...");
        const filePath = path.join(this.outputDirectory, "index.tsx");

        Utility.replaceTemplate(filePath, [
            this.iconClassList.map((_) => `${this.classNameToEnum(_)} = "${_}",`).join("\n"),
            this.projectName,
        ]);
    }

    private generateCSS() {
        this.logger.task("Generating CSS File");
        const filePath = path.join(this.outputDirectory, "iconfont.css");
        const reg = new RegExp(`\\.${this.projectName}-(.|\n)*?\\}`, "g");

        const importSource = [
            `url("./${this.projectName}.ttf") format("truetype")`,
            `url("./${this.projectName}.woff") format("woff")`,
        ];
        Utility.replaceTemplate(filePath, [
            importSource.join(","),
            this.projectName,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- strict format
            this.cssContent
                .match(reg)!
                .map((_) => `.g-${this.projectName}-icon`.concat(_))
                .join("\n"),
        ]);
    }

    private formatDocument() {
        this.logger.task("Formatting output directory...");
        PrettierUtil.format(this.outputDirectory);
    }

    private isValidDirectory(pathLike: string) {
        return fs.existsSync(pathLike) && fs.statSync(pathLike).isDirectory();
    }

    private classNameToEnum(className: string) {
        const reg = new RegExp(`^${this.projectName}-[a-z\\d]+(-[a-z\\d]+)*$`);
        if (!reg.test(className)) {
            throw new Error(`${className} does not conform to naming convention`);
        }
        // (projectName + _).length
        return className
            .substring(this.projectName.length + 1)
            .replace(/-/g, "_")
            .toUpperCase();
    }
}

// run();

new IconGenerator().run();
