const {Component} = require( "react");
const {hot} = require( "react-hot-loader");

const Header = require( './Header');

const {MenuItem, Button, NumericInput, ControlGroup, InputGroup, Tag, Spinner} = require( "@blueprintjs/core");
const {Select} = require( "@blueprintjs/select");

const Web3 = require("web3");
const restConfig = require( "../dataExchange/connection/rest-config.json");
const ExchangeHandler = require( "../dataExchange/connection/ExchangeHandler");

const EnzianYellow = require("enzian-yellow");

class Processes extends Component {

    enzian;

    state = {
        selectedContract: {name: 'Select a contract...'},
        storedContracts: [],
        storedConnections: [],
        currentEventLog: [],
        selectedContractTasks: [],
        taskToBeExecuted: null,
        selectedConnection: "Select Connection...",
        selectedStoredAccount: null,
        connectionSelected: false,
        newContractAddress: '',
        newContractName: '',
        waitForVerification: false
    }

    SERVER_ENDPOINT = restConfig.SERVER_URL + '/processes'

    /**
     * Get contracts from a database
     */
    fetchContracts = () => {
        ExchangeHandler.sendRequest('GET', this.SERVER_ENDPOINT).then(response => {
            this.setState({storedContracts: response.data})
        })
    }


    componentDidMount() {
        this.fetchContracts();
    }

    renderContractAddress = (storedContract, {handleClick, modifiers}) => {
        if (modifiers && !modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem
                active={modifiers.active}
                key={storedContract.address}
                onClick={handleClick}
                text={storedContract.name}
            />
        );
    };


    contractAddressSelected = (e) => {
        this.setState({selectedContract: e, selectedContractTasks: e.tasks});

        if (!this.enzian) {
            if (this.state.selectedConnection.address === 'MetaMask') {

                this.enzian = new EnzianYellow(window.ethereum);
            } else {
                this.enzian = new EnzianYellow(this.state.selectedConnection.address, this.state.selectedStoredAccount.privateKey, 'ethereum');

            }
        }

        this.enzian.eventLog(e.address).then(r => {
            this.setState({currentEventLog: r})
        });

    }

    renderTask = (selectedTask, {handleClick, modifiers}) => {
        if (modifiers && !modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem
                active={modifiers.active}
                key={selectedTask.id}
                onClick={handleClick}
                text={selectedTask.name}
            />
        );
    };

    taskSelected = (e) => {
        this.setState({taskToBeExecuted: e})
    }

    onExecuteClick = async () => {

        this.setState({waitForVerification: true})
        let result;

        switch (this.state.selectedConnection.address) {

            case 'MetaMask':

                this.enzian = new EnzianYellow(window.ethereum);
                result = await this.enzian.executeTask(
                    this.state.selectedContract.address,
                    this.state.taskToBeExecuted.number
                );
                console.log("tx returned:   ", result);

                break;
            default:
                this.enzian = new EnzianYellow(this.state.selectedConnection.address, this.state.selectedStoredAccount.privateKey, 'ethereum');
                result = await this.enzian.executeTask(
                    this.state.selectedContract.address,
                    this.state.taskToBeExecuted.number,
                );
                console.log("tx returned: ", result);
                break;
        }

        this.setState({waitForVerification: false})

        this.enzian.eventLog(this.state.selectedContract.address).then(r => {
            console.log(r);
            this.setState({currentEventLog: r})
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
        if (!contracts) {
            contracts = [];
        }
        contracts.push(this.state.newContractAddress);
        localStorage.setItem("contracts", JSON.stringify(contracts));
        this.fetchContracts();
        this.setState({newContractAddress: ''});

    }

    updateNewContractAddress = (event) => {
        this.setState({newContractAddress: event.target.value});
    }


    render() {
        return (
            <div>
                <Header setAndUpdateConnection={this.setAndUpdateConnection}/>
                <div className="content">
                    <h1>Deployed Processes on the current Blockchain</h1>
                    <div>

                        <div style={{margin: '10px', display: 'flex'}}>
                            <div style={{margin: '10px'}}>
                                <h5>Select a deployed Contract</h5>

                                <Select
                                    items={this.state.storedContracts}
                                    itemRenderer={this.renderContractAddress}
                                    noResults={<MenuItem disabled={false} text="No results."/>}
                                    onItemSelect={this.contractAddressSelected}
                                >
                                    {/* children become the popover target; render value here */}
                                    <Button text={this.state.selectedContract.name} rightIcon="double-caret-vertical"/>
                                </Select>

                            </div>
                            <div style={{margin: '10px'}}>
                                <h5>or Add a new Contract Address</h5>

                                <ControlGroup>
                                    <InputGroup onChange={this.updateNewContractAddress} id="text-input"
                                                placeholder="Paste the Contract Address here..." intent="primary"
                                                style={{
                                                    width: '400px',
                                                    fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace'
                                                }}/>
                                    <Button
                                        intent="primary"
                                        rightIcon="floppy-disk"
                                        onClick={this.addNewContractAddress}
                                    />
                                </ControlGroup>

                            </div>
                        </div>

                        <div>
                            <div style={{margin: '10px'}}>
                                <h5>Event Log:</h5>
                                {
                                    this.state.currentEventLog.map(task => {
                                        return (
                                            <Tag style={{margin: '5px'}} minimal="true" intent="success" large="true"
                                                 key={task}> {task}</Tag>)
                                    })
                                }
                            </div>
                        </div>

                        <div>
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
                                                <div style={{margin_bottom: '10px'}}>
                                                    <Select
                                                        items={this.state.selectedContractTasks}
                                                        itemRenderer={this.renderTask}
                                                        noResults={<MenuItem disabled={true} text="No results."/>}
                                                        onItemSelect={this.taskSelected}
                                                    >
                                                        {/* children become the popover target; render value here */}
                                                        <Button
                                                            text={this.state.taskToBeExecuted ? this.state.taskToBeExecuted.name : 'Choose task'}
                                                            rightIcon="double-caret-vertical"/>
                                                    </Select>
                                                </div>
                                                <br/>
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

module.exports = hot(module)(Processes);