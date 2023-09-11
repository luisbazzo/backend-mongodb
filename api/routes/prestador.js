import { Express } from "express";
import { connectToDatabase } from '../utils/mongodb';

const router = Express.Router();
const {db, ObjectId} = await connectToDatabase();
const nomeCollection = 'prestadores';


/*
    * GET /api/prestadores
    Lista todos os prestadores de serviço

*/ 

router.get('/', async(req, res)=>{
    try{
        db.collection(nomeCollection).find().sort({razao_social: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch(err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: "Erro ao obter a listagem dos prestadores",
                param: '/'
            }]
        })
    }
})

export default router;