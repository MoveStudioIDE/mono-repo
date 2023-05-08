import { useEffect, useState } from "react";
import BuildPageSidebar from "../components/BuildPageSidebar";
import Header from "../components/Header";
import PageLayout from "../components/PageLayout";
import { Project } from "../types/project-types";
import axios from "axios";
import { IndexedDb } from "../db/ProjectsDB";
import BuildCanvas from "../components/BuildCanvas";
import ScaleLoader from "react-spinners/ScaleLoader";
import va from '@vercel/analytics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:80/';

function BuildPage() {



  const [projectList, setProjectList] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [compiledModules, setCompiledModules] = useState<string[]>([]);
  const [compileError, setCompileError] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [showTestResults, setShowTestResults] = useState(false);
  const [autoCompile, setAutoCompile] = useState(false);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [toast, setToast] = useState<JSX.Element | undefined>();
  const [code, setCode] = useState('');

  // Initialize indexedDb
  let indexedDb: IndexedDb;
  useEffect(() => {
    const startIndexDb = async () => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      
      const existingUser = localStorage.getItem('user');
      console.log('existingUser', existingUser);
      if (!existingUser) {
        console.log('setting user');
        localStorage.setItem('user', 'true');
        await indexedDb.putValue('projects', {
          package: 'demoPackage',
          dependencies: [
            {name: 'demoPackage', address: '0x0'},
            {name: 'Sui', address: '0x02'}
          ],
          modules: [
            {
              name: 'party', 
              code: `module demoPackage::party {

  // Libraries being used
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::TxContext;

  // Object that can be deployed
  struct Balloon has key {
    id: UID,
    popped: bool
  }

  // Deploy a new balloon
  fun init(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  public entry fun pop_balloon(balloon: &mut Balloon) {
    balloon.popped = true;
  }

  public entry fun fill_up_balloon(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  // Create a new balloon object and make it available to anyone
  fun new_balloon(ctx: &mut TxContext) {
    let balloon = Balloon{
      id: object::new(ctx), 
      popped: false
    };
    transfer::share_object(balloon);
  }
            
  }`
            }
          ]
        }); 
        // startTutorial();
      }
         
    }
    startIndexDb().then(() => {
      getProjects();
    });
  }, []);

  //---Helpers---//
  const getProjects = async () => {
    indexedDb = new IndexedDb('test');
    await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
    const allProjects = await indexedDb.getAllKeys('projects');
    console.log('projectList', allProjects);
    setProjectList(allProjects);
  }

  const getProjectData = async (project: string) => {
    indexedDb = new IndexedDb('test');
    await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
    const projectData = await indexedDb.getValue('projects', project);
    setCurrentProject(projectData);
    // console.log('projectData', projectData);
    // return projectData;
  }

  const compileCode = () => {
    
    setToast(
      <div className="alert alert-info">
        <div>
          <ScaleLoader
            color={"#003e4d"}
            height={20}
            // width={15}
          />
          <span className="normal-case" style={{color: 'hsl(var(--inc))'}} >Compiling...</span>
        </div>
      </div>
    )

    setCompileError('');
    setCompiledModules([]);
    setShowError(false);
    setShowTestResults(false);
    if (!currentProject) {
      return;
    }

    // vercel analytics
    va.track('clickCompile', {projectName: currentProject.package});

    console.log('compiling with backend: ', BACKEND_URL);

    axios.post(`${BACKEND_URL}compile`, currentProject).then((res) => {
      const compileResults = res.data as string | string[];
      console.log('res', compileResults);
      if (typeof compileResults === 'string') {
        setCompiledModules([]);
        setCompileError(compileResults);

        setToast(
          <div className="alert alert-error">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Compile failed</span>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => {
                  console.log()
                  if (currentProject == null || currentProject.modules == null) {
                    return;
                  }
                  if (activeModules.length == 0) {
                    console.log('no active modules')
                    addActiveModulesHandler(currentProject.modules[0].name);
                  }
                  setShowError(true);
                }}
              >
                View
              </button>
              <button onClick={() => setToast(undefined)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
          </div>
        </div>
        )

        return;
      }

      setToast(
        <div className="alert alert-success">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Package compiled</span>
          <button onClick={() => setToast(undefined)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      )

      setCompiledModules(compileResults);
      setCompileError('');
    });


    // console.log('herhererere')
    // if (runTutorial && stepIndex === 5) {
    //   console.log('setting step 6')
    //   setStepIndex(6);
    // }
  }

  const testProject = () => {
    
    setToast(
      <div className="alert alert-info">
        <div>
          <ScaleLoader
            color={"#003e4d"}
            height={20}
            // width={15}
          />
          <span className="normal-case" style={{color: 'hsl(var(--inc))'}} >Testing...</span>
        </div>
      </div>
    )

    setCompileError('');
    setCompiledModules([]);
    setShowError(false);
    setShowTestResults(false);
    if (!currentProject) {
      return;
    }

    // vercel analytics
    va.track('clickTest', {projectName: currentProject.package});

    console.log('testing with backend: ', BACKEND_URL);

    axios.post(`${BACKEND_URL}test`, currentProject).then((res) => {
      const testResults = res.data as {
        result: string;
        errorCode: string;
        error: boolean;
      };
      console.log('res test', testResults);

      // if (testResults.error == 2) {
      //   setToast(
      //     <div className="alert alert-error">
      //     <div>
      //       <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      //       <span>No tests to run</span>
      //       <button onClick={() => setToast(undefined)}>
      //         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      //       </button>
      //     </div>
      //   </div>
      //   )
      //   return;
      // }

      if (testResults.error) {
        setToast(
          <div className="alert alert-error">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Compilation error</span>
            <button onClick={() => setToast(undefined)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        )
        return;
      }

      // if (testResults.split('\n')[0].includes("UPDATING GIT DEPENDENCY")) {
      //   console.log("UPDATING GIT DEPENDENCY")
      //   testResults = testResults.replace("UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git\n", "")
      // }
            

      if (!testResults.result.includes("Running Move unit tests")) {
        setTestResults("Clear warnings and errors to run tests:\n\n" + testResults.errorCode.replace("UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git\n", ""));
      } else {
        setTestResults(testResults.result.replace("UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git\n", ""));
      }

      setToast(
        <div className="alert alert-warning">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Tests complete</span>
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => {
              console.log()
              if (currentProject == null || currentProject.modules == null) {
                return;
              }
              if (activeModules.length == 0) {
                console.log('no active modules')
                addActiveModulesHandler(currentProject.modules[0].name);
              }
              setShowTestResults(true);
            }}
          >
            View
          </button>
          <button onClick={() => setToast(undefined)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      )

      // setCompiledModules(compileResults);
      // setCompileError('');
    });


    // console.log('herhererere')
    // if (runTutorial && stepIndex === 5) {
    //   console.log('setting step 6')
    //   setStepIndex(6);
    // }
  }

  useEffect(() => {
    if (currentProject && currentProject.modules.length > 0 && currentModule == null && activeModules.length == 0) {
      setActiveModules([currentProject.modules[0].name])
      setCurrentModule(currentProject.modules[0].name);
    }
  }, [currentProject]);
  

  //---Handlers---//

  // Create a new module with the same code as the given module
  const handleDuplicateModule = async (module: string) => {
    if (!currentProject) {
      return;
    }

    const newModuleName = prompt('Enter new module name');
    if (!newModuleName) {
      return;
    }

    const moduleCode = currentProject.modules.find((m) => m.name === module)?.code || '';

    const duplicateModuleInDB = async () => {
      setCurrentModule(null);

      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      await indexedDb.addNewModule('projects', currentProject.package, newModuleName);
      await indexedDb.updateModule('projects', currentProject.package, newModuleName, moduleCode);
    }

    duplicateModuleInDB().then(() => {
        getProjectData(currentProject.package);
        // setActiveModules([...activeModules, newModuleName])
        // setCurrentModule(newModuleName);
        // setCode('');
        setShowError(false);
        setCompileError('');
        setCompiledModules([]);
        setShowTestResults(false);
        // setActiveModules([...activeModules, newModuleName])
        setToast(undefined)
    });

  }

  const handleNewCode = (newCode: string, module: string) => {
    const updateModuleInIndexdb = async (newCode: string) => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      if (!currentProject || !currentModule) {
        console.log('f')
        return;
      }
      await indexedDb.updateModule('projects', currentProject.package, currentModule, newCode);
    }
    if (!currentProject || !currentModule) {
      console.log('f')
      console.log('currentProject', currentProject);
      console.log('currentModule', currentModule);
      return;
    }

    console.log('heere')
    // console.log('handling code', newCode);
    console.log('currentModule', currentModule);
    console.log('module to update', module);

    // setCompileError('');
    // setToast(undefined);
    // setCompiledModules([]);


    updateModuleInIndexdb(newCode).then(() => {
      getProjectData(currentProject.package);
    }).then(() => {
      if(autoCompile) {
        compileCode();
      }
    });
    setCode(newCode);
  }

  // Function to duplicate a project with the same modules and dependencies
  const handleDuplicateProject = async () => {
    const newProjectName = prompt('Enter new project name');
    if (!newProjectName) {
      return;
    }

    if (!currentProject) {
      return;
    }
    
    const duplicateToIndexDB = async (newProjectName: string) => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      await indexedDb.putValue('projects', {
        package: newProjectName,
        dependencies: [
          {name: newProjectName, address: '0x0'},
          ...currentProject.dependencies.filter((dep) => dep.name !== currentProject.package)
        ],
        modules: currentProject.modules
      });
    }

    duplicateToIndexDB(newProjectName).then(async () => {
      await getProjects();
      await getProjectData(newProjectName);
    });
  }


  // Function to change the name of the current project
  const handleProjectNameChange = (newName: string) => {
    if (!currentProject) {
      return;
    }
    const updateProjectNameInIndexdb = async (newName: string) => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      await indexedDb.putValue('projects', {
        package: newName,
        dependencies: [
          {name: newName, address: '0x0'},
          ...currentProject.dependencies.filter((dep) => dep.name !== currentProject.package)
        ],
        modules: currentProject.modules
      });
      await indexedDb.deleteValue('projects', currentProject.package);
    }

    // Make sure project name is unique
    if (projectList.includes(newName)) {
      alert('Project name already exists');
      return;
    }

    updateProjectNameInIndexdb(newName).then(async () => {
      await getProjects();
      await getProjectData(newName);
    });
  }

  const handleProjectChange = (projectChange: string) => {
    setActiveModules([]);
    if (projectChange === '**default') {
      setCurrentProject(null);
      setCurrentModule(null);
      setCode('')
      console.log('default');
    } else if (projectChange === '**addProject') {

      setCurrentProject(null);
      setCurrentModule(null);
      setCode('');
      console.log('addProject');
      const addToIndexdb = async (newProjectName: string) => {
        indexedDb = new IndexedDb('test');
        await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
        await indexedDb.putValue('projects', {
          package: newProjectName,
          dependencies: [
            {name: newProjectName, address: '0x0'},
            {name: 'Sui', address: '0x02'}
          ],
          modules: []
        });
      }
      const newProjectName = prompt('Enter project name');
      if (!newProjectName) {
        return;
      }

      // Make sure project name is unique
      if (projectList.includes(newProjectName)) {
        alert('Project name already exists');
        return;
      }

      // Make sure project name starts with a letter
      if (!newProjectName.match(/^[a-zA-Z]/)) {
        alert('Project name must start with a letter');
        return;
      }

      // Make sure project name is alphanumeric
      if (!newProjectName.match(/^[a-zA-Z0-9_]+$/)) {
        alert('Project name must be alphanumeric');
        return;
      }

      addToIndexdb(newProjectName).then(() => {
        getProjects();
      });
      
      // getProjectData(newProjectName || 'project1');
    } else {
      console.log('projectChange', projectChange);

      setCurrentProject(null);
      setCurrentModule(null);
      setCode('');
      setShowError(false);
      setCompileError('');
      setCompiledModules([]);
      setShowTestResults(false);
      console.log('newProject', projectChange);
      getProjectData(projectChange);
    }
  }

  const handleProjectDelete = (projectName: string) => {
    const removeFromIndexdb = async (projectName: string) => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      await indexedDb.deleteValue('projects', projectName);
    }
    removeFromIndexdb(projectName).then(() => {
      setCurrentProject(null);
      setCurrentModule(null);
      setCode('')
      getProjects();
      setActiveModules([]);
      setShowError(false);
      setCompileError('');
      setCompiledModules([]);
      setShowTestResults(false);
    });
  }

  const handleModuleChange = (module: string) => {
    if (module === '0') {
      setCurrentModule(null);
      setCode('')
      console.log('default');
    } else if (module.startsWith('1')) {
      console.log('addModule:', module.slice(1));
      const addModuleToIndexdb = async (newModuleName: string) => {
        await setCurrentModule(null);
        setCode('')
        indexedDb = new IndexedDb('test');
        await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
        if (!currentProject) {
          console.log('f')
          return;
        }
        console.log('indexdb', indexedDb);
        console.log('currentProject', currentProject);
        console.log('currentModule', currentModule);
        console.log('code', code);
        await indexedDb.addNewModule('projects', currentProject.package, newModuleName);
      }
      if (!currentProject) {
        console.log('f')
        return;
      }
      const newModuleName = module.slice(1)
      if (!newModuleName) {
        console.log('f')
        return;
      }
      addModuleToIndexdb(newModuleName).then(() => {
        getProjectData(currentProject.package);
        setActiveModules([...activeModules, newModuleName])
        setCurrentModule(newModuleName);
        setCode('');
        setShowError(false);
        setCompileError('');
        setCompiledModules([]);
        setShowTestResults(false);
        // setActiveModules([...activeModules, newModuleName])
        setToast(undefined)
        // setCompileError('');
        // setCompiledModules([]);
      });
      // setCurrentModule(null);
      // setCode('');
      
    } else {
      console.log('newModule', module);
      if (!currentProject) {
        console.log('f')
        return;
      }
      
      setCurrentModule(module);
      console.log('new module set', currentModule);

      // setCode(currentProject.modules.find((m) => m.name === module)?.code || '');

      // console.log('code set', code);
      // setCurrentModuleCode(currentProject.modules.find((m) => m.name === module)?.code || '');
    }
  }

  useEffect(() => {
    if (!currentProject || !currentModule) {
      console.log('f')
      return;
    }

    setCode(currentProject.modules.find((m) => m.name === currentModule)?.code || '');
    console.log('code set', code);
  }, [currentModule])


  const handleModuleDelete = (moduleName: string) => {

    // Get confirmation from user
    if (window.confirm(`Are you sure you want to delete ${moduleName}?`) == false) {
      return;
    }

    const removeModuleFromIndexdb = async (moduleName: string) => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      if (!currentProject) {
        return;
      }
      await indexedDb.deleteModule('projects', currentProject.package, moduleName);
    }
    if (!currentProject) {
      return;
    }
    removeModuleFromIndexdb(moduleName).then(() => {
      getProjectData(currentProject.package);
      removeActiveModuleHandler(moduleName);
    });
    // setCurrentModule(null);
    // setCode('')
    setShowError(false);
    setCompileError('');
    setCompiledModules([]);
    setShowTestResults(false);
    // Remove form active modules
    // setActiveModules(activeModules.filter((m) => m !== moduleName));


    // if (runTutorial && stepIndex === 5) {
    //   setStepIndex(6);
    // }
  }

  const handleDependencyAdd = (dependencyName: string, dependencyAddress: string) => {
    const addDependencyToIndexdb = async (dependencyName: string, dependencyAddress: string) => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      if (!currentProject) {
        return;
      }
      await indexedDb.addNewDependency('projects', currentProject.package, dependencyName, dependencyAddress);
    }
    if (!currentProject) {
      return;
    }
    addDependencyToIndexdb(dependencyName, dependencyAddress).then(() => {
      getProjectData(currentProject.package);
    });
  }

  const handleDependencyRemove = (dependencyName: string) => {

    // Get confirmation from user
    if (window.confirm(`Are you sure you want to delete the ${dependencyName} dependency?`) == false) {
      return;
    }

    const removeDependencyFromIndexdb = async (dependencyName: string) => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      if (!currentProject) {
        return;
      }
      await indexedDb.deleteDependency('projects', currentProject.package, dependencyName);
    }
    if (!currentProject) {
      return;
    }
    removeDependencyFromIndexdb(dependencyName).then(() => {
      getProjectData(currentProject.package);
    });
  }

  const resetCache = async () => {
    const confirmReset = window.confirm("This will clear all of your projects and reset the demo project. Press OK to continue.")

    if (confirmReset === false) {
      alert('Reset cancelled.')
      return;
    }

    handleProjectChange('**default');

    indexedDb = new IndexedDb('test');
    await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});

    await indexedDb.deleteObjectStore('projects');

    localStorage.clear();
    window.location.reload();
  }

  const resetDemo = async () => {
    handleProjectChange('**default');

    indexedDb = new IndexedDb('test');
    await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
    await indexedDb.deleteValue('projects', 'demoPackage');

    await indexedDb.putValue('projects', {
          package: 'demoPackage',
          dependencies: [
            {name: 'demoPackage', address: '0x0'},
            {name: 'Sui', address: '0x02'}
          ],
          modules: [
            {
              name: 'party', 
              code: `module demoPackage::party {

  // Libraries being used
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::TxContext;

  // Object that can be deployed
  struct Balloon has key {
    id: UID,
    popped: bool
  }

  // Deploy a new balloon
  fun init(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  public entry fun pop_balloon(balloon: &mut Balloon) {
    balloon.popped = true;
  }

  public entry fun fill_up_balloon(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  // Create a new balloon object and make it available to anyone
  fun new_balloon(ctx: &mut TxContext) {
    let balloon = Balloon{
      id: object::new(ctx), 
      popped: false
    };
    transfer::share_object(balloon);
  }
            
}`
            }
          ]
        }); 
  }

  const addActiveModulesHandler = (moduleName: string) => {
    if (!currentProject) {
      return;
    }

    // Check if module already exists
    if (activeModules.includes(moduleName)) {
      handleModuleChange(moduleName);
      return;
    }

    setActiveModules([...activeModules, moduleName]);

    handleModuleChange(moduleName);

  }

  const removeActiveModuleHandler = async (moduleName: string) => {
    if (!currentProject) {
      return;
    }

    const newActiveModules = activeModules.filter((module) => module !== moduleName);
    await setActiveModules(newActiveModules);

    if (newActiveModules.length > 0) {
      await handleModuleChange(newActiveModules[0]);
    }
  }

  return (
    <div>
      <PageLayout 
        header={<Header showSettings={true} resetCache={resetCache} resetDemo={resetDemo}/>}
        sidebar={
          <BuildPageSidebar
            projectList={projectList}
            currentProject={currentProject}
            currentModule={currentModule}
            compiledModules={compiledModules}
            compileError={compileError}
            activeModules={activeModules}
            compileCode={compileCode} 
            testProject={testProject}
            addActiveModules={addActiveModulesHandler}
            changeProject={handleProjectChange}
            changeProjectName={handleProjectNameChange}
            deleteProject={handleProjectDelete}
            duplicateProject={handleDuplicateProject}
            changeModule={handleModuleChange}
            deleteModule={handleModuleDelete}
            duplicateModule={handleDuplicateModule}
            addDependency={handleDependencyAdd}
            removeDependency={handleDependencyRemove}
          />
        }
        canvas={
          <BuildCanvas
            currentProject={currentProject}
            currentModule={currentModule}
            compiledModules={compiledModules}
            compileError={compileError}
            showError={showError}
            testResults={testResults}
            showTestResults={showTestResults}
            code={code}
            toast={toast}
            activeModules={activeModules}
            setShowError={setShowError}
            setShowTestResults={setShowTestResults}
            removeActiveModule={removeActiveModuleHandler}
            setCode={handleNewCode} 
            changeModule={handleModuleChange}
            deleteModule={handleModuleDelete}
          />
        }
      />
      <div className="toast toast-end">
        {!showError && !showTestResults && toast}
      </div>
    </div>
  )
}

export default BuildPage;