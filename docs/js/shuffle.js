{
  const image = new Image(),
    takePhotoButton = document.querySelector('.takePhoto');
    videoSelect = document.querySelector('select#videoSource');

  let constraints, imageCapture, mediaStream, video;

  // Puzzle Vars
  const markers = document.querySelectorAll(`a-marker`),
    numCol = 3, numRow = 3,
    puzzlePieces = numCol * numRow,
    tolerance = 1.9;

  let imgPieces = new Array(puzzlePieces),
    puzzle = [...Array(puzzlePieces).keys()].map(String),
    pieces = numCol * numRow - 1,
    positionMarkers = [],
    check = new Array(6);

  const init = () => {
    video = document.querySelector(`video`);
    navigator.mediaDevices.enumerateDevices()
      .then(gotDevices)
      .catch(error => console.log('enumerateDevices() error: ', error))
      .then(getStream);

    takePhotoButton.addEventListener(`click`, getPicture);
  }

  // Camera ---------------------------------------------------------------
  const getStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    constraints = {
      video: {
        width: 720,
        height: 720,
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(gotStream)
      .catch(error => {
        console.log('getUserMedia error: ', error);
      });
  }

  const gotDevices = deviceInfos => {
    for (let i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfo[i];
      console.log('Found media input or output device: ', deviceInfo);
      var option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'Camera ' + (videoSelect.length + 1);
        videoSelect.appendChild(option);
      }
    }
  };

  const gotStream = stream => {
    mediaStream = stream;
    video.srcObject = stream;
    imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
  };

  const getPicture = () => {
    //shuffle(puzzle);
    imageCapture.takePhoto()
      .then((img) => {
        image.src = URL.createObjectURL(img);
        image.setAttribute('crossOrigin', 'anonymous'); // Github CORS Policy
        image.addEventListener('load', () => createImagePieces(image));
        setInterval(() => checkDistance(), 1000);
        console.log(puzzle);

      })
      .catch((error) => { console.log('takePhoto() error: ', error) });
  };



  // AR Puzzle ------------------------------------------------------------
  const createImagePieces = image => {
    const canvas = document.createElement(`canvas`);
    const ctx = canvas.getContext('2d');
    const pieceWidth = image.width / numCol;
    const pieceHeight = image.height / numRow;

    for (let x = 0; x < numCol; ++x) {
      for (let y = 0; y < numRow; ++y) {
        ctx.drawImage(image, x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight, 0, 0, canvas.width, canvas.height);
        imgPieces[8 - pieces] = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        console.log(imgPieces);
        pieces = pieces - 3;
        if (pieces < 0) {
          pieces = (puzzlePieces - 1) + pieces;
        }
      }
    };

    markers.forEach((marker, i) => {
      const aImg = document.createElement(`a-image`);

      aImg.setAttribute(`rotation`, `-90 0 0`);
      aImg.setAttribute(`src`, imgPieces[puzzle[i]]);

      marker.appendChild(aImg);

    })
  }

  const checkDistance = () => {
    for (let i = 0; i < markers.length; ++i) {
      positionMarkers[i] = markers[i].object3D;
    }

    if (positionMarkers[puzzle[0]].position.x - positionMarkers[puzzle[8]].position.x !== 0) {
      for (let i = 0; i < numRow; ++i) {
        if (Math.abs(positionMarkers[puzzle[0 + (3 * i)]].position.x - positionMarkers[puzzle[1 + (3 * i)]].position.x) < tolerance && Math.abs(positionMarkers[puzzle[1 + (3 * i)]].position.x - positionMarkers[puzzle[2 + (3 * i)]].position.x) < tolerance
          && Math.abs(positionMarkers[puzzle[0 + (3 * i)]].rotation.x - positionMarkers[puzzle[1 + (3 * i)]].rotation.x) < tolerance && Math.abs(positionMarkers[puzzle[1 + (3 * i)]].rotation.x - positionMarkers[puzzle[2 + (3 * i)]].rotation.x) < tolerance) {
          check[i] = true;
        } else {
          check[i] = false;
        }
      }

      for (let i = 0; i < numCol; ++i) {
        if (Math.abs(positionMarkers[puzzle[i]].position.y - positionMarkers[puzzle[3 + i]].position.y) < tolerance && Math.abs(positionMarkers[puzzle[3 + i]].position.y - positionMarkers[puzzle[6 + i]].position.y) < tolerance
          && Math.abs(positionMarkers[puzzle[i]].rotation.y - positionMarkers[puzzle[3 + i]].rotation.y) < tolerance && Math.abs(positionMarkers[puzzle[3 + i]].rotation.y - positionMarkers[puzzle[6 + i]].rotation.y) < tolerance) {
          check[3 + i] = true;
        } else {
          check[3 + i] = false;
        }
      }

      console.log('position x', positionMarkers[puzzle[1]].position.x - positionMarkers[puzzle[0]].position.x);
      console.log('position x2', positionMarkers[puzzle[2]].position.x - positionMarkers[puzzle[1]].position.x);

      console.log('position y', positionMarkers[puzzle[1]].position.y - positionMarkers[puzzle[0]].position.y);
      console.log('position y2', positionMarkers[puzzle[2]].position.y - positionMarkers[puzzle[1]].position.y);


      if (check.every(puzzleCheck)) {
        console.log('SOLVED!!!!!!!');
        const solved = document.querySelector(`.solved`);
        solved.style.display = "flex";
      }

    }
  }

  const puzzleCheck = check => check === true;

  const shuffle = randomArray => {
    for (let i = randomArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomArray[i], randomArray[j]] = [randomArray[j], randomArray[i]];
    }
    console.log(randomArray);
    return randomArray;
  }

  window.addEventListener(`load`, () => setTimeout(() => init(), 1000));

}
