const express =  require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

require('dotenv').config()



const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect
    (process.env.DB_URL,
 (err, client)=>{
     if(err) return console.log(err);

     db = client.db('todoapp');

     app.listen(process.env.PORT, function () {
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
    res.render('login.ejs');
});

app.get('/write', function (req, res) {
    res.render('write.ejs');
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
        if(result == null) {
            res.sendFile(__dirname + '/400error.html');
        }else{
            res.render('detail.ejs', { data: result });
        }   
    });

});

//글 수정 페이지
app.get('/edit/:id', function (req, res) {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, (err, result) => {
        if (result == null) {
            res.sendFile(__dirname + '/400error.html');
        } else {
            res.render('edit.ejs', { data: result });
        }
    });

});

//글 수정 요청
app.put('/edit', function(req, res){
    db.collection('post').updateOne(
        { _id: parseInt(req.body.id)},
        { $set: { 제목: req.body.title, 내용: req.body.date }}, 
        (err, result)=>{
            console.log('수정완료');
            res.redirect('/list');
    })
});


//회원 인증 관련
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

app.use(session({secret : 'secretCode', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local',{
    failureRedirect : '/fail',
}), (req, res)=>{
    res.redirect('/list')
});

let loginCheck = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.send('로그인 하셔야 합니다.')
    }
}

app.get('/mypage', loginCheck, (req, res)=>{
    console.log(req.user)
    res.render('mypage.ejs', {userInfo : req.user});
});





passport.use(new LocalStrategy({
    //usernameField, passwordField 는 유저가 입력한 Id/Pw input태그의 name 속성
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (inputId, inputPw, done) {
    console.log(inputId, inputPw);
    db.collection('login').findOne({ id: inputId }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (inputPw == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

passport.serializeUser((user, done)=>{
     done(null, user.id);
});

passport.deserializeUser((user_id, done) => {
    db.collection('login').findOne({id : user_id}, (err, result)=>{
        done(null, { result });
    }) 
});

