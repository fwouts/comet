# Release manager

This is a dashboard to easily compare branches and tags for any GitHub repository.

## Instructions

_Note: installation steps will soon be a lot more straightforward._

### 1. Install Yarn

Follow the [official instructions](https://yarnpkg.com/en/docs/install).

### 2. Clone the repository

```
git clone https://github.com/zenclabs/release-manager.git
cd release-manager
yarn install
```

### 3. Create a file called `src/config.ts`

Your config file will contain three constants:

```
// Token generated from https://github.com/settings/tokens with the "repo" permission.
export const GITHUB_TOKEN = "=.......................";

// Organisation or user who owns the GitHub repository.
export const OWNER = "facebook";

// Name of the GitHub repository.
export const REPO = "react";
```

### 4. Start the local server

```
yarn start
```

The release manager will then be available at http://localhost:3000.
