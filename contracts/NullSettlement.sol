/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Configurable} from "./Configurable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {NullSettlementState} from "./NullSettlementState.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title NullSettlement
 * @notice Where null settlement are finalized
 */
contract NullSettlement is Ownable, Configurable, ClientFundable, CommunityVotable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallengeState public nullSettlementChallengeState;
    NullSettlementState public nullSettlementState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event SetNullSettlementStateEvent(NullSettlementState oldNullSettlementState,
        NullSettlementState newNullSettlementState);
    event SettleNullEvent(address wallet, address currencyCt, uint256 currencyId);
    event SettleNullByProxyEvent(address proxy, address wallet, address currencyCt,
        uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the null settlement challenge state contract
    /// @param newNullSettlementChallengeState The (address of) NullSettlementChallengeState contract instance
    function setNullSettlementChallengeState(NullSettlementChallengeState newNullSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(newNullSettlementChallengeState)
    {
        NullSettlementChallengeState oldNullSettlementChallengeState = nullSettlementChallengeState;
        nullSettlementChallengeState = newNullSettlementChallengeState;
        emit SetNullSettlementChallengeStateEvent(oldNullSettlementChallengeState, nullSettlementChallengeState);
    }

    /// @notice Set the null settlement state contract
    /// @param newNullSettlementState The (address of) NullSettlementState contract instance
    function setNullSettlementState(NullSettlementState newNullSettlementState)
    public
    onlyDeployer
    notNullAddress(newNullSettlementState)
    {
        NullSettlementState oldNullSettlementState = nullSettlementState;
        nullSettlementState = newNullSettlementState;
        emit SetNullSettlementStateEvent(oldNullSettlementState, nullSettlementState);
    }

    /// @notice Settle null
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function settleNull(address currencyCt, uint256 currencyId)
    public
    {
        // Settle null
        _settleNull(msg.sender, MonetaryTypesLib.Currency(currencyCt, currencyId));

        // Emit event
        emit SettleNullEvent(msg.sender, currencyCt, currencyId);
    }

    /// @notice Settle null by proxy
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function settleNullByProxy(address wallet, address currencyCt, uint256 currencyId)
    public
    onlyOperator
    {
        // Settle null of wallet
        _settleNull(wallet, MonetaryTypesLib.Currency(currencyCt, currencyId));

        // Emit event
        emit SettleNullByProxyEvent(msg.sender, wallet, currencyCt, currencyId);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _settleNull(address wallet, MonetaryTypesLib.Currency currency)
    private
    {
        // Require that proposal has expired
        require(nullSettlementChallengeState.hasProposalExpired(wallet, currency));

        // Require that driip settlement challenge qualified
        require(SettlementChallengeTypesLib.Status.Qualified == nullSettlementChallengeState.proposalStatus(
            wallet, currency
        ));

        // Get proposal nonce
        uint256 nonce = nullSettlementChallengeState.proposalNonce(wallet, currency);

        // Require that operational mode is normal and data is available, or that nonce is
        // smaller than max null nonce
        require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
            || (nonce < nullSettlementState.maxNullNonce()));

        // If wallet has previously settled balance of the concerned currency with higher
        // null settlement nonce, then don't settle again
        require(nonce > nullSettlementState.maxNullNonceByWalletAndCurrency(wallet, currency));

        // Update settled nonce of wallet and currency
        nullSettlementState.setMaxNullNonceByWalletAndCurrency(wallet, currency, nonce);

        // Stage the proposed amount
        clientFund.stage(
            wallet,
            nullSettlementChallengeState.proposalStageAmount(
                wallet, currency
            ),
            currency.ct, currency.id, ""
        );

        // If payment nonce is beyond max null settlement nonce then update max null nonce
        if (nonce > nullSettlementState.maxNullNonce())
            nullSettlementState.setMaxNullNonce(nonce);
    }
}