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


// post FIND ALL
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

// post INSERT
app.post('/add', (req, res) => {
    
    db.collection('postIndex').findOne({ name: 'postCnt' }, (err, result) => {
        const postCounter = result.totalPost;

        db.collection('post').insertOne(
            { _id: postCounter+1 , 제목: req.body.title, 날짜: req.body.date },
            (err, res) => {
                if (err) return console.log(err);

                db.collection('postIndex').updateOne({name : 'postCnt'},{$inc : {totalPost : 1}}, (err,result)=>{
                    if(err) return console.log(err);
                });
                console.log('\n게시물이 저장되었습니다.\n');
            })
    });

    res.send('전송완료');
});

// post DELETE
app.delete('/delete',(req,res)=> {
    const id = parseInt(req.body._id);
    db.collection('post').deleteOne({_id : id },(err,result)=>{
       if(err) return console.log(err);
       console.log('삭제 완료되었습니다.');
       res.status(200).send({message : '삭제 완료되었습니다.'});
    });
});

//상세 페이지
app.get('/detail/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, (err, result)=>{
        if(result === null) {
            console.log('잘못된 요청입니다...');
            res.sendFile(__dirname + '/400error.html');
        }else{
            res.render('detail.ejs', { data: result });
        }         
    });

});