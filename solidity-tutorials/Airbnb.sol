// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

contract airbnb {
    address public owner;
    uint256 private counter;

    constructor() {
        counter = 0;
        owner = msg.sender;
    }

    struct rentalInfo {
        string name;
        string city;
        string latitude;
        string longitude;
        string description;
        string imageUrl;
        uint256 maxGuests;
        uint256 pricePerDay;
        string[] datesBooked;
        uint256 id;
        address renter;
    }

    event rentalCreated(
        string name,
        string city,
        string latitude,
        string longitude,
        string description,
        string imageUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        string[] datesBooked,
        uint256 id,
        address renter
    );

    event newDatesBooked(
        string[] datesBooked,
        uint256 id,
        address booker,
        string city,
        string imageUrl
    );

    mapping(uint256 => rentalInfo) rentals;
    uint256[] public rentalIds;

    function addRentals(
        string memory name,
        string memory city,
        string memory latitude,
        string memory longitude,
        string memory description,
        string memory imageUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        string[] memory datesBooked
    ) public {
        require(
            msg.sender == owner,
            "Only owner of smart contract can put up rentals"
        );
        rentalInfo storage newRental = rentals[counter];
        newRental.name = name;
        newRental.city = city;
        newRental.latitude = latitude;
        newRental.longitude = longitude;
        newRental.description = description;
        newRental.imageUrl = imageUrl;
        newRental.maxGuests = maxGuests;
        newRental.pricePerDay = pricePerDay;
        newRental.datesBooked = datesBooked;
        newRental.id = counter;
        newRental.renter = owner;
        rentalIds.push(counter);
        emit rentalCreated(
            name,
            city,
            latitude,
            longitude,
            description,
            imageUrl,
            maxGuests,
            pricePerDay,
            datesBooked,
            counter,
            owner
        );
        counter++;
    }

    function checkBookings(uint256 id, string[] memory newBookings)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < newBookings.length; i++) {
            for (uint256 j = 0; j < rentals[id].datesBooked.length; j++) {
                if (
                    keccak256(abi.encodePacked(rentals[id].datesBooked[j])) ==
                    keccak256(abi.encodePacked(newBookings[i]))
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    function addDatesBooked(uint256 id, string[] memory newBookings)
        public
        payable
    {
        require(id < counter, "No such Rental");
        require(
            checkBookings(id, newBookings),
            "Already Booked For Requested Date"
        );
        require(
            msg.value ==
                (rentals[id].pricePerDay * 1 ether * newBookings.length),
            "Please submit the asking price in order to complete the purchase"
        );

        for (uint256 i = 0; i < newBookings.length; i++) {
            rentals[id].datesBooked.push(newBookings[i]);
        }

        payable(owner).transfer(msg.value);
        emit newDatesBooked(
            newBookings,
            id,
            msg.sender,
            rentals[id].city,
            rentals[id].imageUrl
        );
    }

    function getRental(uint256 id)
        public
        view
        returns (
            string memory,
            uint256,
            string[] memory
        )
    {
        require(id < counter, "No such Rental");

        rentalInfo storage s = rentals[id];
        return (s.name, s.pricePerDay, s.datesBooked);
    }
}
