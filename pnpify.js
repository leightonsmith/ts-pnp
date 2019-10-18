let pnp;
try {
  // If we're in PnP, run pnpify so typescript thinks it's fetching 
  // absolute imports from node_modules/ rather than the yarn cache.
  pnp = require(`pnpapi`);
  const pnpify = require(`@yarnpkg/pnpify`);
  pnpify.patchFs();
} catch (error) {
  // not in PnP; not a problem
}

function resolveModuleName(request, issuer, compilerOptions, moduleResolutionHost, parentResolver) {

  const topLevelLocation = pnp.getPackageInformation(pnp.topLevel).packageLocation;

  const [, prefix = ``, packageName = ``, rest] = request.match(/^(!(?:.*!)+)?((?!\.{0,2}\/)(?:@[^\/]+\/)?[^\/]+)?(.*)/);


  let failedLookupLocations = [];

  // First we try the resolution on "@types/package-name" starting from the project root
  if (packageName) {
    const typesPackagePath = `@types/${packageName.replace(/\//g, `__`)}${rest}`;

    const finalResolution = parentResolver(typesPackagePath, issuer, compilerOptions, moduleResolutionHost);

    if (finalResolution.resolvedModule || finalResolution.resolvedTypeReferenceDirective) {
      return finalResolution;
    } else {
      failedLookupLocations = failedLookupLocations.concat(finalResolution.failedLookupLocations);
    }
  }

  // Then we try on "package-name", this time starting from the package that makes the request
  if (true) {
    const regularPackagePath = `${packageName || ``}${rest}`;

    const finalResolution = parentResolver(regularPackagePath, issuer, compilerOptions, moduleResolutionHost);

    if (finalResolution.resolvedModule || finalResolution.resolvedTypeReferenceDirective) {
      return finalResolution;
    } else {
      failedLookupLocations = failedLookupLocations.concat(finalResolution.failedLookupLocations);
    }
  }

  return {
    resolvedModule: undefined,
    resolvedTypeReferenceDirective: undefined,
    failedLookupLocations,
  };
}

module.exports.resolveModuleName = pnp
  ? resolveModuleName
  : (moduleName, containingFile, compilerOptions, compilerHost, resolveModuleName) =>
      resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost);

