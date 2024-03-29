import { useState } from 'react';
import PackageFunction from './PackageFunction';
import copyIcon from "../icons/copy-24.png";
import copyIcon2 from "../icons/copy2-24.png";
import { shortenAddress, shortenWord } from '../utils/address-shortener';
import PackageStruct from './PackageStruct';
import { useWallet } from '@suiet/wallet-kit';
import { network } from '../utils/network';

export function DeployedPackage (
  props: {
    id: string,
    address: string,
    modules: object,
    packageName: string,
    refreshHandler: () => void,
    setPendingTxn: () => void,
    setSuccessTxn: (digest: string) => void,
    setFailTxn: (digest: string) => void,
    removeDeployedObject: (id: string) => void,
    dragStartHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    dragEnterHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    dragLeaveHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    dropHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    useSuiVision: boolean
  }
) {

  const [selectedFunction, setSelectedFunction] = useState<object | null>(null);
  const [selectedStruct, setSelectedStruct] = useState<object | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const wallet = useWallet();
  
  

  const structs = Object.entries(props.modules).flatMap((module: [string, object]) => {
    return Object.entries(module[1]).flatMap((moduleDetails: [string, object]) => {
      if (moduleDetails[0] == 'structs') {
        return Object.entries(moduleDetails[1]).map((struct: [string, object]) => {
          return (
            <option className='font-mono' value={`${module[0]}::${struct[0]}`}>{`${module[0]}::${struct[0]}`}</option>
          )
        });
      }
    });
  });

  const functions = Object.entries(props.modules).flatMap((module: [string, object]) => {
    return Object.entries(module[1]).flatMap((moduleDetails: [string, object]) => {
      if (moduleDetails[0] == 'exposedFunctions') {
        console.log('moduleDetails[1]', moduleDetails[1])
        return Object.entries(moduleDetails[1]).map((func: [string, object]) => {
          return (
            <option className='font-mono' value={`${module[0]}::${func[0]}`}>{`${module[0]}::${func[0]}`}</option>
          )
        });
      }
    });
  });

  const entryFunctions = Object.entries(props.modules).flatMap((module: [string, object]) => {
    console.log('module', module)
    return Object.entries(module[1]).flatMap((moduleDetails: [string, object]) => {
      console.log('moduleDetails', moduleDetails)
      if (moduleDetails[0] == 'exposedFunctions') {
        console.log('moduleDetails[1]', moduleDetails[1])
        return Object.entries(moduleDetails[1]).map((func: [string, object]) => {
          if ((func[1] as any).isEntry) {
            return (
              <option className='font-mono' value={`${module[0]}::${func[0]}`}>{`${module[0]}::${func[0]}`}</option>
            )
          }
        });
      }
    });
  });


  const handleDetailChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

    if (event.target.value == 'package details') {
      setSelectedFunction(null);
      setSelectedModule(null);
      setSelectedStruct(null);
      return;
    }

    // get optgroup label
    const optgroup = event.target.selectedOptions[0].parentElement as HTMLOptGroupElement;
    const optgroupLabel = optgroup.label;

    const selected = event.target.value;
    const selectedModule = selected.split('::')[0];
    const selectedDetail = selected.split('::')[1];

    if (optgroupLabel == 'Package structs') {
      const selectedStructDetails = (props.modules as any)[selectedModule].structs[selectedDetail];
      selectedStructDetails.name = selectedDetail;
      setSelectedStruct(selectedStructDetails);
      setSelectedFunction(null);
      console.log('selectedStructDetails', selectedStructDetails)
    } else if (optgroupLabel == 'Package all functions' || optgroupLabel == 'Package entry functions') {
      const selectedFunctionDetails = (props.modules as any)[selectedModule].exposedFunctions[selectedDetail];
      selectedFunctionDetails.name = selectedDetail;
      setSelectedFunction(selectedFunctionDetails);
      setSelectedStruct(null);
    }

    setSelectedModule(selectedModule);
  }

  return (
    <div 
      id={props.id}
      className="card h-min max-h-max w-max bg-neutral shadow-xl card-bordered card-compact grid-item" 
      style={{overflow: "auto", margin: "10px"}}
      draggable="true"
      onDragStart={props.dragStartHandler}
      onDragOver={props.dragEnterHandler}
      onDrop={props.dropHandler}
    >
      <div className="card-body">
        <div className="card-actions justify-end">
          <a className="link link-hover" href={ props.useSuiVision && wallet.chain?.name != 'Sui Devnet' ? `https://${wallet.chain?.name == 'Sui Testnet' ? 'testnet.' : ''}suivision.xyz/package/${props.address}` : `https://explorer.sui.io/object/${props.address}?network=${network[wallet.chain?.name || 'Sui Devnet']}`} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-square btn-sm" >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><g fill="none" fill-rule="evenodd"><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h5M15 3h6v6M10 14L20.2 3.8"/></g></svg>            
            </button>
          </a> 
          <button className="btn btn-square btn-sm" onClick={() => props.removeDeployedObject(props.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div>
          <h1 className="card-title text-center text-neutral-content">{props.packageName}</h1>
          <div>
            <h2 className='font-semibold'>Address:</h2>
            <p className="text-center text-neutral-content font-mono text-opacity-90">
              {shortenAddress(props.address, 5)}
              <label 
                tabIndex={0} 
                className="btn btn-circle btn-ghost btn-xs text-info" 
                onClick={async () => {
                  navigator.clipboard.writeText(props.address)
                  console.log('clipboard', await navigator.clipboard.readText())
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </label>
            </p>
          </div>
          <select
            name="details" 
            id="detailSelector"
            onChange={handleDetailChange}
            style={{marginTop:"5px", marginBottom:"5px"}}
            className="select w-full select-xs "
          >
            <option value="package details">Package Details</option>
            <optgroup label="Package structs">
              {structs}
            </optgroup>
            <optgroup label="Package entry functions">
              {entryFunctions}
            </optgroup>
            <optgroup label="Package all functions">
              {functions}
            </optgroup>
          </select>
          {
            selectedFunction != null && 
            <div>
              <PackageFunction
                functionDetails={selectedFunction}
                packageAddress={props.address}
                moduleName={selectedModule || ''}
                refreshHandler={props.refreshHandler}
                setPendingTxn={props.setPendingTxn}
                setSuccessTxn={props.setSuccessTxn}
                setFailTxn={props.setFailTxn}
              />
            </div>
          }
          {
            selectedStruct != null && 
            <div>
              <PackageStruct
                structDetails={selectedStruct}
                packageAddress={props.address}
                moduleName={selectedModule || ''}
              />
            </div>
          }
        </div>
        <div className="card-actions justify-end text-neutral-content">
          <div className="badge badge-outline">Package</div> 
        </div>
      </div>
    </div>
  )
}

export function DeployedObject (
  props: {
    id: string,
    address: string,
    fields: object,
    packageAddress: string,
    moduleName: string,
    objectName: string,
    shared: boolean,
    typeParameter: string | undefined,
    updateHandler: (address: string) => void,
    dragStartHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    dragEnterHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    dragLeaveHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    dropHandler: (event: React.DragEvent<HTMLDivElement>) => void,
    refreshHandler: () => void,
    removeDeployedObject: (id: string) => void,
    useSuiVision: boolean,
  }
) {

  const wallet = useWallet();

  const fieldListEntries = Object.entries(props.fields).map((field) => {

    if (field[0] === 'id') {
      return;
    }

    console.log('field', field);

    // TODO: hard fix - fix to be robust for nested structs
    if (field[1] === null) {
      return (
        <tr>
          <td className='font-mono whitespace-normal break-words text-center'>{field[0]}</td>
          <td className='font-mono whitespace-normal break-words  text-center'>{field[1]}</td>
        </tr>
      )
    } else if (Array.isArray(field[1])) {

      
      return (
        <tr>
          <td className='font-mono whitespace-normal break-words text-center'>{field[0]}</td>
          <td className='font-mono whitespace-normal break-words text-center'>{JSON.stringify(field[1], null, 2)}</td>
        </tr>
      )
    } else if (typeof field[1] == 'object') {
      // console.log('field[1]', field[1])
      // console.log('typeof field[1]', typeof field[1])
      if (field[1].id != undefined) {
        return (
          <tr>
            <td className='font-mono whitespace-normal break-words text-center'>{field[0]}</td>
            <td className='font-mono whitespace-normal break-words text-center'>{field[1].id}</td>
          </tr>
        )
      } else {

        const typeSplit = field[1].type.split('::')
        const packageAddress = typeSplit[0]
        const moduleName = typeSplit[1]
        const structName = typeSplit[2]

        console.log('field[1]', field[1])

        return (
          <tr>
            <td className='font-mono whitespace-normal break-words text-center'>{field[0]}</td>
            <td style={{display: 'flex', flexDirection: 'row', flexWrap: "wrap", justifyContent: "center"}}>
              {
                field[1].fields != undefined &&
                Object.entries(field[1].fields).map((field: any) => {

                  if (typeof field[1] === 'object') {
                    if (field[1].id != undefined) {
                      return (
                        <div className="form-control w-min m-1 shadow-xl">
                          <label className="input-group input-group-vertical input-group-xs">
                            <span className='font-mono flex-row justify-center' >{field[0]}</span>
                            <p className="input input-bordered input-xs text-center font-mono" >
                              {shortenAddress(field[1].id, 2)}
                              {
                                field[1].id.toString().length > 0 &&
                                <label
                                  tabIndex={0}
                                  className="btn btn-circle btn-ghost btn-xs text-info"
                                  onClick={async () => {
                                    navigator.clipboard.writeText(field[1].id.toString())
                                    console.log('clipboard', await navigator.clipboard.readText())
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                </label>
                              }
                            </p>
                          </label>
                        </div>
                      )
                      return;
                    } else {
                      return;
                    }
                  }

                  return (
                    <div className="form-control w-fit m-1 shadow-xl">
                      <label className="input-group input-group-vertical input-group-xs">
                        <span className='font-mono text-center flex-row justify-center' >{field[0]}</span>
                        <p className="input input-bordered input-xs text-center font-mono whitespace-normal break-words h-fit" >
                          {field[1]}
                          {
                            field[1].toString().length > 0 &&
                            <label 
                              tabIndex={0} 
                              className="btn btn-circle btn-ghost btn-xs text-info" 
                              onClick={async () => {
                                navigator.clipboard.writeText(field[1].toString())
                                console.log('clipboard', await navigator.clipboard.readText())
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                            </label>
                          }
                        </p>
                      </label>
                    </div>
                  )
                })
              }
            </td>
          </tr>
        )
      }
    }

    return (
      <tr >
        <td className='font-mono whitespace-normal break-words  text-center'>{field[0]}</td>
        <td className='font-mono max-w-[15rem] whitespace-normal break-words text-center'>
          {field[1].toString()}
          {
            field[1].toString().length > 0 &&
            <label 
              tabIndex={0} 
              className="btn btn-circle btn-ghost btn-xs text-info ml-1" 
              onClick={async () => {
                navigator.clipboard.writeText(field[1].toString())
                console.log('clipboard', await navigator.clipboard.readText())
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
            </label>
          }
        </td>
      </tr>
    )
  }).filter((field) => field != undefined);

  const refreshHandler = async () => {
    console.log('refresh')
    props.refreshHandler()
  }

  return (
    <div 
      className="card h-min max-h-90 w-max bg-neutral shadow-xl card-bordered card-compact" 
      style={{overflow: "auto", margin: "10px"}}
      draggable="true"
      onDragStart={props.dragStartHandler}
      onDragOver={props.dragEnterHandler}
      onDrop={props.dropHandler}
      id={props.id}
    >
      <div className="card-body">
        <div className="card-actions justify-end">
          <button className="btn btn-square btn-sm" onClick={refreshHandler}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"> <path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          </button>
          <a className="link link-hover" href={ props.useSuiVision && wallet.chain?.name != 'Sui Devnet' ? `https://${wallet.chain?.name == 'Sui Testnet' ? 'testnet.' : ''}suivision.xyz/object/${props.address}` : `https://explorer.sui.io/object/${props.address}?network=${network[wallet.chain?.name || 'Sui Devnet']}`} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-square btn-sm" >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><g fill="none" fill-rule="evenodd"><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h5M15 3h6v6M10 14L20.2 3.8"/></g></svg>            
            </button>
          </a> 
          <button className="btn btn-square btn-sm" onClick={() => props.removeDeployedObject(props.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div>
          <h1 className="card-title text-center text-neutral-content">{props.objectName}</h1>
          <h2 className='font-semibold'>Address: </h2>
          <p className="text-center text-neutral-content font-mono text-opacity-90">
            {shortenAddress(props.packageAddress, 3)}
            ::
            {props.moduleName}
            ::
            {shortenAddress(props.address, 3)}
            <label 
              tabIndex={0} 
              className="btn btn-circle btn-ghost btn-xs text-info" 
              onClick={async () => {
                navigator.clipboard.writeText(props.address)
                console.log('clipboard', await navigator.clipboard.readText())
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
            </label>
          </p>
          { 
            props.typeParameter != undefined &&
            <div>
              <h2 className='font-semibold'>Type argument: </h2>
              <p className="text-center text-neutral-content font-mono text-opacity-90">
                {shortenAddress(props.typeParameter.split('::')[0], 3)}
                ::
                {props.typeParameter.split('::')[1]}
                ::
                {props.typeParameter.split('::')[2]}
                <label 
                  tabIndex={0} 
                  className="btn btn-circle btn-ghost btn-xs text-info" 
                  onClick={async () => {
                    navigator.clipboard.writeText(props.typeParameter || '')
                    console.log('clipboard', await navigator.clipboard.readText())
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                </label>
              </p>
            </div>
          }
          {
            fieldListEntries.length > 0 &&
            <table style={{marginTop:"15px"}} className="table table-compact table-zebra w-full shadow-xl">
              <thead>
                <tr>
                  <th className='text-center'>Attributes</th>
                  <th className='text-center'>values</th>
                </tr>
              </thead>
              <tbody>
                {fieldListEntries}
              </tbody>
            </table>
          }
        </div>
        <div className="card-actions justify-end text-neutral-content">
          <div className="badge badge-outline">Object</div> 
          {
            props.shared &&
            <div className="badge badge-outline">Shared</div>
          }
        </div>
      </div>
    </div>
  )
}

