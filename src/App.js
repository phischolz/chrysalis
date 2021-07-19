const {Component} = require( "react");
const {hot} = require( "react-hot-loader");
const Header = require( './components/Header');


require( "./App.css");

class App extends Component {

  setAndUpdateConnection = (value) => {
    this.setState({
      handlerValue: value
    })
  }


  render(){

    return(
      <div>
      <Header setAndUpdateConnection={this.setAndUpdateConnection} />
      <div className="App">
        <h1>Decentralized Process Execution</h1>
 

      </div>
      </div>
    );
  }
}

module.exports = hot(module)(App);