import { JsonRpcProvider, devnetConnection, Connection } from "@mysten/sui.js";


export async function getObjectDetails(objectId: string, rpc?: string) {
  console.log('getObjectDetails', objectId)
  console.log('rpc', rpc)
  let provider;
  if (rpc) {
    const connection = new Connection({ fullnode: rpc });
    provider = new JsonRpcProvider(connection);
  } else {
    provider = new JsonRpcProvider();
  }
  // console.log('provider', provider)

  const objectDetails = await provider.getObject({
    id: objectId,
    options: {
      showContent: true,
      showDisplay: true,
    },
  });
  console.log('objectDetails', objectDetails)

  return objectDetails;
}

export async function getPackageDetails(packageId: string, rpc?: string) {
  console.log('1')
  let provider;
  if (rpc) {
    const connection = new Connection({ fullnode: rpc });
    provider = new JsonRpcProvider(connection);
  } else {
    provider = new JsonRpcProvider();
  }
  // console.log('provider', provider)
  console.log('2')
  const packageDetails = await provider.getNormalizedMoveModulesByPackage({
    package: packageId,
  });
  console.log('packageDetails', packageDetails)
  console.log('3')
  return packageDetails;
}

export async function getTransactionDetails(transactionDigest: string, rpc?: string) {
  console.log('getTransactionDetails', transactionDigest)
  console.log('rpc', rpc)
  let provider;
  if (rpc) {
    const connection = new Connection({ fullnode: rpc });
    provider = new JsonRpcProvider(connection);
  } else {
    provider = new JsonRpcProvider();
  }
  // console.log('provider', provider)
  let transactionDetails;
  while(true) {
    // wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      transactionDetails = await provider.getTransactionBlock({
        digest: transactionDigest,
        options: {
          "showInput": true,
          "showEffects": true,
          "showEvents": true,
          "showObjectChanges": true,
          "showBalanceChanges": true
        }
      });
      console.log('transactionDetails', transactionDetails)
      break
    } catch (e) {
      console.log('error', e)
      continue
    }
  }
  
  return transactionDetails;
}
