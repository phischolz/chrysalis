const {Component} = require( "react");
const {hot} = require( "react-hot-loader");
const Header = require( './Header');

const Web3 = require("web3");
const restConfig = require( '../dataExchange/connection/rest-config.json');
const ExchangeHandler = require( "../dataExchange/connection/ExchangeHandler");
const {
    Button,
    Card,
    ControlGroup,
    Elevation,
    Icon,
    InputGroup,
    Tag

} = require( "@blueprintjs/core");


class Web3Info extends Component {


    state = {
        metaMask: false,
        provider: "",
        connectionUrl: "",
        selectedConnection: "http://127.0.0.1:8545",
        storedConnections: [],

        currentNewUrl: ""
    };

    SERVER_ENDPOINT = restConfig.SERVER_URL + '/web3Connections'

    /**
     * Getting connections from the database
     */
    fetchConnections = () => {
        ExchangeHandler.sendRequest('GET', this.SERVER_ENDPOINT).then(response => {
            this.setState({storedConnections: response.data ? response.data : []})
        })
    }

    componentDidMount() {
        this.fetchConnections()
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            window.ethereum.send('eth_requestAccounts')
                .then(r => console.log("r", r));
            window.web3.eth.getAccounts().then(accounts => {
                this.setState({metaMask: accounts[0]});
            });
        } else {
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
        this.setState({currentNewUrl: event.target.value});
    }

    deleteConnection = (connection) => {
        ExchangeHandler.sendRequest('DELETE', this.SERVER_ENDPOINT + '/' + connection.id)
            .then(this.fetchConnections)
    }

    addNewConnection = async () => {
        ExchangeHandler.sendRequest('POST', this.SERVER_ENDPOINT, {address: this.state.currentNewUrl})
            .then(() => {
                this.setState({currentNewUrl: ""})
                this.fetchConnections()
            })
    }

    render() {
        return (
            <div>
                <Header setAndUpdateConnection={() => {
                }}/>
                <div className="content">
                    <h1>Blockchain Connection Management</h1>

                    <div id="metaMask">
                        <h3>Browser-driven Connection with MetaMask</h3>
                        <Card style={{width: '400px'}}>
                            <h4>MetaMask Connection</h4>
                            <p>MetaMask Browser Extension uses an Infura Node Provider API to connect to a Blockchain
                                Network.</p>
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
                                        <p>Please visit your Browser AppStore to install the MetaMask Browser
                                            Extension.</p>
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
                        <div style={{margin: '10px', display: 'flex'}}>
                            {
                                this.state.storedConnections.map(connection => {
                                    return (
                                        <Card key={connection.address} style={{width: '300px'}}>
                                            <h2><Icon icon="ip-address" iconSize={32}/> Connection</h2>

                                            <div>URL: <b>{connection.address}</b></div>
                                            <br/>
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
                                    <InputGroup onChange={this.updateNewUrl} value={this.state.currentNewUrl}
                                                id="text-input" placeholder="Connection URL..." intent="primary"/>
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

module.exports = hot(module)(Web3Info);