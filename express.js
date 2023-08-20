import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(app)=>{
  app.use("/sio/SioElement.js",
    (req,res)=>{
      res.sendFile(path.join(__dirname, 'SioElement.js'));
    }
  )
}