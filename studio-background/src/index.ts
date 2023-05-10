import cors from 'cors';
import express from 'express';
import { compile, test } from './compile';
import { getObjectDetails, getPackageDetails, getTransactionDetails } from './object-details';

const app = express();
const portHttp = 80;
const portHttps = 443;

// // PRODUCTION
// import https from 'https';
// import fs from 'fs';
// const CERT_PATH = "/etc/letsencrypt/live/api.movestudio.dev/fullchain.pem"
// const KEY_PATH = "/etc/letsencrypt/live/api.movestudio.dev/privkey.pem"
// const options = {
//   key: fs.readFileSync(KEY_PATH),
//   cert: fs.readFileSync(CERT_PATH)
// };
// const httpsServer = https.createServer(options, app);
// httpsServer.listen(portHttps, () => {
// 	console.log('HTTPs Server running on port ', portHttps);
// });


app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.get('/projects', (req, res) => {
  res.send('projects');
});

app.post('/compile', async (req, res) => {
  const project = req.body;

  // console.log(project);
  console.log('compiling project...')

  // Call compile function
  const compileResult = await compile(project);

  // console.log(compileResult)

  res.send(compileResult);

});

app.post('/test', async (req, res) => {
  const project = req.body;

  // console.log(project);
  console.log('testing project...')

  // Call compile function
  const testResults = await test(project);

  // console.log(compileResult)

  res.send(testResults);

});

app.post('/object-details', async (req, res) => {
  const objectId = req.body.objectId as string;
  const rpc = req.body.rpc as string;

  console.log('Retrieving object details for: ' + objectId)

  // console.log(objectId);

  const objectDetails = await getObjectDetails(objectId, rpc);

  // console.log(objectDetails);

  res.send(objectDetails);
});

app.post('/package-details', async (req, res) => {
  const packageId = req.body.packageId as string;
  const rpc = req.body.rpc as string;

  // console.log(packageId);
  console.log('Retrieving package details for: ' + packageId)

  const packageDetails = await getPackageDetails(packageId, rpc);

  // console.log(packageDetails);

  res.send(packageDetails);
});

app.post('/transaction-details', async (req, res) => {
  const transactionDigest = req.body.digest as string;
  const rpc = req.body.rpc as string;

  // console.log(transactionDigest);
  console.log('Retrieving transaction details for: ' + transactionDigest)

  const transactionDetails = await getTransactionDetails(transactionDigest, rpc);

  // console.log(transactionDetails);

  res.send(transactionDetails);
});

app.listen(process.env.PORT || portHttp, () => {
  console.log(`REST API is listening on port: ${process.env.PORT || portHttp}.`);
});