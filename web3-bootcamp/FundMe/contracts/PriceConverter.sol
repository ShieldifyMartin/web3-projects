// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    /** @notice Returns the latest price
     *  @param priceFeed price feed
     *  @return ethPrice price of ether
     */
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256 ethPrice)
    {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        ethPrice = uint256(answer * 1e10);
    }

    /** @notice Returns ether amount in USD
     *  @param ethAmount amount of ether
     *  @param priceFeed price feed
     *  @return ethAmountInUsd usd amount
     */
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256 ethAmountInUsd) {
        uint256 ethPrice = getPrice(priceFeed);
        ethAmountInUsd = (ethPrice * ethAmount) / 10**18;
    }
}
