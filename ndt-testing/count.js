var csv = require('ya-csv');

var result = {}, sum = [];

var readCount = 0;
var max = 6; //up:6,down:30
var values = 50;
//var files = ['results-20170326-195055-download-20160101.csv'];
var files = ['results-20170326-200456-upload-20160101-p1.csv','results-20170327-022700-upload-20160101-p2.csv'];

function setupReader(file){

  var reader = csv.createCsvFileReader(file, {
      'separator': ','
  });

  reader.addListener('data', function(data) {
    if(data[0] !== 'download_Mbps'){
      var val = parseFloat(data[0]);
      if(val !== 0 && !isNaN(val)){
        if(val > max){val = max;}
        var r_val = Math.round((val / max * values));
        if(!(r_val in result)){
          result[r_val] = 0;
        }
        result[r_val]++;
      }
    }
  });

  reader.addListener('end', function(data) {
    if(readCount == files.length){
      console.log(JSON.stringify(result));

      var max = 0;
      for (var key in result){
        if(parseInt(key)>max){
          max = parseInt(key);
        }
      }

      for(var i = 0; i<max; i++){
        var sums = 0;
        for (var key in result){
          if(parseInt(key)>=i){
            sums += result[key];
          }
        }
        sum.push([sums,i]);
      }

      console.log(JSON.stringify(sum));
    }else{
      setupReader(files[readCount]);
      readCount++;
    }
  });
}

setupReader(files[readCount]);
readCount++;