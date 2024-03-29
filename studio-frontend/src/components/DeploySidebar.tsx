
import { useEffect, useState } from "react";
import { Project } from "../types/project-types"
import { shortenAddress } from "../utils/address-shortener";
import { useAccountBalance, useWallet } from "@suiet/wallet-kit";
import { decimalify } from "../utils/decimal";
import { network } from "../utils/network";
import SettingToggle from "./SettingToggle";
import { isValidTransactionDigest } from "@mysten/sui.js";

const disabledWallets = [
  // "Martian Sui Wallet",
] as string[];

function DeploySidebar(
  props: {
    projectList: string[],
    currentProject: Project | null,
    changeProject: (project: string) => void,
    publishPackage: () => void,
    addExistingObject: (objectId: string) => void,
    addFromTransactions: (transactionId: string) => void,
    compileError: string,
    useSuiVision: boolean,
    setUseSuiVision: (useSuiVision: boolean) => void,
  }
) {

  const wallet = useWallet();
  const {
    error, loading, balance
  } = useAccountBalance();

  const [isValidObjectId, setIsValidObjectId] = useState(false);
  const [isInputValidTransactionDigest, setIsInputValidTransactionDigest] = useState(false);
  const [walletIcon, setWalletIcon] = useState('');

  const [ignoreUpgradeCap, setIgnoreUpgradeCap] = useState(false);

  useEffect(() => {
    if (wallet.connected) {
      wallet.configuredWallets.forEach((detectedWallet) => {
        if (detectedWallet.name == wallet.name) {
          setWalletIcon(detectedWallet.iconUrl);
        }
      })
    }
  }, [wallet.connected])


  //---Helper---//

  const projects = props.projectList.map((project: string) => {
    return <option value={project}>{project}</option>
  });

  function WalletSelector() {
    const { 
      select,  // select 
      configuredWallets,  // default wallets
      detectedWallets,  // Sui-standard wallets detected from browser env
      allAvailableWallets,  // all the installed Sui-standard wallets
    } = useWallet();
  
    return [...configuredWallets, ...detectedWallets].map((wallet) => {
      return (
        <button
          className="btn btn-xs w-full h-fit btn-info btn-outline bg-base-100 p-1"
          key={wallet.name}
          onClick={() => {
            // check if user installed the wallet
            if (!wallet.installed) {
              // do something like guiding users to install
              if(wallet.downloadUrl.browserExtension !== undefined) {
                console.log('downloadUrl', wallet.downloadUrl.browserExtension);
                window.open(wallet.downloadUrl.browserExtension, '_blank');
              }
              return;
            }
            setWalletIcon(wallet.iconUrl);
            select(wallet.name);
          }}
          disabled={disabledWallets.includes(wallet.name)}
        >
          <img src={wallet.iconUrl} alt={wallet.name} className="w-5 h-5 inline-block mr-2" />
          {
            wallet.name == 'Martian Sui Wallet' ?
            <span>Martian wallet</span> :
            <span>{wallet.name}</span>
          }
        </button>
      )
    });
  }

  //---Handlers---//

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

  const handleSetIgnoreUpgradeCap = (event: any) => {
    setIgnoreUpgradeCap(event.target.checked);
  }

  const handleSetUseSuiVision = () => {
    // set this config in local storage
    localStorage.setItem('useSuiVision', (!props.useSuiVision).toString());

    props.setUseSuiVision(!props.useSuiVision);
  }

  // console.log('walleticon', walletIcon)

  return (
    <div className="h-full">
      {wallet.connected && 
        <div className="card w-full shadow-xl card-compact">
          <div className="card-actions justify-end z-20">
            <a className="link link-hover " href={ props.useSuiVision && wallet.chain?.name != 'Sui Devnet' ? `https://${wallet.chain?.name == 'Sui Testnet' ? 'testnet.' : ''}suivision.xyz/account/${wallet.address}` : `https://explorer.sui.io/address/${wallet.address}?network=${network[wallet.chain?.name || 'Sui Devnet']}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-square btn-ghost btn-xs mt-1 mr-1" >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><g fill="none" fill-rule="evenodd"><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h5M15 3h6v6M10 14L20.2 3.8"/></g></svg>            
              </button>
            </a> 
          </div>
          <div className="card-body -mt-10">
            <h2 className="card-title">
              {
                walletIcon != '' &&
                <img src={walletIcon} alt={wallet.name} className="w-6 h-6 inline-block" />
              }
              {
                wallet.name == 'Martian Sui Wallet' ?
                <span>Martian wallet</span> :
                <span>{wallet.name}</span>
              }
            </h2>
            <div>
              <h2 className='font-semibold'>Address:</h2>
              <p className="text-center text-neutral-content font-mono text-opacity-90">
                {shortenAddress(wallet.address || '', 5)}
                <label 
                  tabIndex={0} 
                  className="btn btn-circle btn-ghost btn-xs text-info" 
                  onClick={async () => {
                    navigator.clipboard.writeText(wallet.address || '')
                    console.log('clipboard', await navigator.clipboard.readText())
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                </label>
              </p>
            </div>
            <div>
              <h2 className='font-semibold'>Gas balance:</h2>
              <p className="text-center text-neutral-content font-mono text-opacity-90">
                {loading ? "Loading balance..." : `${decimalify(balance?.toString() || '', 9)} Sui`} 
                {!loading &&
                  <label 
                    tabIndex={0} 
                    className="btn btn-circle btn-ghost btn-xs text-info" 
                    onClick={async () => {
                      navigator.clipboard.writeText(balance?.toString() || '')
                      console.log('clipboard', await navigator.clipboard.readText())
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  </label>
                }
              </p>
            </div>
            <div>
              <h2 className='font-semibold'>Network:</h2>
              <p className="text-center text-neutral-content font-mono text-opacity-90">
                {wallet.chain?.name || ''} 
                <label 
                  tabIndex={0} 
                  className="btn btn-circle btn-ghost btn-xs text-info" 
                  onClick={async () => {
                    navigator.clipboard.writeText(wallet.chain?.name || '')
                    console.log('clipboard', await navigator.clipboard.readText())
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                </label>
              </p>
            </div>
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
            <div style={{marginTop:"0px", marginBottom:"5px"}} className="tutorial-deploy-add-object">
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
            <div style={{marginTop:"0px", marginBottom:"5px"}}>
              <span className="font-bold">Additional configs: </span>
              <SettingToggle
                label="Use Sui Vision explorer"
                checked={props.useSuiVision}
                onChange={handleSetUseSuiVision}
                tooltip="Use Sui Vision explorer to view transactions and objects instead of the default explorer"
                new={true}
              />
              <SettingToggle
                label="Ignore upgradeCap"
                checked={ignoreUpgradeCap}
                onChange={handleSetIgnoreUpgradeCap}
                disabled={true}
              />
              <SettingToggle
                label="Automatically add all created objects"
                checked={ignoreUpgradeCap}
                onChange={handleSetIgnoreUpgradeCap}
                disabled={true}
              />
            </div>
            <div className="card-actions justify-end">
              <button
                onClick={() => {
                  wallet.disconnect();
                  setWalletIcon('');
                }}
                className="btn btn-xs btn-error btn-outline badge"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      }
      { !wallet.connected &&
        <div className="card w-full shadow-xl card-compact">
          <div className="card-body ">
            <h2 className="card-title">Connect wallet</h2>
            <p className="text-semibold mb-1 -mt-2 opacity-75">Choose a wallet to get started</p>
            {WalletSelector()}
          </div>
        </div>
      }
    </div>
  )
}

export default DeploySidebar