import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (app, options={})=>{
  app.use("/sio/SioElement.js",
    (req,res)=>{
      res.sendFile(path.join(__dirname, 'SioElement.js'));
    }
  )
  if(!options.sioElements || !Array.isArray(options.sioElements)){
    options.sioElements = [];
  }
  for(let sioElement of options.sioElements){
    app.use(`/sio/${sioElement}.js`,
      (req,res)=>{
        res.sendFile(path.join(__dirname,'sioElements', `${sioElement}.js`));
      }
    )
  }
}