const express =  require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine', 'ejs');

const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect
(`mongodb+srv://hodo323:rlaqkgk1@cluster0.go1xq.mongodb.net/
todoapp?retryWrites=true&w=majority`,
 (err, client)=>{
     if(err) return console.log(err);

     db = client.db('todoapp');

     app.listen(8080, function () {
         console.log('\nLISTENING... 8080');
     });
});



app.get('/pet', function(req, res){
    res.send('잘 왔어요. 펫 용품 샵이에요');
});

app.get('/beauty', function (req, res) {
    res.send('뷰티용품... 사지마세요.');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function (req, res) {
    res.sendFile(__dirname + '/write.html');
});

app.get('/list', function (req, res) {
    db.collection('post').find().toArray((err, result) => {
        if(err) {
            console.log(err) 
            return;
        }
        console.log(result);
        res.render('list.ejs', { posts: result });
    });
    
});

app.post('/add', (req,res) => {
    res.send('전송완료');
    db.collection('post').insertOne(
        { 제목: req.body.title, 날짜: req.body.date },
         (err, res) => {
        if(err) return console.log(err);
        console.log(res.ops);
    })
});

