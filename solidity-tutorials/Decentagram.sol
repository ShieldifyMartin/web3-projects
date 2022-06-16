// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

contract Decentagram {
    string public name = "Decentagram";

    uint256 public imageCount = 0;
    mapping(uint256 => Image) public images;

    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    event ImageCreated(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    function uploadImage(string memory _imageHash, string memory _description)
        public
    {
        require(bytes(_imageHash).length > 0);
        require(bytes(_description).length > 0);
        require(msg.sender != address(0x0));
        ++imageCount;
        images[imageCount] = Image(
            imageCount,
            _imgHash,
            _description,
            0,
            msg.sender
        );
        emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
    }

    function tipImageOwner(uint256 _id) public payable {
        require(_id > 0 && _id <= imageCount);
        Image memory _image = images[_id];
        address payable _author = _image.author;
        address(_author).transfer(msg.value);
        _image.tipAmount = _image.tipAmount + msg.value;
        images[_id] = _image;
        emit ImageTipped(
            _id,
            _image.hash,
            _image.description,
            _image.tipAmount,
            _author
        );
    }
}
