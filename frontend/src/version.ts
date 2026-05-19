import pkg from "../package.json"

export const VERSION = pkg.version
export const CODENAME = (pkg as typeof pkg & { codename?: string }).codename
export const VERSION_LABEL =
  `alpha ${VERSION}` + (CODENAME ? ` «${CODENAME}»` : "")
