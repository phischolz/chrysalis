import React, {Component} from "react";
import {hot} from "react-hot-loader";
import Header from './Header';

import {
    Button,
    Card,
    Icon,
    ControlGroup,
    RadioGroup,
    FileInput,
    InputGroup,
    Radio
} from "@blueprintjs/core";
import ExchangeHandler from "../dataExchange/connection/ExchangeHandler";
import restConfig from "../dataExchange/connection/rest-config.json";

class Configure extends Component {

    state = {
        selectedFile: "Select a file...",
        selectedStoredAbi: '',
        storedAbis: [],
        currentAbi: "",
        currentAbiName: ""
    }

    SERVER_ENDPOINT = restConfig.SERVER_URL + '/abis'

    /**
     * Getting list of abi configs from the database and updating state
     */
    fetchAbis = () => {
        ExchangeHandler.sendRequest('GET', this.SERVER_ENDPOINT).then(response => {
            this.setState({storedAbis: response.data})
        })
    }

    componentDidMount() {
        this.fetchAbis()
    }

    readConfig = async (e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = (e.target.result)
            this.setState({currentAbi: text})
        };
        reader.readAsText(e.target.files[0]);
        this.setState({selectedFile: e.target.files[0].name});
    }

    storeNetworkConfig = async () => {
        ExchangeHandler.sendRequest('POST', this.SERVER_ENDPOINT,
            {key: this.state.currentAbiName, abi: this.state.currentAbi})
            .then(this.fetchAbis)
    }

    deleteNetworkConfig = async () => {
        ExchangeHandler.sendRequest('DELETE', this.SERVER_ENDPOINT + '/' + this.state.selectedStoredAbi)
            .then(this.fetchAbis)
    }

    selectedStoredAbiChanged = (event) => {
        this.setState({selectedStoredAbi: event.target.value});
    };

    updateInput = (event) => {
        this.setState({currentAbiName: event.target.value});
    }

    render() {
        return (
            <div>
                <Header setAndUpdateConnection={() => {
                }}/>
                <div className="content">
                    <h3>Private Net Configuration</h3>

                    <Card interactive={true} style={{margin: '10px', maxWidth: '500px'}}>

                        <h4><Icon icon="folder-new" iconSize={32}/> Add a new Configuration</h4>

                        <ControlGroup fill={true} vertical={false}>
                            <InputGroup onChange={this.updateInput} id="text-input"
                                        placeholder="Name the configuration..." intent="primary"/>
                            <FileInput text={this.state.selectedFile} onInputChange={this.readConfig}/>
                        </ControlGroup>

                        <Button style={{margin: '10px'}}
                                intent="primary"
                                icon="floppy-disk"
                                onClick={this.storeNetworkConfig}
                        />
                    </Card>

                    <Card interactive={true} style={{margin: '10px', maxWidth: '500px'}}>
                        <h4><Icon icon="trash" iconSize={32}/>Delete an existing Configuration</h4>

                        <RadioGroup
                            label="Available Configurations"
                            onChange={this.selectedStoredAbiChanged}
                            selectedValue={this.state.selectedStoredAbi}
                        >
                            {
                                this.state.storedAbis.map(abi => {
                                    return (<Radio key={abi.id.toString()} value={abi.id.toString()} label={abi.key}/>)
                                })
                            }
                        </RadioGroup>

                        <Button style={{margin: '10px'}}
                                intent="warning"
                                icon="eraser"
                                onClick={this.deleteNetworkConfig}
                        />

                    </Card>

                </div>
            </div>
        );
    }
}

export default hot(module)(Configure);