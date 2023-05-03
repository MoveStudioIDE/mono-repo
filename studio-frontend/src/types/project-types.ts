

export interface Project {
  package: string;
  dependencies: Dependency[];
  modules: Module[];
}

export interface Dependency {
  name: string;
  address: string;
}

export interface Module {
  name: string;
  code: string;
}

export interface DeployedPackageInfo {
  id: string,
  name: string, 
  address: string | undefined
}