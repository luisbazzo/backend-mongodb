import express from "express";
import { connectToDatabase } from '../utils/mongodb';

const router = express.Router();
const {db, ObjectId} = await connectToDatabase();
const nomeCollection = 'prestadores';


/*
    * GET /api/prestadores
    Lista todos os prestadores de serviço

*/ 

router.get('/', async(req, res)=>{
    try{
        db.collection(nomeCollection).find().sort({razao_social: 1})
        .toArray((err, docs) => {
            if(!err){
                res.status(400).json(err)
            }
            else{
                res.status(200).json(docs)
            }
        })
    } catch(err){
        res.status(500).json({"error": err.message})
    }
})

export default router