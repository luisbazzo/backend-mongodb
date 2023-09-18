import express from 'express'
import { check, validationResult } from 'express-validator'
import { connectToDatabase } from '../utils/mongodb.js'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'prestadores'

const validaPrestador = [
    check('cnpj')
    .not().isEmpty().trim().withMessage('É obrigatório informar o CPNJ')
    .isNumeric().withMessage('O CNPJ só deve conter números')
    .isLength({min:14, max:14}).withMessage('O CNPJ deve conter 14 nºs'),
    check('razao_social')
    .not().isEmpty().trim().withMessage('É obrigatório informar a Razão')
    .isAlphanumeric('pt-BR', {ignore: '/. '}).withMessage("A Razão social não deve ter caracteres especiais")
    .isLength({min:5}).withMessage('A Razão é muito curta. Mínimo 5')
    .isLength({max:200}).withMessage('A Razão é muito longa. Máximo 200'),
    check('cnae_fiscal')
    .isNumeric().withMessage('O CNAE só deve conter números'),
    check('nome_fantasia').optional({nullable: true})
]

/**
 * GET /api/prestadores
 * Lista todos os prestadores de serviço
 */
router.get('/', async(req, res) => {
    try{
        db.collection(nomeCollection).find().sort({razao_social: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a listagem dos prestadores',
                param: '/'
            }]
        })
    }
})

/**
 * GET /api/prestadores/id/:id
 * Lista os prestadores de serviço
 */
router.get('/id/:id', async(req, res)=> {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.params.id)}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) // retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * GET /api/prestadores/razao/:razao
 * Lista os prestadores de serviço pela Razao Social
 */
router.get('/razao/:razao', async(req, res)=> {
    try{
        db.collection(nomeCollection).find({'razao_social': {$regex: req.params.razao, $options: "i"}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) // retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})


//DELETE por ID /api/prestadores/:id
router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection).deleteOne({"_id": {$eq:ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})

//POST
router.post('/', validaPrestador, async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

//PUT
router.put('/', validaPrestador, async(req, res) => {
    let idDocumento = req.body._id
    delete req.body._id

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq:ObjectId(idDocumento)}},
                    {$set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

export default router