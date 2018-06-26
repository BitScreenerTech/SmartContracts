pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC827/ERC827Token.sol';
import './MultiOwnable.sol';

contract BitScreenerToken is ERC827Token, MultiOwnable {
  string public name = 'BitScreenerToken';
  string public symbol = 'BITX';
  uint8 public decimals = 18;
  uint256 public totalSupply;
  address public owner;

  bool public allowTransfers = false;
  bool public issuanceFinished = false;

  event AllowTransfersChanged(bool _newState);
  event Issue(address indexed _to, uint256 _value);
  event Burn(address indexed _from, uint256 _value);
  event IssuanceFinished();

  modifier transfersAllowed() {
    require(allowTransfers);
    _;
  }

  modifier canIssue() {
    require(!issuanceFinished);
    _;
  }

  constructor(address[] _owners) public {
    _setOwners(_owners);
  }

  /**
  * @dev Enable/disable token transfers. Can be called only by owners
  * @param _allowTransfers True - allow False - disable
  */
  function setAllowTransfers(bool _allowTransfers) external onlyOwner {
    allowTransfers = _allowTransfers;
    emit AllowTransfersChanged(_allowTransfers);
  }

  function transfer(address _to, uint256 _value) public transfersAllowed returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public transfersAllowed returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  function transferAndCall(address _to, uint256 _value, bytes _data) public payable transfersAllowed returns (bool) {
    return super.transferAndCall(_to, _value, _data);
  }

  function transferFromAndCall(address _from, address _to, uint256 _value, bytes _data) public payable transfersAllowed returns (bool) {
    return super.transferFromAndCall(_from, _to, _value, _data);
  }

  /**
  * @dev Issue tokens to specified wallet
  * @param _to Wallet address
  * @param _value Amount of tokens
  */
  function issue(address _to, uint256 _value) external onlyOwner canIssue returns (bool) {
    totalSupply = totalSupply.add(_value);
    balances[_to] = balances[_to].add(_value);
    emit Issue(_to, _value);
    emit Transfer(address(0), _to, _value);
    return true;
  }

  /**
  * @dev Finish token issuance
  * @return True if success
  */
  function finishIssuance() public onlyOwner returns (bool) {
    issuanceFinished = true;
    emit IssuanceFinished();
    return true;
  }

  /**
  * @dev Burn tokens
  * @param _value Amount of tokens to burn
  */
  function burn(uint256 _value) external {
    require(balances[msg.sender] >= _value);
    totalSupply = totalSupply.sub(_value);
    balances[msg.sender] = balances[msg.sender].sub(_value);
    emit Transfer(msg.sender, address(0), _value);
    emit Burn(msg.sender, _value);
  }
}
