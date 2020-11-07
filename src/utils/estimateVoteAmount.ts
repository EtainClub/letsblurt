import {ExtendedAccount} from 'dblurt';
import {
  getAccount,
  SteemGlobalProps,
  parseToken,
  vestsToRshares,
} from '~/providers/blurt/dblurtApi';

export const estimateVoteAmount = (
  account: ExtendedAccount,
  globalProps: SteemGlobalProps,
  voteWeight = 1,
) => {
  const {fundRecentClaims, fundRewardBalance, base, quote} = globalProps;
  // get account
  const votingPower = account.voting_power;
  const totalVests =
    parseToken(account.vesting_shares as string) +
    parseToken(account.received_vesting_shares as string) -
    parseToken(account.delegated_vesting_shares as string);
  const votePct = voteWeight * 10000;
  const rShares = vestsToRshares(totalVests, votingPower, votePct);

  return (
    ((rShares / fundRecentClaims) * fundRewardBalance * (base / quote)) /
    2
  ).toFixed(2);
};
