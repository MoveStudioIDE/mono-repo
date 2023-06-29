import axios from 'axios';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DeployedPackageInfo, Project } from '../types/project-types';
// import './DeployCanvas.css'
import {DeployedPackage, DeployedObject, ObjectNode, PackageNode} from './DeployedObjects'
import { ScaleLoader } from 'react-spinners';
import LoadingOverlay from 'react-loading-overlay-ts';
import { useWallet } from '@suiet/wallet-kit';

import ReactFlow, { Background, Controls, MiniMap, applyEdgeChanges, applyNodeChanges, useNodesState, useStore } from 'reactflow';
import 'reactflow/dist/style.css';
import DeployCanvasContextMenu from './DeployCanvasContextMenu';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:80/';

// const initialNodes = [
//   {
//     id: '1',
//     data: { label: 'Hello' },
//     position: { x: 0, y: 0 },
//     type: 'input',
//   },
//   {
//     id: '2',
//     data: {
//       id: '2',
//       address: '0x123',
//       modules: {},
//       packageName: 'test',
//       refreshHandler: () => {},
//       setPendingTxn: () => {},
//       setSuccessTxn: () => {},
//       setFailTxn: () => {},
//       removeDeployedObject: () => {},
//       dragStartHandler: () => {},
//       dragEnterHandler: () => {},
//       dragLeaveHandler: () => {},
//       dropHandler: () => {},
//       useSuiVision: false
//     },
//     position: { x: 100, y: 100 },
//     type: 'package'
//   },
// ];

// const initialEdges = [{ id: '1-2', source: '1', target: '2', label: 'to the', type: 'step' }];
let id = 0;
const getId = () => `dndnode_${id++}`;

function DeployCanvas (
  props: {
    projectList: string[],
    currentProject: Project | null,
    changeProject: (project: string) => void,
    publishPackage: () => void,
    addExistingObject: (objectId: string) => void,
    addFromTransactions: (transactionId: string) => void,
    compileError: string,
    // theme: string,
    deployedObjects: DeployedPackageInfo[],
    toasts: JSX.Element | undefined,
    isOverlayActive: boolean,
    setIsOverlayActive: (isOverlayActive: boolean) => void,
    setPendingTxn: () => void,
    setSuccessTxn: (digest: string) => void,
    setFailTxn: (digest: string) => void,
    removeDeployedObject: (id: string) => void,
    rearrangeDeployedObjects: (draggedId: string, draggedOverId: string) => void,
    useSuiVision: boolean,
    dropped: () => void
  }
) {


  // const [deployedObjects, setDeployedObjects] = useState<(JSX.Element | undefined)[]>()
  const [draggedId, setDraggedId] = useState<string | undefined>(undefined)
  const [draggedOverId, setDraggedOverId] = useState<string | undefined>(undefined)

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [loading, setLoading] = useState<boolean>(false);

  const nodeTypes = useMemo(() => ({ package: PackageNode, object: ObjectNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // const [edges, setEdges] = useState(initialEdges);

  // const onNodesChange = useCallback(
  //   (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds) as any),
  //   []
  // );
  // const onEdgesChange = useCallback(
  //   (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds) as any),
  //   []
  // );

  const wallet = useWallet();
  // const {
  //   getObject, 
  //   getNormalizedMoveModulesByPackage
  // } = useSuiProvider(wallet.chain?.rpcUrl || '');

  useEffect(() => {
    
    updateDeployedObjects();

  }, [props.deployedObjects]);

  useEffect(() => {
   props.setIsOverlayActive(false); 
   setLoading(false);
  }, [nodes])

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // useEffect(() => {
  //   document.addEventListener('contextmenu',(event) => {
  //     event.preventDefault();
  //     console.log(event.type);
  //   });
  // }, []);

  const onDrop = () => {
    props.dropped()
  }


  // const onDrop = useCallback(
  //   (event: any) => {
  //     event.preventDefault();

  //     if (reactFlowInstance === null || reactFlowWrapper.current === null) {
  //       return;
  //     }

  //     const reactFlowBounds = (reactFlowWrapper.current as any).getBoundingClientRect();
  //     const type = event.dataTransfer.getData('application/reactflow');

  //     // check if the dropped element is valid
  //     if (typeof type === 'undefined' || !type) {
  //       return;
  //     }

  //     const position = (reactFlowInstance as any).project({
  //       x: event.clientX - reactFlowBounds.left,
  //       y: event.clientY - reactFlowBounds.top,
  //     });
  //     const newNode = {
  //       id: getId(),
  //       type,
  //       position,
  //       data: { label: `${type} node` },
  //     };

  //     setNodes((nds) => nds.concat(newNode));
  //   },
  //   [reactFlowInstance]
  // );

  const updateDeployedObjects = async () => {
    props.setIsOverlayActive(true);
    setLoading(true);
    const objects = props.deployedObjects.map(async (deployedPackageInfo) => {

      const objectId = deployedPackageInfo.address;
      const id = deployedPackageInfo.id;

      if (objectId == undefined) {
        return;
      }

      console.log('objectId', objectId)

      // return getObject(objectId).then((objectData) => {
      //   console.log('objectData', objectData);

      // }).catch((err) => {
      //   console.log(err)
      // });
    
      let res;

      // HOTFIX: retry until object is founded
      try {
        res = await axios.post(`${BACKEND_URL}object-details`, {objectId: objectId, rpc: wallet.chain?.rpcUrl});
        if (res == undefined || res.data.error != undefined) {
          // console.log('not removing')
          // props.removeDeployedObject(id)
        }
        // break;
      } catch (err) {
        console.log(err)
      }

      // const res = await axios.post(`${BACKEND_URL}object-details`, {objectId: objectId, rpc: wallet.chain?.rpcUrl});

      // return axios.post(`${BACKEND_URL}object-details`, {objectId: objectId, rpc: wallet.chain?.rpcUrl}).then((res) => {
      console.log('res', res);
      if (res == undefined || res.data.error != undefined) {
        console.log('removing')
        props.removeDeployedObject(id)
        return;
      }

      const objectData = res.data.data.content
      // const shared = res.data.details.owner.hasOwnProperty('Shared')
      if (objectData.dataType == 'package') {

        return axios.post(`${BACKEND_URL}package-details`, {packageId: objectId, rpc: wallet.chain?.rpcUrl}).then((res) => {

          const packageDetails = res.data;

          // return <DeployedPackage
          //   id={id}
          //   address={objectId}
          //   modules={packageDetails}
          //   packageName={deployedPackageInfo.name}
          //   refreshHandler={updateDeployedObjects}
          //   setPendingTxn={props.setPendingTxn}
          //   setSuccessTxn={props.setSuccessTxn}
          //   setFailTxn={props.setFailTxn}
          //   removeDeployedObject={props.removeDeployedObject}
          //   dragStartHandler={handleDragStart}
          //   dragEnterHandler={handleDragEnter}
          //   dragLeaveHandler={handleDragLeave}
          //   dropHandler={handleDrop}
          //   useSuiVision={props.useSuiVision}
          // />;

          return {
            id: id,
            data: {
              id: id,
              address: objectId,
              modules: packageDetails,
              packageName: deployedPackageInfo.name,
              refreshHandler: updateDeployedObjects,
              setPendingTxn: props.setPendingTxn,
              setSuccessTxn: props.setSuccessTxn,
              setFailTxn: props.setFailTxn,
              removeDeployedObject: props.removeDeployedObject,
              // dragStartHandler: handleDragStart,
              // dragEnterHandler: handleDragEnter,
              // dragLeaveHandler: handleDragLeave,
              // dropHandler: handleDrop,
              useSuiVision: props.useSuiVision
            },
            position: { x: 100, y: 100 },
            type: 'package'
          }

        }); 

        
      } else if (objectData.dataType == 'moveObject') {
        const fullName = objectData.type;
        let structType = fullName.split('<').pop().split('>')[0]
        const fullNameWithoutStruct = fullName.split('<')[0]
        const splitFullName = fullNameWithoutStruct.split('::');
        console.log("SPLIT FULL NAME", splitFullName)
        console.log("STRUCT TYPE", structType)

        if (!(fullName.includes('<') && fullName.includes('>'))) {
          structType = undefined
        }
        
        // return <DeployedObject
        //   address={objectId}
        //   fields={objectData.fields}
        //   packageAddress={splitFullName[0]}
        //   moduleName={splitFullName[1]}
        //   objectName={splitFullName[2]}
        //   typeParameter={structType}
        //   shared={false}//shared}
        //   updateHandler={updateObjectByAddress}
        //   dragStartHandler={handleDragStart}
        //   dragEnterHandler={handleDragEnter}
        //   dragLeaveHandler={handleDragLeave}
        //   dropHandler={handleDrop}
        //   refreshHandler={updateDeployedObjects}
        //   id={id}
        //   removeDeployedObject={props.removeDeployedObject}
        //   useSuiVision={props.useSuiVision}
        // />;

        return {
          id: id,
          data: {
            address: objectId,
            fields: objectData.fields,
            packageAddress: splitFullName[0],
            moduleName: splitFullName[1],
            objectName: splitFullName[2],
            typeParameter: structType,
            shared: false,//shared}
            updateHandler: updateObjectByAddress,
            // dragStartHandler: handleDragStart,
            // dragEnterHandler: handleDragEnter,
            // dragLeaveHandler: handleDragLeave,
            // dropHandler: handleDrop,
            refreshHandler: updateDeployedObjects,
            id: id,
            removeDeployedObject: props.removeDeployedObject,
            useSuiVision: props.useSuiVision
          },
          position: { x: 100, y: 100 },
          type: 'object'
        }
      }
    });
    // });

    Promise.all(objects).then(async (objects) => {
      await setNodes(objects as any);
    });

    // await props.setIsOverlayActive(false);
    // props.setLoading(false);

  }

  const updateObjectByAddress = async (address: string) => {
    // console.log('refreshing', address)
    // await props.setIsOverlayActive(true);

    // if (nodes == undefined) {
    //   return
    // }
    // for (let object of nodes) {
    //   console.log(object)

    //   if (object.data.address == address) {
    //     axios.post(`${BACKEND_URL}object-details`, {objectId: address}).then((res) => {
    //     console.log('object details res', res);
    //     if (res == undefined || res.data.status != 'Exists') {
    //       return;
    //     }

    //     const objectData = res.data.details.data;
    //     // const shared = res.data.details.owner.hasOwnProperty('Shared')
    //     if (objectData.dataType == 'package') {
    //       return;
    //     } else if (objectData.dataType == 'moveObject') {
    //       const fullName = objectData.type;
    //       let structType = fullName.split('<').pop().split('>')[0]
    //       const fullNameWithoutStruct = fullName.split('<')[0]
    //       const splitFullName = fullNameWithoutStruct.split('::');
    //       console.log("SPLIT FULL NAME", splitFullName)
    //       console.log("STRUCT TYPE", structType)

    //       if (!(fullName.includes('<') && fullName.includes('>'))) {
    //         structType = undefined
    //       }
          
    //       object = <DeployedObject
    //         address={address}
    //         fields={objectData.fields}
    //         packageAddress={splitFullName[0]}
    //         moduleName={splitFullName[1]}
    //         objectName={splitFullName[2]}
    //         shared={false}//shared}
    //         typeParameter={structType}
    //         updateHandler={updateObjectByAddress}
    //         dragStartHandler={handleDragStart}
    //         dragEnterHandler={handleDragEnter}
    //         dragLeaveHandler={handleDragLeave}
    //         dropHandler={handleDrop}
    //         refreshHandler={updateDeployedObjects}
    //         id={object?.props.id}
    //         removeDeployedObject={props.removeDeployedObject}
    //         useSuiVision={props.useSuiVision}
    //       />;
    //     }
    //   });
    //   }
    // }
  }

  // const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
  //   console.log('drag start', e.currentTarget.id)
    
  //   setDraggedId(e.currentTarget.id)
  //   e.dataTransfer.setData('draggedId', e.currentTarget.id)

  //   console.log('dataTransfer', e.dataTransfer.items)

  // }

  // const handleDragStop = (e: React.DragEvent<HTMLDivElement>) => {
  //   console.log('drag stop', e.currentTarget.id)

  //   setDraggedId(undefined)
  //   // e.dataTransfer.clearData()
  // }

  // const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
  //   console.log('drag enter', e.currentTarget.id)

  //   e.preventDefault()

  //   setDraggedOverId(e.currentTarget.id)
  //   e.dataTransfer.setData('draggedOverId', e.currentTarget.id)

  //   console.log('dataTransfer', e.dataTransfer.items)

  // }

  // const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  //   console.log('drag leave', e.currentTarget.id)

  //   setDraggedOverId(undefined)
  //   // e.dataTransfer.clearData('draggedOverId')
  // }

  // const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  //   console.log('drop', e.currentTarget.id)
  //   console.log('dataTransfer', e.dataTransfer.items)
  //   const draggedId = e.dataTransfer.getData('draggedId')
  //   const draggedOverId = e.currentTarget.id;
  //   console.log('draggedId', draggedId)
  //   console.log('draggedOverId', draggedOverId)
  //   if (draggedId == undefined || draggedOverId == undefined) {
  //     return;
  //   }

  //   props.rearrangeDeployedObjects(draggedId, draggedOverId)
  // }

  return (
      // <LoadingOverlay 
      //   className="flex flex-auto flex-wrap justify-center content-center items-center min-w-full min-h-full"  
      //   active={props.isOverlayActive}
      //   spinner={
      //     <ScaleLoader
      //       // color={SPINNER_COLORS[props.theme].primaryAndSecondary[Math.floor(Math.random() * SPINNER_COLORS[props.theme].primaryAndSecondary.length)]}
      //       color="#003e4d"
      //     />
      //   }
      //   text='Loading objects...'
      //   fadeSpeed={100}
      //   styles={{
      //     overlay: (base) => ({
      //       ...base,
      //       background: 'hsl(var(--b3))',
      //       opacity: '0.7',
      //     }),
      //     // wrapper: {
      //     //   width: '90%',
      //     //   height: '100%',
      //     // }
      //   }}
      // >
        <div id='deplyAndInteractMenu' style={{ height: '100%' }}>
            <DeployCanvasContextMenu
              targetId='deplyAndInteractMenu'
              projectList={props.projectList}
              changeProject={props.changeProject}
              addExistingObject={props.addExistingObject}
              addFromTransactions={props.addFromTransactions}
              publishPackage={props.publishPackage}
              currentProject={props.currentProject}
              compileError={props.compileError}
            />
            <ReactFlow 
              nodes={nodes}
              onNodesChange={onNodesChange}
              nodeTypes={nodeTypes}
              // edges={edges}
              // onEdgesChange={onEdgesChange}
              onInit={setReactFlowInstance as any}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              {/* <LoadingOverlay
                active={props.isOverlayActive}
                spinner={
                  <ScaleLoader
                    // color={SPINNER_COLORS[props.theme].primaryAndSecondary[Math.floor(Math.random() * SPINNER_COLORS[props.theme].primaryAndSecondary.length)]}
                    color="#003e4d"
                  />
                }
                text='Loading objects...'
                fadeSpeed={100}
                styles={{
                  overlay: (base) => ({
                    ...base,
                    background: 'hsl(var(--b3))',
                    opacity: '0.7',
                  }),
                }}
              > */}
                <Background />
                
                <Controls />
                {/* <MiniMap /> */}
              {/* </LoadingOverlay> */}
            </ReactFlow>
            <div className="toast toast-center">
              { 
                loading && 
                <div className="alert alert-loading">
                  <div>
                    <ScaleLoader
                      color={"#003e4d"}
                      height={20}
                      // width={15}
                    />
                    <span  className="normal-case">Loading</span>
                  </div>
                </div>
              }
            </div>
            <div className="toast toast-end">
              {props.toasts}
            </div>
        </div>
        
        // <div className="toast toast-end">
        //   {props.toasts}
        // </div>
      // </LoadingOverlay>
    
  )
}

export default DeployCanvas