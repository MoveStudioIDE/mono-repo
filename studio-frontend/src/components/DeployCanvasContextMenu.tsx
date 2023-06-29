import { isValidTransactionDigest } from "@mysten/sui.js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";


export default function DeployCanvasContextMenu (
  props: {
    projectList: any;
    changeProject(value: any): unknown;
    addExistingObject(objectId: string): unknown;
    addFromTransactions(value: string): unknown;
    publishPackage(): unknown;
    currentProject: null;
    compileError: string;
    targetId: string, 
  },
) {

  const [contextData, setContextData]= useState({ visible:false, posX: 0, posY: 0})
  const contextRef= useRef(null)
  const [isValidObjectId, setIsValidObjectId] = useState(false);
  const [isInputValidTransactionDigest, setIsInputValidTransactionDigest] = useState(false);

  useEffect(() => {
    const contextMenuEventHandler= (event: any) => {
      console.log('contextMenuEventHandler')
      const targetElement= document.getElementById(props.targetId)
      console.log('targetElement', targetElement)
      console.log('event.target', event.target)
      console.log('contains', targetElement?.contains(event.target))
      if(targetElement && targetElement.contains(event.target)){
        console.log('here')
        event.preventDefault();
        console.log('event.clientX', event.clientX)
        console.log('event.clientY', event.clientY)
        setContextData({ visible: true, posX: event.clientX, posY: event.clientY })
      }else if(contextRef.current && !(contextRef.current as any).contains(event.target)){
        setContextData({ ...contextData, visible: false })
      }
    }

    const offClickHandler= (event: any) => {
      if(contextRef.current && !(contextRef.current as any).contains(event.target)){
        setContextData({ ...contextData, visible: false })
      }
    }

    document.addEventListener('contextmenu', contextMenuEventHandler)
    document.addEventListener('click', offClickHandler)
    return () => {
      document.removeEventListener('contextmenu', contextMenuEventHandler)
      document.removeEventListener('click', offClickHandler)
    }
  }, [contextData, props.targetId])

  useLayoutEffect(() => {
    if(contextData.posX + (contextRef.current as any)?.offsetWidth > window.innerWidth){
      setContextData({ ...contextData, posX: contextData.posX - (contextRef.current as any)?.offsetWidth})
    }
    if(contextData.posY + (contextRef.current as any)?.offsetHeight > window.innerHeight){
      setContextData({ ...contextData, posY: contextData.posY - (contextRef.current as any)?.offsetHeight})
    }
  }, [contextData])


  const projects = props.projectList.map((project: string) => {
    return <option value={project}>{project}</option>
  });

  const verifyObjectId = (event: any) => {
    const objectId = event.target.value;

    // Make sure object ID starts with 0x
    if (objectId.slice(0,2) != '0x') {
      setIsValidObjectId(false);
      return;
    }

    // make sure object id is alphanumeric
    const regex = /^[0-9a-fA-F]+$/;
    if (!regex.test(objectId.slice(2))) {
      setIsValidObjectId(false);
      return;
    }

    setIsValidObjectId(true);
  }

  const verifyTransactionDigest = (event: any) => {
    const transactionDigest = event.target.value;
    
    setIsInputValidTransactionDigest(isValidTransactionDigest(transactionDigest));
  }

  const handleProjectChange = (event: any) => {
    console.log('handleProjectChange', event.target.value);
    props.changeProject(event.target.value);


    // Empty the select element if addProject is selected
    if (event.target.value === 'addProject') {
      event.target.value = 'default';
      // event.target.value =
    }
  }

  
  const handleObjectAdd = () => {
    const objectId = (document.getElementById('addObjectInput') as HTMLInputElement).value;

    if (objectId == '' || objectId == undefined) {
      return;
    }

    // if (objectId.length != 42) {
    //   alert('Object ID must be 64 characters long');
    //   return;
    // }

    if (objectId.slice(0,2) != '0x') {
      alert('Object ID must start with 0x');
      return;
    }

    props.addExistingObject(objectId);

    // clear input field
    (document.getElementById('addObjectInput') as HTMLInputElement).value = '';
  }

  const handleSuiPackageAdd = () => {
    const addObjectInput = (document.getElementById('addObjectInput') as HTMLInputElement);
    addObjectInput.value = "0x2";

    handleObjectAdd();
  }

  const hanldeTransactionDigestAdd = () => {
    const addObjectInput = (document.getElementById('addTransactionInput') as HTMLInputElement);

    if (addObjectInput.value == '' || addObjectInput.value == undefined) {
      return;
    }

    props.addFromTransactions(addObjectInput.value);

    // clear input field
    addObjectInput.value = '';
  }


  const handlePackagePublish = (event: any) => {
    props.publishPackage();

    // set select back to default
    const select = document.getElementById('projectSelector') as HTMLSelectElement;
    select.value = '**default';
  }

  return (
    <div 
      ref={contextRef} 
      style={{ display:`${contextData.visible ? 'block' : 'none'}`, left: contextData.posX, top: contextData.posY }}
      className="absolute z-50 border border-accent bg-base-100 shadow-xl rounded-2xl p-2"
    >
      <div style={{display: "flex", justifyContent: "space-around"}}>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Deploy package</span>
          </label>
          <div className="input-group input-group-xs w-full">
            <select 
              name="project" 
              id="projectSelector"
              onChange={handleProjectChange}
              className="input input-bordered input-success w-full max-w-xs input-xs focus:outline-none"
            >
              <option value="**default">--Select a package--</option>
              {projects}
            </select>
            <button 
              onClick={handlePackagePublish} 
              className="btn btn-xs btn-success btn-outline tutorial-deploy-publish-button"
              disabled={props.currentProject == null || props.compileError != ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="arcs"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21"/><path d="M16 16l-4-4-4 4"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div style={{marginTop:"0px", marginBottom:"5px"}} >
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">Add existing package or object</span>
          </label>
          <div className="input-group input-group-xs">
            <input 
              id="addObjectInput"
              type="text" 
              placeholder="0x000...000" 
              className="input input-bordered input-warning w-full max-w-xs input-xs focus:outline-none font-mono"
              onChange={verifyObjectId}
            />
            <button 
              className="btn btn-xs btn-outline btn-warning" 
              onClick={handleObjectAdd}
              disabled={!isValidObjectId}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="arcs"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8M12 19.8V12M16 17l-4 4-4-4"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={handleSuiPackageAdd}
          className="btn btn-xs btn-warning btn-outline badge"
        >
          Add Sui Package
        </button>
      </div>
      <div style={{marginTop:"0px", marginBottom:"5px"}}>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">Add from transaction digest</span>
          </label>
          <div className="input-group input-group-xs">
            <input 
              id="addTransactionInput"
              type="text" 
              placeholder="transaction digest" 
              className="input input-bordered input-warning w-full max-w-xs input-xs focus:outline-none font-mono"
              onChange={verifyTransactionDigest}
            />
            <button 
              className="btn btn-xs btn-outline btn-warning" 
              onClick={hanldeTransactionDigestAdd}
              disabled={!isInputValidTransactionDigest}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="arcs"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8M12 19.8V12M16 17l-4 4-4-4"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}