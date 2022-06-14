// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

contract VideoPlatform {
    string public name = "VideoPlatform";
    uint256 public videoCount = 0;
    mapping(uint256 => Video) public videos;

    struct Video {
        uint256 id;
        string hash;
        string title;
        address author;
    }

    event VideoUploaded(uint256 id, string hash, string title, address author);

    function uploadVideo(string memory _videoHash, string memory _title)
        public
    {
        require(bytes(_videoHash).length > 0);
        require(bytes(_title).length > 0);
        require(msg.sender != address(0));

        videoCount++;
        uint256 id = videoCount;
        videos[id] = Video(id, _videoHash, _title, msg.sender);
        emit VideoUploaded(id, _videoHash, _title, msg.sender);
    }
}
