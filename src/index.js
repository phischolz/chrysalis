const React = require('react')
const {render} = require('react-dom')
const { Router, Switch, Route } = require('react-router-dom');
const App = require("./App.js");
const Configure = require('./components/Configure.js');
const Deploy = require('./components/Deploy.js');
const Processes = require( './components/Processes.js');
const Web3Info = require( './components/Web3Info.js');
const Accounts = require( './components/Accounts.js');
const history = require( './history');

render(
    <Router history={history}>
        <Switch>
            <Route exact path='/' component={App} />
            <Route exact path='/deployNewProcess' component={Deploy} />
            <Route exact path='/processes' component={Processes} />
            <Route exact path='/configure' component={Configure} />
            <Route exact path='/web3' component={Web3Info} />
            <Route exact path='/accounts' component={Accounts} />
        </Switch>
    </Router>,
    document.getElementById('root')
);
