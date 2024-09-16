const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use('/',bodyParser.urlencoded());
//connected to the database 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Database Connected'))
.catch(err => console.error('Failed to connect to database', err));

//creating userScheam 
const userSchema = mongoose.Schema({
  username:{
    type:String,
    unique:true,
  }
})

//creating User Mode 
const User = mongoose.model('User',userSchema);
//Schema for the creating user detils

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',async(req,res)=>{
    const {username} =req.body;
    const user  =  new User({username:username})
    if(user){
     await user.save();
    }
    res.json(user);
});

app.get('/api/users',(req,res)=>{
  User.find({}).then((user)=>{
    res.json(user);
  })
})
app.post('/api/users/:userId/excercise',(req,res)=>{
  res.json({message:'Returning something'})
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
