const express =  require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}))

app.listen(8080, function(){
    console.log('listening... 8080');
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

app.post('/add', (req,res) => {
    res.send('전송완료');
    console.log(req.body.title);
})

