import React, { Component } from 'react';
import firebase from 'firebase';
import FileUpload from "./FileUpload";
import './App.css';

class App extends Component {
  constructor(){
    super();
    this.state = {
      user: null,
      pictures: []
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  componentWillMount(){
    // Cada vez que el método 'onAuthStateChanged' se dispara, recibe un objeto (user)
    // Lo que hacemos es actualizar el estado con el contenido de ese objeto.
    // Si el usuario se ha autenticado, el objeto tiene información.
    // Si no, el usuario es 'null'
    firebase.auth().onAuthStateChanged(user => {
      this.setState({user: user});
    });

    firebase.database().ref('pictures').on('child_added', snapshot => {
      this.setState({
        pictures: this.state.pictures.concat(snapshot.val())
      });
    });
  }

  handleAuth(){
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
      .then(result => console.log(`${result.user.email} ha iniciado sesión`))
      .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }

  handleLogout(){
    firebase.auth().signOut()
      .then(result => console.log(`ha cerrado sesión`))
      .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }

  handleUpload (event){
    const file = event.target.files[0];
    const storageRef = firebase.storage().ref(`/photos/${file.name}`);
    const task = storageRef.put(file);

    // Listener que se ocupa del estado de la carga del fichero
    task.on('state_changed', snapshot => {
      // Calculamos el porcentaje de tamaño transferido y actualizamos
      // el estado del componente con el valor
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.setState({ uploadValue: percentage })
    }, error => {
      // Ocurre un error
      console.log(error.message)
    }, () => {
      // Subida completada
      // Obtenemos la URL del fichero almacenado en Firebase storage
      // Obtenemos la referencia a nuestra base de datos 'pictures'
      // Creamos un nuevo registro en ella
      // Guardamos la URL del enlace en la DB
      const record = {
        photoURL: this.state.user.photoURL,
        displayName: this.state.user.displayName,
        image: task.snapshot.downloadURL
      }
      const dbRef = firebase.database().ref('pictures');
      const newPicture = dbRef.push();
      newPicture.set(record);
    });
  }

  renderLoginButton(){
    // si el usuario esta logueado
    if (this.state.user) {
      return(
        <div className="App-intro">
          <img width="100"
            src={ this.state.user.photoURL }
            alt={ this.state.user.displayName }
          />
          <p className="App-intro">Hola { this.state.user.displayName }!</p>
          <button className="App-btn" onClick={ this.handleLogout }>Salir</button>
          <FileUpload onUpload={ this.handleUpload }/>
          {
            this.state.pictures.map(picture => (
              <div className="App-card">
                <figure className="App-card-image">
                  <img width="320" src={ picture.image }  alt='name'/>
                  <figCaption className="App-card-footer">
                    <img className="App-card-avatar"src={ picture.photoURL } alt={ picture.displayName }/>
                    <span className="App-card-name">
                      { picture.displayName }
                    </span>
                </figCaption>
              </figure>
              </div>
            )).reverse()
          }
        </div>
      );
    } else {
      // Si no lo está
      return(<button onClick={ this.handleAuth }>Login con Google</button>);
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to MyGram</h2>
        </div>
        <div className="App-intro">
          { this.renderLoginButton()}
        </div>
      </div>
    );
  }
}

export default App;
