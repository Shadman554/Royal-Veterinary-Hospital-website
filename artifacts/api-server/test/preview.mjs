// Isolated UI verification server. All accounts and requests disappear on exit.
import express from 'express';
import path from 'node:path';
import { createRoyalApi } from '../src/royal-api.mjs';
const {api}=createRoyalApi({databasePath:':memory:',setupKey:'royal-local-qa-key',origin:'http://localhost:5180',mediaDirectory:path.resolve('../../.cache/qa-media')});
const app=express();app.use('/api',api);
const publicDir=path.resolve('../royal-veterinary-hospital/dist/public');
app.use(express.static(publicDir));app.get('/{*path}',(_req,res)=>res.sendFile(path.join(publicDir,'index.html')));
app.listen(5180,'127.0.0.1',()=>console.log('Isolated QA preview: http://localhost:5180'));
