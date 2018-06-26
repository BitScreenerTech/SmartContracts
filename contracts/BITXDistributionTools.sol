pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './BitScreenerToken.sol';

contract BITXDistributionTools is Ownable {
  BitScreenerToken public token;

  constructor(BitScreenerToken _token) 
    public
  {
    token = _token;
  }

  function issueToMany(address[] _recipients, uint256[] _amount) 
    public
    onlyOwner
  {
    require(_recipients.length == _amount.length);
    for (uint i = 0; i < _recipients.length; i++) {
      // Issue once only
      if (token.balanceOf(_recipients[i]) < _amount[i]) {
        require(token.issue(_recipients[i], _amount[i]));
      }
    }
  }
}
