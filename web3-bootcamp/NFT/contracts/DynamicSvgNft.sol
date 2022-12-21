// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error ERC721Metadata_URI_QueryFor_NonExistentToken();
error Stale_Data();

contract DynamicSvgNft is ERC721 {
    uint256 constant stalePriceDelay = 10 days;
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;

    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) private s_tokenIdHighValues;

    event NftCreated(uint256 indexed tokenCounter, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
    }

    function svgToImageURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(abi.encodePacked(svg))
        );
        return string(abi.encodePacked(_baseURI(), svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdHighValues[s_tokenCounter] = highValue;
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(msg.sender, s_tokenCounter);
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

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert ERC721Metadata_URI_QueryFor_NonExistentToken();
        }

        (, int256 price, uint256 updatedAt, , ) = i_priceFeed
            .latestRoundData();

        if (block.timestamp <= updatedAt + stalePriceDelay) {
            revert Stale_Data();
        }

        string memory imageURI = s_lowImageURI;
        if (price >= s_tokenIdHighValues[tokenId]) {
            imageURI = s_highImageURI;
        }

        return
            string(
                abi.encodePacked(
                    '{"name":"',
                    name(),
                    '", "description":"An NFT that changes based on the Chainlink Feed", ',
                    '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                    imageURI,
                    '"}'
                )
            );
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
