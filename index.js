const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const {
  CloudinaryStorage
} = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();
const {
  Schema
} = mongoose;
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const white_list = ['http://hngoc.kesug.com', 'https://hngoc.kesug.com'];
const corsOptions = (req, callback) => {
  const origin = req.header('Origin');
  if (white_list.includes(origin)) {
    callback(null, { origin: true });
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};
app.use(cors(corsOptions));
//mongo db
const singSchema = new Schema( {
  name: String,
  singer: String,
  path: String,
  image: String
});
const singModel = mongoose.model('Sing', singSchema);
//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage( {
  cloudinary: cloudinary,
  params: {
    folder: 'mp3-files',
    resource_type: 'auto',
  },
});
const upload = multer( {
  storage
});
//route upload
app.post('/upload', upload.single('file'), async(req, res)=> {
  try {
    const newSong = new singModel( {
      name: req.body?.name,
      singer: req.body?.singer,
      image: req.body?.image,
      path: req.file?.path,
    });
    await newSong.save();
    res.status(200).json({
      status: 'success', song: newSong
    })
  } catch(err) {
    console.log(err)
    res.status(500).json('Upload error')
  }
})
//route get
app.get('/sings', async(req, res) => {
  try {
    const sings = await singModel.find({})
    res.json({
      status: 'success', sings
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({
      status: 'fail', message: 'Get sing error'
    })
  }
})
//delete sing
app.delete('/delete/:id', async (req, res)=> {
  try {
    const id = req?.params?.id;
    await singModel.findByIdAndDelete(id);
    res.status(200).json({
      status: 'success', message: 'Delete success'
    })
  }catch(err) {
    console.log(err)
    res.status(500).json({
      status: 'fail', message: 'Delete fail'
    })
  }
})
//update no file
app.put('/update/:id', async(req, res) => {
  try {
    const id = req.params.id;
    console.log(req.body)
    const userUpdate = await singModel.findByIdAndUpdate(id, {
      name: req.body?.name, singer: req.body?.singer, image: req.body?.image
    }, {
      new: true
    })
    res.json({
      status: 'success', userUpdate
    })
  }catch(err) {
    console.log(err)
    res.status(500).json({
      status: 'fail', message: 'Update fail'
    })
  }
})
//update have file
app.put('/update/file/:id', upload.single('file'), async(req, res) => {
  try {
    const id = req.params.id;
    console.log(req.body)
    const userUpdate = await singModel.findByIdAndUpdate(id, {
      name: req.body?.name,
      singer: req.body?.singer,
      image: req.body?.image,
      path: req?.file?.path
    }, {
      new: true
    })
    res.json({
      status: 'success', userUpdate
    })
  }catch(err) {
    console.log(err)
    res.status(500).json({
      status: 'fail', message: 'Update fail'
    })
  }
})
mongoose.connect(process.env.DB_URL).then(()=>console.log('Connecting database')).catch(err => console.log(err))
app.listen(8081, ()=> console.log('Server is running'))
