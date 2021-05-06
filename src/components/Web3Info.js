import React, { Component} from "react";
import {hot} from "react-hot-loader";
import Header from './Header';
const Web3 = require("web3");
import restConfig from '../dataExchange/connection/rest-config.json'
import ExchangeHandler from "../dataExchange/connection/ExchangeHandler";
import { 
  Button,
  Card,
  ControlGroup,
  Elevation,
  Icon,
  InputGroup,
  Tag

} from "@blueprintjs/core";


class Web3Info extends Component{


  state = {
    metaMask: false,
    provider: "",
    connectionUrl: "",
    selectedConnection: "http://127.0.0.1:8545",
    storedConnections: [],

    currentNewUrl: ""
  };


  connections = [];

  /**
   * Getting connections from the database
   */
  fetchConnections = () => {
    ExchangeHandler.sendRequest('GET', restConfig.SERVER_URL + '/web3Connections').then(response => {
      this.setState({storedConnections: response.data})
    })
  }

  componentDidMount() {
    this.fetchConnections()
    // let web3Connections = JSON.parse(localStorage.getItem("web3Connections"));
    // if(!web3Connections) {
    //   web3Connections = new Array();
    // }
    //
    // this.setState({ storedConnections: web3Connections });

    let ethereum = window.ethereum;
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      console.log(window.web3);
      window.web3.eth.getAccounts().then(accounts => {
        this.setState({metaMask: accounts[0]});
      });

      return;
    }
    else {
      this.web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
      this.setState(
        {
          isConnected: "true",
          connectionUrl: this.web3._provider.url
        });
      console.log(this.web3);
    }
  }


  updateNewUrl = (event) => {
    this.setState({currentNewUrl : event.target.value});
  }

  deleteConnection = (connection) => {
    ExchangeHandler.sendRequest('DELETE', restConfig.SERVER_URL + '/web3Connections/' + connection.id)
        .then(this.fetchConnections)
  }
  
  addNewConnection = async () => {
    ExchangeHandler.sendRequest('POST', restConfig.SERVER_URL + '/web3Connections', {address: this.state.currentNewUrl})
        .then(() => {
          this.setState({currentNewUrl: ""})
          this.fetchConnections()
        })
}

    render(){
      return(
          <div>
              <Header   setAndUpdateConnection={() => {}} />
              <div className="content">
                  <h1>Blockchain Connection Management</h1>
                  
                  <div id="metaMask">
                    <h3>Browser-driven Connection with MetaMask</h3>
                      <Card  style={{width: '400px'}}>
                        <h4>MetaMask Connection</h4>
                        <p>MetaMask Browser Extension uses an Infura Node Provider API to connect to a Blockchain Network.</p>
                        <p>{this.state.metaMask}</p>
                        {
                          this.state.metaMask ?
                          <Tag
                            icon="feed"
                            intent="success"
                            large="true"
                            round="true"
                          >
                            Available
                          </Tag>
                          : 
                          <div>
                            <p>Please visit your Browser AppStore to install the MetaMask Browser Extension.</p>
                            <Tag
                              icon="offline"
                              intent="danger"
                              large="true"
                              round="true"
                            >
                              Not Available
                            </Tag>
                          </div>
                        }
                      </Card>
                  </div>
                  
                <div id="customConnections">
                    <h3>Custom Connections</h3>
                      <div  style={{margin: '10px', display: 'flex'}}>
                        {
                          this.state.storedConnections.map(connection => {
                            return (
                              <Card key={connection.address}  style={{width: '300px'}}>
                                <h2><Icon icon="ip-address" iconSize={32}  /> Connection</h2>
                                
                                <div>URL: <b>{connection.address}</b></div> <br />
                                <Button
                                  intent="warning"
                                  icon="eraser"
                                  onClick={() => this.deleteConnection(connection)}
                                />
                              </Card>
                            )
                          })
                        }
                        
                        <Card
                          elevation={Elevation.TWO}
                          style={{width: '300px', marginLeft: '20px'}}
                        >
                          <h4>Add new Connection</h4>
                          <ControlGroup vertical={false}>
                            <InputGroup onChange={this.updateNewUrl} value={this.state.currentNewUrl} id="text-input" placeholder="Connection URL..."  intent="primary" />
                            <Button
                              intent="primary"
                              icon="plus"
                              onClick={this.addNewConnection}
                            />
                          </ControlGroup>
                        </Card>
                      </div>
                    </div>
              </div>
          </div>
      );
    }
  }
  
  export default hot(module)(Web3Info);