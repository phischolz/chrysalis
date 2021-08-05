const {Component} = require( "react");
const {hot} = require( "react-hot-loader");
const ReactJson = require( 'react-json-view');
const Header = require( './Header');
const restConfig = require( "../dataExchange/connection/rest-config.json");


const {
    //AnchorButton,
    Button,
    FileInput,
    Radio,
    RadioGroup,
    Dialog,
    Classes,
    Intent,
    ProgressBar, MenuItem

} = require( "@blueprintjs/core");

const ExchangeHandler = require( "../dataExchange/connection/ExchangeHandler");
const {Select} = require( "@blueprintjs/select");

const EnzianYellow = require("enzian-yellow");

class Deploy extends Component {


    state = {
        selectedFile: "Select a file...",
        enzianModel: undefined,
        network: 'main',
        selectedAbi: '',
        storedAbis: [],
        selectedStoredAbiId: 'custom',
        selectedStoredAccount: null,

        storedConnections: [],
        selectedConnection: '',
        chainTypes: ['ethereum', 'hyperledger'],
        selectedChainType: 'ethereum',
        isDialogOpen: false,
        deploymentProgress: 1,
    }

    enzian;

    constructor(props) {
        super(props);
        //if (window.ethereum) this.enzian = new EnzianYellow(window.ethereum);

    }

    componentDidMount() {
        ExchangeHandler.sendRequest('GET', restConfig.SERVER_URL + '/abis').then(response => {
            this.setState({storedAbis: response.data})
        })
    }

    selectedStoredAbiChanged = (event) => {
        this.setState({selectedStoredAbiId: event.target.value})
    };

    handleChange = (event) => {
        this.setState({network: event.target.value});
    };

    readBPMN = async (e) => {
        e.preventDefault()
        const reader = new FileReader()

        reader.onload = async (e) => {
            const text = (e.target.result)
            console.log(text);

            this.setEnzian();
            let parsedBPMN = await this.enzian.parseBpmnModel(text);

            console.log(parsedBPMN);
            this.setState({enzianModel: parsedBPMN})
        };

        reader.readAsText(e.target.files[0]);
        this.setState({selectedFile: e.target.files[0].name});

    }

    readABI = async (e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = (e.target.result)
            console.log(JSON.parse(text));
            this.setState({selectedAbi: JSON.parse(text)})
        };
        reader.readAsText(e.target.files[0]);
        this.setState({selectedFile: e.target.files[0].name});
    }


    deployModel = async () => {

        this.setState({isDialogOpen: true});
        switch (this.state.network) {
            case 'main':
                console.log("Deploying to Main");
                break;
            case 'ropsten':
                console.log("Deploying to Testnet");
                break;
            case 'private':
                if (this.state.selectedStoredAbiId === 'custom') {
                    console.log("Reading network from file");
                } else {
                    let selectedStoredAbi = this.state.storedAbis.find(abi => abi.id.toString() === this.state.selectedStoredAbiId)
                    await this.setState({selectedAbi: JSON.parse(selectedStoredAbi.abi)});
                    console.log("STATE SET")
                }
                break;
        }
        console.log("deploying with ", this.state.selectedConnection.address)

        this.setEnzian();
        let result = await this.enzian.deployEnzianModel(this.state.enzianModel);


        this.postContract(result)
        console.log("finish");
        this.setState({isDialogOpen: false});

    }



    setEnzian = () => {
        if ( this.state.selectedChainType === "ethereum" && this.state.selectedConnection.address === 'MetaMask'){
            this.enzian = new EnzianYellow(window.ethereum, undefined, undefined, {compiled: this.state.selectedAbi});
        } else {
            this.enzian = new EnzianYellow(
                this.state.selectedConnection.address,
                this.state.selectedStoredAccount.privateKey,
                this.state.selectedChainType,
                {compiled: this.state.selectedAbi} //actually not "abi" but "compiled", containing abi and evm.
            );
        }
    }

    /**
     * Posting depolyed contract and its tasks to the database
     * @param contract
     */
    postContract = (contract) => {
        // TAKING MODEL NAME FROM THE UPLOADED FILE
        let contractName = this.state.selectedFile.substr(0, this.state.selectedFile.indexOf('.'))
        let tasks = this.state.enzianModel.obj.map(obj => {
            return {number: obj.task.id, name: obj.task.name}
        })
        ExchangeHandler.sendRequest('POST', restConfig.SERVER_URL + '/processes', {
            name: contractName,
            address: contract,
            tasks: Array.isArray(tasks) ? tasks : []
        })
    }

    setAndUpdateConnection = (value) => {
        this.setState({
            selectedConnection: value.selectedConnection,
            selectedStoredAccount: value.selectedStoredAccount
        })
    }

    renderChainType = (selectedChainType, {handleClick, modifiers}) => {
        if (modifiers && !modifiers.matchesPredicate) {
            return null;
        }
        return (
            <MenuItem
                active={modifiers.active}
                key={selectedChainType}
                onClick={handleClick}
                text={selectedChainType}
            />
        );
    }

    chainTypeSelected = (e) => {
        console.log("selected Chain Type: " + e);
        this.setState({selectedChainType: e}, this.setEnzian);

    }

    render() {
        return (
            <div>
                <Header setAndUpdateConnection={this.setAndUpdateConnection}/>
                <div className="content">
                    <h1>Deploy</h1>
                    <div style={{display: 'flex'}}>

                        <div style={{margin: '10px'}}>
                            <h5>Upload a new BPMN-Model</h5>
                            <FileInput text={this.state.selectedFile} onInputChange={this.readBPMN}/>
                        </div>

                        <div>
                            <div style={{margin: '10px'}}>
                                <h5>Parsed Model:</h5>
                                <ReactJson src={this.state.enzianModel}/>
                            </div>
                        </div>

                        <div>
                            <div style={{margin: '10px', maxWidth: '500px'}}>
                                <h5>Deploy Model</h5>

                                <p>Select the Network you want to deploy the contract on.
                                    The decision determines, where the decision library was deployed on (address).
                                    This address is decisive for the Process Contract-ABI to use.
                                </p>


                                <RadioGroup
                                    inline
                                    label="Network"
                                    onChange={this.handleChange}
                                    selectedValue={this.state.network}
                                >
                                    <Radio label='Ethereum Mainnet' value="main"
                                           checked={this.state.network === 'main'}/>
                                    <Radio label="Ropsten Testnet" value="ropsten"
                                           checked={this.state.network === 'ropsten'}/>
                                    <Radio label="Private Net" value="private"
                                           checked={this.state.network === 'private'}/>
                                </RadioGroup>

                                <div>
                                    {this.state.network === 'private' ?
                                        <div>
                                            <h4>DEPLOYMENT TO PRIVATE NETWORK</h4>

                                            <p>
                                                If you are working on a private network, you have to deploy the decision
                                                library on your own,
                                                precompile the contract and provide the ABI below.
                                            </p>
                                            <p>
                                                Compilation in butterfly is not supported yet, as solc has a dependency
                                                to fs which is not supported in browser environment.
                                            </p>
                                            <p>
                                                Please select your connection Type:
                                            </p>
                                            <Select
                                                items={this.state.chainTypes}
                                                itemRenderer={this.renderChainType}
                                                noResults={<MenuItem disabled={false} text="No results."/>}
                                                onItemSelect={this.chainTypeSelected}
                                            >
                                                {/* children become the popover target; render value here */}
                                                <Button text={this.state.selectedChainType} rightIcon="double-caret-vertical"/>
                                            </Select>


                                            <div>
                                                <h5>Or use an existing Network Configuration</h5>

                                                <RadioGroup
                                                    onChange={this.selectedStoredAbiChanged}
                                                    selectedValue={this.state.selectedStoredAbiId}
                                                >
                                                    {
                                                        this.state.storedAbis.map(abi => {
                                                            return (
                                                                <Radio key={abi.id.toString()} value={abi.id.toString()}
                                                                       label={abi.key}/>)
                                                        })
                                                    }
                                                    <Radio key="custom" value="custom" label="Custom"/>
                                                </RadioGroup>

                                            </div>

                                            {
                                                this.state.selectedStoredAbiId === 'custom' ?
                                                    <div style={{margin: '10px'}}>
                                                        <h5>Upload the Contract-ABI with the linked Decision
                                                            Library</h5>
                                                        <FileInput text='Select an ABI...'
                                                                   onInputChange={this.readABI}/>
                                                    </div>
                                                    : ''

                                            }


                                        </div>
                                        : ''
                                    }

                                </div>
                                <Button
                                    intent="primary"
                                    rightIcon="send-to-graph"
                                    text="Deploy Model to Blockchain"
                                    onClick={this.deployModel}
                                /> <span/>

                            </div>
                        </div>

                    </div>

                </div>


                <Dialog
                    isOpen={this.state.isDialogOpen}
                    icon="info-sign"
                    title="Your Process Contract is being deployed..."
                    onClose={() => {
                        this.setState({isDialogOpen: false})
                    }}
                >
                    <div className={Classes.DIALOG_BODY}>
                        <p>
                            <strong>
                                The Contract is now being deployed.
                                Afterwards, the Tasks are pured into the new Contract.
                            </strong>
                        </p>
                        <p>
                            For each Task, a new Transaction is created, signed and must be verified.
                            This will take some time (aprox. 15 seconds per task, based on the Blockchain
                            Confirugration).
                        </p>
                        <p>
                            <strong>
                                Press F12 to open the Browser Console to get more Information in the progress...
                            </strong>
                        </p>
                        <ProgressBar intent={Intent.PRIMARY} value={this.state.deploymentProgress}/>


                    </div>

                </Dialog>


            </div>
        );
    }
}

module.exports = hot(module)(Deploy);


  