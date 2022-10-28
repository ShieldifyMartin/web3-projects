// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    string
        private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64";

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
    }

    function svgToImageURI()
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64
            .encode(
                bytes(string(abi.encodePacked()))
            );
    }

    function mintNft(int256 highValue) public {
        _safeMint(msg.sender, highValue);
    }
}
