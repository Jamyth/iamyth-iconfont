# @iamyth/icon-generator

## Background
Since [`iconfont`](https://iconfont.cn/) is dead for a couple of days in June 2022 and [`icomoon`](https://icomoon.io/app/#/select) has less features
for free user, I decided to create a repository with some scripts that will have the same capability of the above applications.

## Structure

```bash
.
├── fonts                    # out folder for the font generation
├── icons                    # src folder of the projects of svg
│   ├── projects_a           # Separate Projects... 
│   ├── projects_b           
│   └── projects_c           
└── script                   # Generation and utility scripts are here
    ├── rename.ts            # A simple script that will convert the filename into snake case
    └── icon.ts              # Core script to generate font, css, html
```

## Usage

1. Create folders in `/icons` to indicate a `project`, and puts all related svg into that folder.
2. Run rename script to rename the svgs
```bash
> npm run rename
  or
> yarn run rename
  or
> pnpm run rename
```
3. Run icon script to generate the font
```bash
> npm run icon <project-name>
  or
> yarn run icon <project-name>
  or
> pnpm run icon <project-name>
```
4. copy the generated files to the project.
