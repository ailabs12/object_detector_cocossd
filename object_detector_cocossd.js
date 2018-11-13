var cv = require('opencv4nodejs');
var { net } = require('./load_cocossd');
var classNames = require('./CocoClassNames.json');
// для замера времени выполнения
//const {performance} = require('perf_hooks');

const classifyImg = (imageBase64) => {

  if (!imageBase64)
    	throw 'Do specify an image in base64 format'

  imageBase64 = imageBase64.replace('data:image/jpeg;base64','')
														.replace('data:image/png;base64','');

  const buffer = Buffer.from(imageBase64,'base64'); // записываем закодированную картинку в буфер
  const img = cv.imdecode(buffer); //Картинка сейчас представлена как Mat  

  const white = new cv.Vec(255, 255, 255);
  // ssdcoco model works with 300 x 300 images
  const imgResized = img.resize(300, 300);

  // network accepts blobs as input
  const inputBlob = cv.blobFromImage(imgResized);
  net.setInput(inputBlob);

  // forward pass input through entire network, will return
  // classification result as 1x1xNxM Mat
  let outputBlob = net.forward();
  // extract NxM Mat
  outputBlob = outputBlob.flattenFloat(outputBlob.sizes[2], outputBlob.sizes[3]);

  const results = Array(outputBlob.rows).fill(0)
    .map((res, i) => {
      //const className = outputBlob.at(i, 1);
	  const className = classNames[outputBlob.at(i, 1)].Rus; //.Eng for English mode
      const confidence = outputBlob.at(i, 2);
      const topLeft = new cv.Point(
        outputBlob.at(i, 3) * img.cols,
        outputBlob.at(i, 6) * img.rows
      );
	  const bottomRight = new cv.Point(
        outputBlob.at(i, 5) * img.cols,
        outputBlob.at(i, 4) * img.rows
      );

      return ({
        className,
        confidence,
        topLeft,
        bottomRight
      })
    });

    return results;
};

// для замера времени выполнения
//time = performance.now() - time;
//console.log('Время выполнения = ', time);

exports.classifyImg = classifyImg;

