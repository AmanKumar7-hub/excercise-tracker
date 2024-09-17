const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use(express.json());
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

//creating User Models 
const User = mongoose.model('User',userSchema);

//creating excerciseSchema
const excerciseSchema = mongoose.Schema({
  userId:{type:String,required:true,},
  description:{type:String, required:true},
  duration:{type:Number, required:true},
  date:{type:Date, default:new Date()},
})
const ExcerciseModel = mongoose.model('Excercise',excerciseSchema)

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

app.post('/api/users/:_id/exercises',(req,res)=>{
  const userId  = req.params._id;

  let excerciseObj = {
    userId: userId,
    description:req.body.description,
    duration:req.body.duration,
  }
  if(req.body.date!=''){
    excerciseObj.date = req.body.date;
  }
  //creating new excerciseObj to check and save to the database it's value.
  const excercise = new ExcerciseModel(excerciseObj);

  User.findById(userId)
  .then(async (err,foundUser)=>{
    if(err) console.log(err);
    //save to the database
    await excercise.save();
    res.json(excercise);
  })
})


app.get('/api/users/:_id/logs',(req,res)=>{
  const userId = req.params._id;
  const toParam = req.query.to;
  const fromParam = req.query.from;
  let limitParam = req.query.limit;
  
  limitParam = limitParam? parseInt(limitParam):limitParam;
  
  User.findById(userId)
  .then((foundUser)=>{
    if(!foundUser) return res.status(404).json({error:'Invalid user name'})
    
    let queryObj = {userId:userId};
    if(fromParam || toParam){
      
      if(fromParam){
        queryObj.date[`$gte`] = fromParam;
      }
      if(toParam){
        queryObj.date[`$lte`] = toParam;
      }
    }
    ExcerciseModel.find(queryObj)
    .limit(limitParam)
    .exec()
    .then(excercises=>{
      let resObj = {
        username:foundUser.username,
        count:excercises.length,
        _id:foundUser._id,
        log:excercises.map((x)=>({
          description:x.description,
          duration:x.duration,
          date: new Date(x.date).toDateString()
        })),
      }
      res.json(resObj)
    })
    .catch(err=>console.log(err))
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
