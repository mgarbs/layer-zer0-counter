// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";

contract CounterOApp is OApp {
    uint256 public counter;

    event LogSendIncrement(uint32 dstEid, uint256 msgValue, uint256 nativeFee);
    event LogLzReceive(uint256 newCounter, uint256 currentCounter);

    constructor(
        address _endpoint,
        address _initialOwner
    ) OApp(_endpoint, _initialOwner) Ownable(msg.sender) {}

    function getCounter() public view returns (uint256) {
        return counter;
    }

    function sendIncrement(
        uint32 _dstEid,
        bytes calldata _options
    ) external payable {
        bytes memory payload = abi.encode(counter + 1);
        MessagingFee memory fee = _quote(_dstEid, payload, _options, false);
        emit LogSendIncrement(_dstEid, msg.value, fee.nativeFee);

        require(msg.value >= fee.nativeFee, "Insufficient msg.value");
        
        _lzSend(
            _dstEid,
            payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
        
        emit LogSendIncrement(_dstEid, msg.value, fee.nativeFee);
    }

    function _lzReceive(
        Origin calldata, 
        bytes32, 
        bytes calldata _payload, 
        address, 
        bytes calldata 
    ) internal override {
        uint256 newCounter = abi.decode(_payload, (uint256));
        emit LogLzReceive(newCounter, counter);
        if (newCounter > counter) {
            counter = newCounter;
        }
    }

    function quote(
        uint32 _dstEid, // Destination chain's endpoint ID.
        bytes calldata _options, // Message execution options
        bool _payInLzToken // boolean for which token to return fee in
    ) public view returns (uint256 nativeFee, uint256 lzTokenFee) {
        bytes memory _payload = abi.encode(counter + 1);
        MessagingFee memory fee = _quote(
            _dstEid,
            _payload,
            _options,
            _payInLzToken
        );
        return (fee.nativeFee, fee.lzTokenFee);
    }

    function setPeer(uint32 _eid, bytes32 _peer) public virtual override onlyOwner {
        peers[_eid] = _peer; // Array of peer addresses by destination.
        emit PeerSet(_eid, _peer); // Event emitted each time a peer is set.
    }

    function getEndpoint() public view returns (address) {
        return address(endpoint);
    }
}