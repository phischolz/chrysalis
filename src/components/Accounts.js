import React, {Component} from "react";
import {hot} from "react-hot-loader";
import Header from './Header';

const Web3 = require("web3");


import {
    Button,
    RadioGroup,
    ControlGroup,
    Radio,
    //Icon,
    //Tag,
    InputGroup
} from "@blueprintjs/core";
// import { Select } from "@blueprintjs/select";
import ExchangeHandler from "../dataExchange/connection/ExchangeHandler";
import restConfig from "../dataExchange/connection/rest-config.json";


class Accounts extends Component {


    state = {
        selectedConnection: '',
        connectionSelected: false,

        selectedStoredAccount: '',
        storedAccounts: [],

        currentImportAccount: ''
    };

    SERVER_ENDPOINT = restConfig.SERVER_URL + '/accounts'

    /**
     * Get accounts from the database and update the state
     */
    fetchAccounts = () => {
        ExchangeHandler.sendRequest('GET', this.SERVER_ENDPOINT).then(response => {
            this.setState({storedAccounts: response.data})
        })
    }

    /**
     * Post an account to the database and fetch the state
     * @param accountData - account being posted
     */
    postAccount = (accountData) => {
        ExchangeHandler.sendRequest('POST', this.SERVER_ENDPOINT, accountData)
            .then(this.fetchAccounts)
    }

    componentDidMount() {
        this.fetchAccounts()
    }

    setAndUpdateConnection = (value) => {
        this.setState({
            selectedConnection: value.selectedConnection,
            selectedStoredAccount: value.selectedStoredAccount
        })
    }

    createAccount = async () => {

        console.log("New contract with ", this.state.selectedConnection.address)

        switch (this.state.selectedConnection.address) {
            case 'MetaMask': break;
            default:
                let web3Instance = new Web3(new Web3.providers.HttpProvider(this.state.selectedConnection.address));
                let newAccount = await web3Instance.eth.accounts.create();
                console.log('newAccount', newAccount);
                this.postAccount({address: newAccount.address, privateKey: newAccount.privateKey})
                break;
        }
    }

    updateInputImportAccount = (event) => {
        this.setState({currentImportAccount: event.target.value});
    }

    importAccount = () => {
        let web3Instance = new Web3(new Web3.providers.HttpProvider(this.state.selectedConnection.address));
        let importedAccount = web3Instance.eth.accounts.privateKeyToAccount(this.state.currentImportAccount);
        this.postAccount({address: importedAccount.address, privateKey: importedAccount.privateKey})
    }

    selectedStoredAccountChanged = (event) => {
        this.setState({selectedStoredAccount: event.target.value});
    }


    render() {
        return (
            <div>
                <Header setAndUpdateConnection={this.setAndUpdateConnection}/>
                <div className="content">
                    <h1>{this.state.handlerValue}</h1>
                    <h1>Account Management</h1>
                    <h3>Create a new Account</h3>
                    <p>This generates a new Keypair. However, please consider, that the new Account do not have any
                        funds on any network.</p>
                    <ControlGroup>
                        {
                            <Button
                                intent="primary"
                                rightIcon="send-to-graph"
                                text="Create new Account"
                                onClick={this.createAccount}
                            />
                        }
                    </ControlGroup>

                    <h3>Import an Account</h3>
                    <p>This generates a new Keypair. However, please consider, that the new Account do not have any
                        funds on any network.</p>
                    <ControlGroup>
                        <InputGroup onChange={this.updateInputImportAccount} id="text-input"
                                    placeholder="Paste your private key here..." intent="primary" style={{
                            width: '800px',
                            fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace'
                        }}/>
                        {
                            <Button
                                intent="primary"
                                rightIcon="import"
                                text="Import Account"
                                onClick={this.importAccount}
                            />
                        }
                    </ControlGroup>


                    <h3>Accounts</h3>
                    <RadioGroup
                        label="Available Accounts"
                        onChange={this.selectedStoredAccountChanged}
                        selectedValue={this.state.selectedStoredAccount}
                    >
                        {
                            this.state.storedAccounts.map(account => {
                                return (<Radio key={account.address} value={account.address} label={account.address}/>)
                            })
                        }
                    </RadioGroup>
                </div>
            </div>
        );
    }
}

export default hot(module)(Accounts);