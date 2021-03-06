/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const BalanceTrackerLib = artifacts.require('BalanceTrackerLib');
const BlockNumbDisdIntsLib = artifacts.require('BlockNumbDisdIntsLib');
const BlockNumbFiguresLib = artifacts.require('BlockNumbFiguresLib');
const BlockNumbIntsLib = artifacts.require('BlockNumbIntsLib');
const BlockNumbReferenceCurrenciesLib = artifacts.require('BlockNumbReferenceCurrenciesLib');
const BlockNumbUintsLib = artifacts.require('BlockNumbUintsLib');
const ConstantsLib = artifacts.require('ConstantsLib');
const CurrenciesLib = artifacts.require('CurrenciesLib');
const DriipSettlementTypesLib = artifacts.require('DriipSettlementTypesLib');
const FungibleBalanceLib = artifacts.require('FungibleBalanceLib');
const MonetaryTypesLib = artifacts.require('MonetaryTypesLib');
const NahmiiTypesLib = artifacts.require('NahmiiTypesLib');
const NonFungibleBalanceLib = artifacts.require('NonFungibleBalanceLib');
const PaymentTypesLib = artifacts.require('PaymentTypesLib');
const SafeMathIntLib = artifacts.require('SafeMathIntLib');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');
const SettlementChallengeTypesLib = artifacts.require('SettlementChallengeTypesLib');
const Strings = artifacts.require('Strings');
const TradeTypesLib = artifacts.require('TradeTypesLib');
const TxHistoryLib = artifacts.require('TxHistoryLib');

const debug = require('debug')('3_libraries');
const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

require('../scripts/common/promisify_web3.js')(web3);

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let deployerAccount;

        await addressStorage.load();

        // if (helpers.isResetArgPresent())
        //     addressStorage.clear();

        if (helpers.isTestNetwork(network))
            deployerAccount = accounts[0];

        else {
            deployerAccount = helpers.parseDeployerArg();

            if (web3.eth.personal)
                await web3.eth.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 14400); // 4h
            else
                await web3.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 14400); // 4h
        }

        debug(`deployerAccount: ${deployerAccount}`);

        try {
            let ctl = {
                deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage,
                deployerAccount
            };

            if (helpers.isTestNetwork(network)) {
                await execDeploy(ctl, 'BlockNumbIntsLib', '', BlockNumbIntsLib);
                await execDeploy(ctl, 'BlockNumbUintsLib', '', BlockNumbUintsLib);
                await execDeploy(ctl, 'ConstantsLib', '', ConstantsLib);
                await execDeploy(ctl, 'DriipSettlementTypesLib', '', DriipSettlementTypesLib);
                await execDeploy(ctl, 'MonetaryTypesLib', '', MonetaryTypesLib);
                await execDeploy(ctl, 'SafeMathIntLib', '', SafeMathIntLib);
                await execDeploy(ctl, 'SafeMathUintLib', '', SafeMathUintLib);

                await deployer.link(ConstantsLib, [
                    BlockNumbDisdIntsLib
                ]);
                await deployer.link(MonetaryTypesLib, [
                    BalanceTrackerLib,
                    BlockNumbFiguresLib,
                    BlockNumbReferenceCurrenciesLib,
                    CurrenciesLib,
                    NahmiiTypesLib,
                    PaymentTypesLib,
                    SettlementChallengeTypesLib,
                    TradeTypesLib
                ]);
                await deployer.link(SafeMathIntLib, [
                    BalanceTrackerLib,
                    BlockNumbDisdIntsLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);
                await deployer.link(SafeMathUintLib, [
                    BalanceTrackerLib,
                    CurrenciesLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                await execDeploy(ctl, 'BalanceTrackerLib', '', BalanceTrackerLib);
                await execDeploy(ctl, 'BlockNumbDisdIntsLib', '', BlockNumbDisdIntsLib);
                await execDeploy(ctl, 'BlockNumbFiguresLib', '', BlockNumbFiguresLib);
                await execDeploy(ctl, 'BlockNumbReferenceCurrenciesLib', '', BlockNumbReferenceCurrenciesLib);
                await execDeploy(ctl, 'CurrenciesLib', '', CurrenciesLib);
                await execDeploy(ctl, 'NahmiiTypesLib', '', NahmiiTypesLib);
                await execDeploy(ctl, 'SettlementChallengeTypesLib', '', SettlementChallengeTypesLib);

                await deployer.link(CurrenciesLib, [
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                await execDeploy(ctl, 'FungibleBalanceLib', '', FungibleBalanceLib);
                await execDeploy(ctl, 'NonFungibleBalanceLib', '', NonFungibleBalanceLib);
                await execDeploy(ctl, 'Strings', '', Strings);
                await execDeploy(ctl, 'TxHistoryLib', '', TxHistoryLib);

                await deployer.link(NahmiiTypesLib, [
                    PaymentTypesLib,
                    TradeTypesLib
                ]);

                await execDeploy(ctl, 'PaymentTypesLib', '', PaymentTypesLib);
                await execDeploy(ctl, 'TradeTypesLib', '', TradeTypesLib);

            } else if (network.startsWith('ropsten')) {
                addressStorage.set('BalanceTrackerLib', '0x436d12a6953c55243ce8cfe87177840c2d45462e');
                addressStorage.set('BlockNumbDisdIntsLib', '0xbc763e0e12e2622b12e86830330757d10f1d60bf');
                addressStorage.set('BlockNumbFiguresLib', '0x7b052737eb15df515b9e6183d091aec1a109ed9c');
                addressStorage.set('BlockNumbIntsLib', '0xd3ee9b9e3fbc5f06585308de2807f979b7727e99');
                addressStorage.set('BlockNumbReferenceCurrenciesLib', '0x41dc44d72036e08eae0a4b9486dab608ec94af30');
                addressStorage.set('BlockNumbUintsLib', '0xf8c9e699ddc8fc44eab92a32068be3e2d19e6194');
                addressStorage.set('ConstantsLib', '0x0607d44c92f146c388190206140da19edcbbe6f3');
                addressStorage.set('CurrenciesLib', '0x37f14be1972d526691384afab98fdece03550261');
                addressStorage.set('DriipSettlementTypesLib', '0x5d64ab50a9474f86dc0280aab5384cff6b035559');
                addressStorage.set('FungibleBalanceLib', '0x8b40d7a9923bddecdb0c863d39636981e2d85805');
                addressStorage.set('MonetaryTypesLib', '0xd32e6ef7cc7f41987dd4377e70a851de538457ef');
                addressStorage.set('NahmiiTypesLib', '0xbc954f0f3d8bc560cf41d70acc936bdf60d9e392');
                addressStorage.set('NonFungibleBalanceLib', '0x5aa412ffb609254fecabd0b6484ab1756bd57d32');
                addressStorage.set('PaymentTypesLib', '0x5e8f6adeda6957abc8caa66821431bd273ba0736');
                addressStorage.set('SafeMathIntLib', '0xe8062fa6442ef48707fdc92b8b05d88eaa9a5f30');
                addressStorage.set('SafeMathUintLib', '0xd8892322bfdd5839ca262dc38ad77821d06bd272');
                addressStorage.set('SettlementChallengeTypesLib', '0xccff0888c9ab3e0acb0eeee817daa90c8ab0642b');
                addressStorage.set('Strings', '0xe8c5584022e0be86bb5d9bea06ae43a0ab8216d8');
                addressStorage.set('TradeTypesLib', '0x7990167e3565c074b5ef98149ca95b43b5198fcf');
                addressStorage.set('TxHistoryLib', '0x45ca83ad4ca90a73022d17c20da88ef8f7fa4d9c');

                ConstantsLib.address = addressStorage.get('ConstantsLib');
                MonetaryTypesLib.address = addressStorage.get('MonetaryTypesLib');
                SafeMathIntLib.address = addressStorage.get('SafeMathIntLib');
                SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');

                await deployer.link(ConstantsLib, [
                    BlockNumbDisdIntsLib
                ]);
                await deployer.link(MonetaryTypesLib, [
                    BalanceTrackerLib,
                    BlockNumbFiguresLib,
                    BlockNumbReferenceCurrenciesLib,
                    CurrenciesLib,
                    NahmiiTypesLib,
                    PaymentTypesLib,
                    SettlementChallengeTypesLib
                ]);
                await deployer.link(SafeMathIntLib, [
                    BalanceTrackerLib,
                    BlockNumbDisdIntsLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);
                await deployer.link(SafeMathUintLib, [
                    BalanceTrackerLib,
                    CurrenciesLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                CurrenciesLib.address = addressStorage.get('CurrenciesLib');

                await deployer.link(CurrenciesLib, [
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                NahmiiTypesLib.address = addressStorage.get('NahmiiTypesLib');

                await deployer.link(NahmiiTypesLib, [
                    PaymentTypesLib
                ]);

            } else if (network.startsWith('mainnet')) {
                // addressStorage.set('BlockNumbCurrenciesLib', '0x1285bdda4c9353bd0ae87af7e9433f9cfd7a4029'); // Only v1.0.0
                addressStorage.set('BlockNumbIntsLib', '0x278243860d8502fdee4fa4e7cace4a2471fd88c7');
                addressStorage.set('BlockNumbUintsLib', '0x3853145139641bc7cb723c2c476d1887157734b7');
                addressStorage.set('ConstantsLib', '0x5fcf3704016b90ded3c81d75613ceab0a6a26025');
                addressStorage.set('DriipSettlementTypesLib', '0xf20c875ff24087dd3395342901870b855eddab20');
                addressStorage.set('MonetaryTypesLib', '0x73b58f0d337b596e534a8385399f6bcce1f2ce0e');
                addressStorage.set('SafeMathIntLib', '0x2fcb98529d58669e229c453de4b4705bb6b2d414');
                addressStorage.set('SafeMathUintLib', '0x0ff948c236c8d4dfcd0168bf243314c8ff8ec967');

                const constantsLib = await ConstantsLib.at(addressStorage.get('ConstantsLib'));
                const monetaryTypesLib = await MonetaryTypesLib.at(addressStorage.get('MonetaryTypesLib'));
                const safeMathIntLib = await SafeMathIntLib.at(addressStorage.get('SafeMathIntLib'));
                const safeMathUintLib = await SafeMathUintLib.at(addressStorage.get('SafeMathUintLib'));

                await deployer.link(constantsLib.constructor, [
                    BlockNumbDisdIntsLib
                ]);
                await deployer.link(monetaryTypesLib.constructor, [
                    BalanceTrackerLib,
                    BlockNumbFiguresLib,
                    BlockNumbReferenceCurrenciesLib,
                    CurrenciesLib,
                    NahmiiTypesLib,
                    PaymentTypesLib,
                    SettlementChallengeTypesLib
                ]);
                await deployer.link(safeMathIntLib.constructor, [
                    BalanceTrackerLib,
                    BlockNumbDisdIntsLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);
                await deployer.link(safeMathUintLib.constructor, [
                    BalanceTrackerLib,
                    CurrenciesLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                addressStorage.set('BalanceTrackerLib', '0xc62e6b5c5d1cfb97c992cf065ed74eda82553028');
                addressStorage.set('BlockNumbDisdIntsLib', '0x1be1f7bcde90976e9cd18dfbfa6bb973c204122a');
                addressStorage.set('BlockNumbFiguresLib', '0x3cf037f87fa2ca78ca57337e485fc81780155376');
                addressStorage.set('BlockNumbReferenceCurrenciesLib', '0x1fcde74c0512e9e060b5f09e34045813a2b70321');
                addressStorage.set('CurrenciesLib', '0xa22d375e6e62512e0f4161604ac7a2fb2e9b456c');
                addressStorage.set('NahmiiTypesLib', '0xa858c8c47a4e4586339c9aef15f41a3f620f9da7');
                addressStorage.set('SettlementChallengeTypesLib', '0xeb3acd17194fb4e88c68bbaf094098763b59f97b');

                const currenciesLib = await CurrenciesLib.at(addressStorage.get('CurrenciesLib'));

                await deployer.link(currenciesLib.constructor, [
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                addressStorage.set('FungibleBalanceLib', '0x64dbf08fd66c408f1205e6107c60d05ab3ad872d');
                addressStorage.set('NonFungibleBalanceLib', '0x4f6f9422b8509b4df036c738f9d3e2827e29af6a');
                addressStorage.set('Strings', '0x4dd9167e4e8d622ba819972a716898e214599012');
                addressStorage.set('TxHistoryLib', '0x218bd5021efbf45f7afd853ac8ce28528f409d50');

                const nahmiiTypesLib = await NahmiiTypesLib.at(addressStorage.get('NahmiiTypesLib'));

                await deployer.link(nahmiiTypesLib.constructor, [
                    PaymentTypesLib
                ]);

                addressStorage.set('PaymentTypesLib', '0xb99f3f4aacb6e1197a623919103b99f4b41aaef0');
            }

        } finally {
            if (!helpers.isTestNetwork(network))
                if (web3.eth.personal)
                    await web3.eth.personal.lockAccount(deployerAccount);
                else
                    await web3.personal.lockAccount(deployerAccount);
        }

        debug(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract, usesAccessManager) {
    let address = ctl.addressStorage.get(instanceName || contractName);
    let instance;

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        if (usesAccessManager) {
            let signerManager = ctl.addressStorage.get('SignerManager');

            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, signerManager, {from: ctl.deployerAccount});

        } else
            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, {from: ctl.deployerAccount});

        ctl.addressStorage.set(instanceName || contractName, instance.address);
    }

    return instance;
}

function shouldDeploy(contractName, deployFilters) {
    if (!deployFilters) {
        return true;
    }
    for (let i = 0; i < deployFilters.length; i++) {
        if (deployFilters[i].test(contractName))
            return true;
    }
    return false;
}
