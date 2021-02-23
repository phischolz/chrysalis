import React, { Component} from "react";
import {hot} from "react-hot-loader";
import { Link } from 'react-router-dom';


import {Navbar, Button} from  "@blueprintjs/core";

class Header extends Component{
    render(){
      return(
        <Navbar>
        <Navbar.Group >
            <Navbar.Heading>BUTTERfly</Navbar.Heading>
            <Navbar.Divider />
            <Link to='/'><Button className="bp3-minimal" icon="home" text="Home" /></Link>
            <Link to='/deployNewProcess'><Button className="bp3-minimal" icon="document" text="Files" /></Link>
            <Link to='/web3'><Button className="bp3-minimal" icon="document" text="WEb3" /></Link>
        </Navbar.Group>
    </Navbar>
      );
    }
  }
  
  export default hot(module)(Header);