const {Component} = require( "react");
const {hot} = require( "react-hot-loader");
const {Link} = require( 'react-router-dom');

const {Navbar, Button, MenuItem, Tag, ControlGroup, Alignment} = require( "@blueprintjs/core");
const {Select} = require( "@blueprintjs/select");
const ExchangeHandler = require( "../dataExchange/connection/ExchangeHandler");
const restConfig = require( "../dataExchange/connection/rest-config.json");

const Web3 = require("web3");

class Header extends Component {

    state = {
        storedConnections: [],
        selectedConnection: null,
        connected: false,
        selectedAccount: null,
        selectedSettings: null,
        storedAccounts: []
    }


    componentDidMount = async () => {
        // GET CONNECTIONS FROM THE DATABASE
        ExchangeHandler.sendRequest('GET', restConfig.SERVER_URL + '/web3Connections').then(response => {
            let web3Connections = response.data
            if (!web3Connections) {
                web3Connections = []
            }
            if (window.ethereum) {
                web3Connections.push({address: "MetaMask"});
            }
            this.setState({storedConnections: web3Connections});
        })

        // GET ACCOUNTS FROM THE DATABASE
        ExchangeHandler.sendRequest('GET', restConfig.SERVER_URL + '/accounts').then(response => {
            this.setState({storedAccounts: response.data ? response.data : []})
        })

        // GET SELECTED SETTINGS FROM THE DATABASE
        ExchangeHandler.sendRequest('GET', restConfig.SERVER_URL + '/settings')
            .then(response => {
                if (response.data.length !== 0) {
                    let settings = response.data[0]
                    this.setState({
                        selectedConnection: settings.isMetamask ? {address: 'MetaMask'} : settings.web3Connection,
                        selectedAccount: settings.account,
                        selectedSettings: settings
                    })
                    this.tryConnect(settings.web3Connection)
                }

                const handler = this.props.setAndUpdateConnection
                handler({
                    selectedConnection: this.state.selectedConnection,
                    selectedStoredAccount: this.state.selectedAccount
                })
            })
    }

    renderStoredAccounts = (storedAccount, {handleClick, modifiers}) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem
                active={modifiers.active}
                key={storedAccount.address}
                onClick={handleClick}
                text={storedAccount.address}
            />
        );
    };

    storedAccountSelected = async (e) => {
        this.setState({
            selectedAccount: e
        });

        let selectedSettings = this.state.selectedSettings
        ExchangeHandler.sendRequest(selectedSettings ? 'PATCH' : 'POST', restConfig.SERVER_URL + '/settings/' + (selectedSettings ? selectedSettings.id : ''),
            selectedSettings ? {accountId: e.id} : {accountId: e.id, isMetamask: false})
            .then(response => {
                if (!selectedSettings) {
                    log(response.data)
                    this.setState({selectedSettings: response.data})
                }
                const handler = this.props.setAndUpdateConnection;
                handler({
                    selectedConnection: this.state.selectedConnection,
                    selectedStoredAccount: this.state.selectedAccount
                })
            })
    }


    renderStoredConnections = (storedConnection, {handleClick, modifiers}) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }
        return (
            <MenuItem
                active={modifiers.active}
                key={storedConnection.address}
                onClick={handleClick}
                text={storedConnection.address}
            />
        );
    };

    storedConnectionSelected = async (e) => {
        this.setState({
            selectedConnection: e
        });

        let selectedSettings = this.state.selectedSettings
        ExchangeHandler.sendRequest(selectedSettings ? 'PATCH' : 'POST', restConfig.SERVER_URL + '/settings/' + (selectedSettings ? selectedSettings.id : ''),
            e.id ? {web3ConnectionId: e.id, isMetamask: false} : {isMetamask: true})
            .then(response => {
                if (!selectedSettings) {
                    log(response.data)
                    this.setState({selectedSettings: response.data})
                }
                const handler = this.props.setAndUpdateConnection
                handler({
                    selectedConnection: this.state.selectedConnection,
                    selectedStoredAccount: this.state.selectedAccount
                })
                this.tryConnect(e);
            })
    }

    tryConnect = async (e) => {
        let testConnection;
        if (this.state.selectedConnection.address === 'MetaMask') {
            testConnection = window.ethereum;
            console.log(testConnection)
            this.setState({connected: 'true'});
        } else {
            testConnection = new Web3(new Web3.providers.HttpProvider(e.address))
        }

        testConnection.eth.getAccounts().then(() => {
            this.setState({connected: testConnection.currentProvider.connected})
        }).catch(err => {
            console.error(`Cannot connect with selected Provider '${e.address}'`)
            this.setState({connected: false});
        });
    }


    render() {
        const handler = this.props.setAndUpdateConnection;

        return (
            <Navbar>
                <Navbar.Group>
                    <Navbar.Heading>
                        <img className="theimage" src='asset/chrysalis.png'/>

                        <span> CHRYSALIS </span>

                    </Navbar.Heading>
                    <Navbar.Divider/>
                    <Link to='/'><Button className="bp3-minimal" icon="home" text="Home"/></Link>
                    <Link to='/deployNewProcess'><Button className="bp3-minimal" icon="new-object"
                                                         text="Deploy Process"/></Link>
                    <Link to='/processes'><Button className="bp3-minimal" icon="exchange" text="All Processes"/></Link>
                    <Link to='/configure'><Button className="bp3-minimal" icon="cog" text="Configure"/></Link>
                    <Link to='/web3'><Button className="bp3-minimal" icon="info-sign" text="Info"/></Link>
                    <Link to='/accounts'><Button className="bp3-minimal" icon="user" text="Accounts"/></Link>


                </Navbar.Group>
                <Navbar.Group align={Alignment.RIGHT}>

                    <ControlGroup>

                        <Tag icon="user" large="true"> </Tag>
                        <Select
                            items={this.state.storedAccounts}
                            itemRenderer={this.renderStoredAccounts}
                            noResults={<MenuItem disabled={true} text="No results."/>}
                            onItemSelect={this.storedAccountSelected}
                        >
                            {/* children become the popover target; render value here */}
                            <Button
                                text={this.state.selectedAccount ? this.state.selectedAccount.address : 'Choose Account'}
                                rightIcon="double-caret-vertical"/>
                        </Select>
                    </ControlGroup>


                    <ControlGroup style={{marginLeft: '20px'}}>
                        {
                            this.state.connected ?
                                <Tag icon="feed" intent="success" large="true"> </Tag> :
                                <Tag icon="offline" intent="danger" large="true"> </Tag>
                        }
                        <Select
                            items={this.state.storedConnections}
                            itemRenderer={this.renderStoredConnections}
                            noResults={<MenuItem disabled={true} text="No results."/>}
                            onItemSelect={this.storedConnectionSelected}
                        >
                            {/* children become the popover target; render value here */}
                            <Button
                                text={this.state.selectedConnection ? this.state.selectedConnection.address : 'Choose connection'}
                                rightIcon="double-caret-vertical"/>
                        </Select>

                    </ControlGroup>
                </Navbar.Group>
            </Navbar>
        );
    }
}

module.exports = hot(module)(Header);