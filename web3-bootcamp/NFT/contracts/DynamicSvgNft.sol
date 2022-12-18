// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;

    mapping(uint256 => uint256) private s_tokenIdHighValues;

    event NftCreated(uint256 indexed tokenCounter, uint256 highValue);

    constructor()
        // address priceFeedAddress,
        // string memory lowSvg,
        // string memory highSvg
        ERC721("Dynamic SVG NFT", "DSN")
    {
        s_lowImageURI = svgToImageURI();
        s_highImageURI = svgToImageURI();
    }

    function svgToImageURI() public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked()))
        );
        return svgBase64Encoded;
    }

    function mintNft(uint256 highValue) public {
        s_tokenIdHighValues[s_tokenCounter] = highValue;
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(msg.sender, highValue);
        emit NftCreated(s_tokenCounter, highValue);
    }

    // Getters
    function _baseURI()
        internal
        pure
        override
        returns (string memory)
    {
        return "data:image/svg+xml;base64";
    }

    function getLowSvg() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSvg() public view returns (string memory) {
        return s_highImageURI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
