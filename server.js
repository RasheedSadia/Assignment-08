import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import dbModel from './dbModel.js';


// app congig
const app = express();
const port = process.env.PORT || 8080;



const pusher = new Pusher({
  appId: "1434387",
  key: "4de7724afcde578c3460",
  secret: "c6414db21ff946c4b755",
  cluster: "mt1",
  useTLS: true
});

// middleware 
app.use(express.json())
app.use(cors())

//DB config
const connection_url = 'mongodb+srv://admin:lTvmXzY6CHsQDVit@instagram.grodvk4.mongodb.net/instaDB?retryWrites=true&w=majority'

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

mongoose.connection.once('open', () => {
    console.log('DB Connected');

const changeStream = mongoose.connection.collection('posts').watch()

changeStream.on('change', (change)=>{
    console.log('Change triggered on pusher...')
    console.log(change)
    console.log('End of Change')
    
    if (change.operationType === 'insert')
{
    console.log('Triggering Pusher ***IMG UPLOAD ***')

    const postddetails = change.fullDocument;
    pusher.trigger('post', 'inserted',{
        user: postddetails.user,
        caption: postddetails.caption,
        image: postddetails.image,
    })
} else {
    console.log('Unknown trigger from Pusher')
}

})

});

// api route
app.get('/', (req, res) => res.status(200).send('hello world '));

app.post('/upload',(req, res)=>{
    const body = req.body;
dbModel.create(body,(err,data)=> {
    if (err){
        res.status(500).send(err);
    } else {
res.status(201).send(data);
    }
})
})
app.get('/sync',(req,res)=>{
    dbModel.find((err,data)=>{
        if(err){
            res.status(500).send(err);
            }
            else {
                res.status(200).send(data);
            }
    })
})

// listen
app.listen(port, () => console.log(`listening on localhost:${port}`));