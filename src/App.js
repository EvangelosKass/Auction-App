import React, { Component } from "react";
import Auction from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {highestBidder:null, highestBid: 0, web3: null, accounts: null, contract: null, bidAmount:0,yourBid:0, statusMsg:"" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Auction.networks[networkId];
      const instance = new web3.eth.Contract(
        Auction.abi,
        deployedNetwork && deployedNetwork.address,
      );
      

      // Set state
      this.setState({web3, accounts, contract: instance }, this.getInfo);
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getInfo = async () => {
    const contract = this.state.contract;

    //get highestBidder
    var highestBidder = await contract.methods.highestBidder().call();
      
    //get highestBid
    var highestBid = await contract.methods.highestBid().call();
    
    //get users bid
    var yourBid = await contract.methods.userBalances(this.state.accounts[0]).call();

    // Update state with the result.
    this.setState({ highestBidder,highestBid , yourBid });

    
    //auto refresh every 2 second
    setTimeout(this.getInfo, 2000);
  };
  
  bid = async ()=>{
  	const {accounts, contract, bidAmount} = this.state;
  	
  	if(bidAmount <= 0){
  		this.setState({statusMsg:"Please enter a valid bid"});
  		return;
  	}
  	
  	
  	try{
  		this.setState({statusMsg:"Placing bid please wait.."});
  		let response = await contract.methods.bid().send({from: accounts[0], value: bidAmount});
  		this.setState({statusMsg:"Bid placed successfully"});
  	}catch(error){
  		this.setState({statusMsg:"Bid was not placed successfully"});
  		console.error(error);
  	}
  }
  
  withdraw = async ()=>{
  	const {accounts, contract} = this.state;
  	
  	try{
  		this.setState({statusMsg:"Withdraw in progress please wait.."});
  		let response = await contract.methods.withdraw().send({from: accounts[0]});
  		this.setState({statusMsg:"Withdraw was successfull"});
  	}catch(error){
  		this.setState({statusMsg:error.message});
  		console.error(error);
  	}
  }
  
  bidChangeHandler = (event) => {
  	const bidinput = Number(event.target.value);

  	if(!isNaN(bidinput)){
  		this.setState({bidAmount:event.target.value, statusMsg:""});
  	}else{
  		this.setState({statusMsg:"Please enter a valid bid"});
  	}
  
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
      
      	<div className="info">
		<h1>Auction</h1>
		<p><strong>Highest Bidder:</strong> {this.state.highestBidder}</p>
		<p><strong>Highest Bid:</strong> {this.state.highestBid} Wei</p>
		<p className={(this.state.accounts[0]==this.state.highestBidder)?"green":"red"}><strong>Your Bid:</strong> {this.state.yourBid}</p>
        </div>
        
        <div className="controls">
        	<div><strong>Make a Bid (in Wei): </strong><input onChange={this.bidChangeHandler}/> <button onClick={this.bid}>Bid</button></div>
        	<h3>or</h3>
        	<button onClick={this.withdraw}>Withdraw</button>
        	
        </div>
        
        <div className="status">
        <h3>{this.state.statusMsg}</h3>
        </div>
        
      </div>
    );
  }
}

export default App;
