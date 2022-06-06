// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

contract PokemonContract {
    enum Pokemon {
        Mewtwo,
        Pikachu,
        Suicune,
        Charizard,
        Rayquaza,
        Gengar,
        Blaziken,
        Mimikyu,
        Greninja,
        Garchomp
    }

    event LogPokemonCaught(address indexed by, Pokemon indexed pokemon);

    struct Player {
        Pokemon[] pokemons;
        uint256 lastCatch;
    }

    mapping(address => Player) players;

    mapping(uint256 => address[]) pokemonHolders;

    mapping(bytes32 => bool) hasPokemonMap;

    modifier canPersonCatch(address person, Pokemon pokemon) {
        require(block.timestamp > players[person].lastCatch + 15 seconds);
        require(!hasPokemon(person, pokemon));
        _;
    }

    function hasPokemon(address person, Pokemon pokemon)
        internal
        view
        returns (bool)
    {
        return hasPokemonMap[keccak256(abi.encodePacked(person, pokemon))];
    }

    function catchPokemon(Pokemon pokemon)
        public
        canPersonCatch(msg.sender, pokemon)
    {
        players[msg.sender].pokemons.push(pokemon);
        players[msg.sender].lastCatch = block.timestamp;
        pokemonHolders[uint256(pokemon)].push(msg.sender);
        hasPokemonMap[keccak256(abi.encodePacked(msg.sender, pokemon))] = true;
        emit LogPokemonCaught(msg.sender, pokemon);
    }

    function getPokemonByPerson(address person)
        public
        view
        returns (Pokemon[] memory)
    {
        return players[person].pokemons;
    }

    function getPokemonHolders(Pokemon pokemon)
        public
        view
        returns (address[] memory)
    {
        return pokemonHolders[uint256(pokemon)];
    }
}
