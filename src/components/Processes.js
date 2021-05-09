import React, { Component} from "react";
import {hot} from "react-hot-loader";

import Header from './Header';

import { MenuItem, Button, NumericInput, ControlGroup, InputGroup, Tag, Spinner} from  "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
const Web3 = require("web3");

const EnzianYellow = require("enzian-yellow");

class Processes extends Component{

  enzian;

  state = {
    selectedContract: "Select a contract...",
    storedContracts: [],
    storedConnections: [],
    currentEventLog: [],
    taskToBeExecuted: -1,
    selectedConnection: "Select Connection...",
    connectionSelected: false,
    newContractAddress: '',
    waitForVerification: false
  }

  loadContracts = () => {
    let contracts = JSON.parse(localStorage.getItem('contracts'));
    if(!contracts) {
      contracts = [];
    }
    this.setState({ storedContracts: contracts });
  }

  componentDidMount() {

    this.loadContracts();

    let web3Connections = JSON.parse(localStorage.getItem("web3Connections"));
    if(!web3Connections) {
      web3Connections = [];
    }

    if (window.ethereum) {
      web3Connections.push("MetaMask");
    }


    this.setState({ storedConnections: web3Connections });

  }

  handleValueChange = (valueAsNumber, valueAsString) => {
    this.setState({ taskToBeExecuted: valueAsNumber });
  };

  renderContractAddress = (storedContract, { handleClick, modifiers }) => {
    if (modifiers && !modifiers.matchesPredicate) {
        return null;
    }

    return (
        <MenuItem
            active={modifiers.active}
            key={storedContract}
            onClick={handleClick}
            text={storedContract}
        />
    );
  };


  contractAddressSelected = (e) => {
    this.setState({ selectedContract: e });

    if(!this.enzian) {
      if(this.state.selectedConnection === 'MetaMask') {

        this.enzian = new EnzianYellow(window.ethereum);
      }
      else {
        this.enzian = new EnzianYellow(new Web3(new Web3.providers.HttpProvider(this.state.selectedConnection)));

      }
    }

      this.enzian.eventlogByAddress(e).then(r => {
        this.setState({ currentEventLog: r })
      });

  } 

  onExecuteClick = async () => {

    this.setState({waitForVerification: true})
    let result;

    switch(this.state.selectedConnection) {

      case 'MetaMask':
      
        this.enzian = new EnzianYellow(window.ethereum);
        result = await this.enzian.executeTaskByAddress(
          this.state.selectedContract,
          this.state.taskToBeExecuted
        );
        console.log(result);
      
      break;
      default:
        this.enzian = new EnzianYellow(new Web3(new Web3.providers.HttpProvider(this.state.selectedConnection)));
        result = await this.enzian.executeTaskByAddress(
          this.state.selectedContract,
          this.state.taskToBeExecuted,
          localStorage.getItem('selectedPrivateKey')
        );
        console.log(result);
        break;
    }

    this.setState({waitForVerification: false})
    
    this.enzian.eventlogByAddress(this.state.selectedContract).then(r => {
      console.log(r);
      this.setState({ currentEventLog: r })
    });
  
  }

  setAndUpdateConnection = (value) => {
    this.setState({
      selectedConnection: value.selectedConnection,
      selectedStoredAccount: value.selectedStoredAccount
    })
  }

  addNewContractAddress = () => {
    let contracts = JSON.parse(localStorage.getItem("contracts"));
    if(!contracts) contracts = [];
    contracts.push(this.state.newContractAddress);
    localStorage.setItem("contracts", JSON.stringify(contracts));
    this.loadContracts();
    this.setState({newContractAddress: ''});

  }

  updateNewContractAddress = (event) => {
    this.setState({newContractAddress : event.target.value});
  }


  render(){
    return(
        <div>
            <Header setAndUpdateConnection={this.setAndUpdateConnection} />
            <div className="content">
                <h1>Deployed Processes on the current Blockchain</h1>
                <div >

                    <div style={{margin: '10px', display: 'flex'}}>
                      <div style={{margin: '10px'}}>
                      <h5>Select a deployed Contract</h5>

                      <Select
                          items={this.state.storedContracts}
                          itemRenderer={this.renderContractAddress}
                          noResults={<MenuItem disabled={true} text="No results." />}
                          onItemSelect={this.contractAddressSelected}
                      >
                          {/* children become the popover target; render value here */}
                          <Button text={this.state.selectedContract} rightIcon="double-caret-vertical" />
                      </Select>

                      </div>
                      <div style={{margin: '10px'}}>
                      <h5>or Add a new Contract Address</h5>

                      <ControlGroup>
                        <InputGroup onChange={this.updateNewContractAddress} id="text-input"
                                    placeholder="Paste the Contract Address here..."
                                    intent="primary"
                                    style={{
                                      width: '400px',
                                      fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,' +
                                          'Bitstream Vera Sans Mono,Courier New, monospace'}} />
                        <Button
                              intent="primary"
                              rightIcon="floppy-disk"
                              onClick={this.addNewContractAddress}
                          />
                      </ControlGroup>

                      </div>
                    </div>

                    <div >
                      <div style={{margin: '10px'}}>
                        <h5>Event Log:</h5>
                        {
                            this.state.currentEventLog.map(task => {
                              return (  <Tag style={{margin: '5px'}} minimal="true" intent="success" large="true" key={task} > {task}</Tag> )
                          })
                        }
                      </div>
                    </div>

                    <div >
                      <div style={{margin: '10px'}}>
                      <h5>Execute Task</h5>

                        <ControlGroup>
                         {
                           this.state.waitForVerification ?
                           <div>
                             <Spinner size={Spinner.SIZE_SMALL}/>
                           </div>
                           :
                           <div>

                             <NumericInput onValueChange={this.handleValueChange} />
                        <br />
                        <Button
                            intent="primary"
                            text='Execute'
                            rightIcon="flow-linear"
                            onClick={this.onExecuteClick}
                        />
                           </div>

                         }

                        </ControlGroup>


                      </div>
                    </div>

                </div>
            </div>
        </div>
    );
  }
}

export default hot(module)(Processes);