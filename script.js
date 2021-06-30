const ENDPOINT = "https://brighter-star-studio-api.vercel.app";
// initializations 

new InputFile({
    // options
    buttonText: 'Choose file',
    hint: 'or drag and drop file here',
    message : 'file choosed'
});

const firebaseConfig = {
apiKey:"AIzaSyCs_Msb07LLz3zBLBrbj9z3QYTmh-ZXc8g",
authDomain:"default-e8076.firebaseapp.com",
projectId:"default-e8076",
storageBucket:"gs://default-e8076.appspot.com",
messagingSenderId:"743306084852",
appId:"1:743306084852:web:65cfa0427ab8b4fd37f9a1",
measurementId:"G-RJE66XBF5E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Firebase storage
const storage = firebase.storage();

// alert [type => alert-danger, alert-warning]
function inform(msg, type) {
    const alert = document.getElementsByClassName('alert')[0]

    alert.innerHTML = msg;

    alert.classList.add(type);

    alert.classList.remove('d-none')

    setTimeout(() => {
        alert.classList.add('d-none');
        alert.classList.remove(type)
    },  2000);
}

function notify(msg) {
    const alert = document.getElementsByClassName('notify')[0]

    alert.innerHTML = msg;

    if (alert.classList.contains('d-none')) {
        alert.classList.remove('d-none')
    }
}

function endNotification() {
    const alert = document.getElementsByClassName('notify')[0]

    alert.classList.add('d-none');
}

// show and hide spinner
function showSpinner() {
    const spinna = document.getElementsByClassName('spina')[0]
    spinna.classList.remove('d-none')
}

function hideSpinner() {
    const spinna = document.getElementsByClassName('spina')[0]
    spinna.classList.add('d-none')
}



// Upload files
function uploadFiles() {

    const imagesRef = storage.ref().child('images');
    const musicRef = storage.ref().child('music')

    const randomRef = Math.floor(Math.random() * 99999999);

    const newMusicRef = musicRef.child(`music/${randomRef}`);
    const newCoverRef = imagesRef.child(`images/${randomRef}`)

    // get both music and cover 
    let music = document.getElementsByClassName('music')[0]
    let cover = document.getElementsByClassName('cover')[0]
    
    // Upload files
        // first upload music, then upload cover
        notify('Uploading music...')
        newMusicRef.put(music.files[0]).then(snapshot => {

            inform('Music uploaded', 'alert-success')
            notify('Uploading cover...')
            
            newMusicRef.getDownloadURL().then(musicDownloadURL => {
                // upload cover
                newCoverRef.put(cover.files[0]).then(snapshot => {
                    inform('Cover photo uploaded successfully!')
                    
                    newCoverRef.getDownloadURL().then(coverDownloadURL => {
                        // save data to db
                        axios.post(`${ENDPOINT}/promote-music`, 
                            {
                                _id : randomRef,
                                phoneNumber : document.getElementById('phoneNumber').value,
                                name : document.getElementById('name').value,
                                email : document.getElementById('email').value,
                                musicTitle : document.getElementById('musicTitle').value,
                                musicArtist : document.getElementById('musicArtist').value,
                                token : document.getElementById('accessToken').value,
                                coverPath : coverDownloadURL,
                                musicPath : musicDownloadURL
                            }
                        ).then(r => {
                            // do something here
                            hideSpinner();
                            endNotification();
                            inform('Your music promotion request received successfully!', 'alert-success')
                        }).catch(e => {
                            hideSpinner();
                            inform('Something went wrong', 'alert-danger')
                        })

                    })
                }).catch(e => {
                    inform('Something went wrong. Please try again', 'alert-danger')
                })
            })
        }).catch(e => {
            inform('Something went wrong. Please try again', 'alert-danger')
        })
}



// submission
const uploadBtn = document.getElementsByClassName('upload-btn')[0]

uploadBtn.addEventListener('click', () => {

    if(!cover.files[0]) {
        inform("Please select music cover",'alert-danger')
        return;
    }

    if(!music.files[0]) {
        inform("Please select music",'alert-danger')
        return;
    }

    showSpinner();
    // check if user is authorized to upload musics
    axios.get(`${ENDPOINT}/check-access-token`, {
        params : {
            phoneNumber : document.getElementById('phoneNumber').value,
            token : document.getElementById('accessToken').value
        }
    })
    .then(r => {
        uploadFiles()
    }).catch(e => {
        hideSpinner();
        inform('Invalid token, phone number or name provided', 'alert-danger')
    })

})
