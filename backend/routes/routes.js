const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/post', async (req, res) => {
    const data = new User({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
    })

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
        return
    }
    catch (error) {
        console.log(error)
        res.status(400)
    }
})

router.get('/getAll', async (req, res) => {
    try{
        const data = await User.find();
        console.log(JSON.stringify(data))
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/getOne/:id', async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await User.findByIdAndDelete(id)
        res.send(`Document with id ${id} has been deleted`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;