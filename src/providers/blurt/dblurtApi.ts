import Config from 'react-native-config';
// crypto-js
import CryptoJS from 'crypto-js';
import {get, has} from 'lodash';
// dblurt api
import {
  Client,
  cryptoUtils,
  PrivateKey,
  ExtendedAccount,
  DisqussionQuery,
  DiscussionQueryCategory,
  Discussion,
  Operation,
} from 'dblurt';

import {ProfileData} from '~/contexts/types';

import {
  PostingContent,
  PostRef,
  PostData,
  PostState,
  WalletData,
} from '~/contexts/types';

import {NUM_FETCH_POSTS, TRUNCATE_BODY_LENGTH} from '~/constants/blockchain';

// TODO: check if the voting in release mode is working on steem blockchain
// blurt
const MAINNET_OFFICIAL = [
  'https://api.blurt.blog',
  'https://rpc.blurt.world',
  'https://blurtd.privex.io',
  'https://rpc.blurt.buzz',
];
const client = new Client('MAINNET_OFFICIAL', {
  timeout: 5000,
  addressPrefix: 'BLT',
  chainId: 'cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f',
});

console.log('Blurt Client', client);

// patch
const diff_match_patch = require('diff-match-patch');
const dmp = new diff_match_patch();

import {
  parsePosts,
  parsePost,
  filterNSFWPosts,
  parseComment,
} from '~/utils/postParser';
import {estimateVoteAmount} from '~/utils/estimateVoteAmount';

global.Buffer = global.Buffer || require('buffer').Buffer;

/////
// get public wif from private wif
const wifToPublic = (privWif: string) => {
  // get private key from wif format
  const privateKey = PrivateKey.fromString(privWif);

  // get public key of the private key and then convert it into wif format
  const pubWif = privateKey.createPublic('BLT').toString();
  // blurt
  //  const blurtPubWif = pubWif.replace(/^STM/, 'BLT');
  // return the public wif
  return pubWif;
};

const wifIsValid = (privWif: string, pubWif: string) => {
  return wifToPublic(privWif) == pubWif;
};

////// user signup/signin
//// signup
// check availabled claimed token
// @return availabivity of the token
export const checkClaimedToken = async (creator: string) => {
  try {
    const accounts = await client.database.call('get_accounts', [[creator]]);
    const numTokens = accounts[0].pending_claimed_accounts;
    console.log('number of claimed tokens', numTokens);
    if (numTokens > 0) return true;
    else return false;
  } catch (error) {
    console.log('claimed token error', error);
    return false;
  }
};

// claim account creation token to create a new account
// @return success of failure of the claim
export const claimAccountCreationToken = async (
  creator: string,
  activeKey: string,
) => {
  try {
    const creatorKey = PrivateKey.fromString(activeKey);
    let ops = [];
    const claim_op = [
      'claim_account',
      {
        creator: creator,
        fee: '0.000 STEEM',
        extensions: [],
      },
    ];
    ops.push(claim_op);
    const result = await client.broadcast.sendOperations(ops, creatorKey);
    console.log('claim ACT result', result);
    if (result.block_num > 0) return true;
    else return false;
  } catch (error) {
    console.log('error. claim failed', error);
    return false;
  }
};

// create an account
export const createAccount = async (
  username: string,
  creator: string,
  creatorActiveKey: string,
) => {
  //// check sanity: claimed account creation tokens
  if (!checkClaimedToken(creator)) {
    console.log('failed to create account due to no clamied token');
    return null;
  }
  // generate random master password
  const array = CryptoJS.lib.WordArray.random(10);
  const password = 'P' + PrivateKey.fromSeed(array.toString()).toString();
  console.log('master password', password.toString());

  // @test without actual account creation
  //return { result: "test", password: password };

  // private active key of creator account
  const creatorKey = PrivateKey.fromString(creatorActiveKey);
  // create keys
  const ownerKey = PrivateKey.fromLogin(username, password, 'owner');
  const activeKey = PrivateKey.fromLogin(username, password, 'active');
  const postingKey = PrivateKey.fromLogin(username, password, 'posting');
  const memoKey = PrivateKey.fromLogin(username, password, 'memo').createPublic(
    client.addressPrefix,
  );

  const ownerAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[ownerKey.createPublic(client.addressPrefix), 1]],
  };
  const activeAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[activeKey.createPublic(client.addressPrefix), 1]],
  };
  const postingAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[postingKey.createPublic(client.addressPrefix), 1]],
  };

  //// send creation operation
  // operations
  let operations: Operation[] = [];
  //create operation to transmit
  const create_op: Operation = [
    'create_claimed_account',
    {
      creator: creator,
      new_account_name: username,
      owner: ownerAuth,
      active: activeAuth,
      posting: postingAuth,
      memo_key: memoKey,
      json_metadata: '',
      extensions: [],
    },
  ];
  console.log(create_op);
  // push the creation operation
  operations.push(create_op);
  // broadcast operation to blockchain
  try {
    const result = await client.broadcast.sendOperations(
      operations,
      creatorKey,
    );
    if (result) {
      console.log('creation result', result);
      return password;
    } else {
      return null;
    }
  } catch (error) {
    console.log('account creation failed', error);
    return null;
  }
};

// verify the password (master password, private keys in wif format)
export const verifyPassoword = async (username: string, password: string) => {
  // @test master password for playdreams
  // posting key in wif: etainclub
  //  password = Config.ETAINCLUB_POSTING_WIF;

  // get accounts by username
  let account = null;
  try {
    account = await getAccount(username);
  } catch (error) {
    console.log('failed to get account', error);
  }
  console.log('account', account);
  // get public posting key
  const postingPublicKey = account.posting.key_auths[0][0];

  //// handle master password
  if (password[0] === 'P') {
    // compute private posting key using username and password, and then get wif
    const postingPrivateKey = PrivateKey.fromLogin(
      username,
      password,
      'posting',
    ).toString();
    // check validity
    const valid = wifIsValid(postingPrivateKey, postingPublicKey);
    if (valid) {
      console.log('master password is valid');
      return true;
    } else {
      console.log('master password is not valid');
      return false;
    }
  } else {
    ////// handle posting/active/owner private key
    //// check posting key
    // check validity if the input password is the private posting key
    let valid = wifIsValid(password, postingPublicKey);
    if (valid) {
      console.log('input is the posting private key, which is valid');
      return true;
    }
    //// check active key
    // get publich active key
    const activePublicKey = account.active.key_auths[0][0];
    // check validity if the input password is the private active key
    valid = wifIsValid(password, activePublicKey);
    if (valid) {
      console.log('input is the active private key, which is valid');
      return true;
    }
    //// check owner key
    // get public owner key
    const ownerPublicKey = account.owner.key_auths[0][0];
    // check validity
    valid = wifIsValid(password, ownerPublicKey);
    if (valid) {
      console.log('input is the owner private key, which is valid');
      return true;
    }
    // input password is not valid
    console.log('input password is not valid');
    return false;
  }
};

// check sanity of a username to be created
// @return availability of the username
export const checkUsernameAvailable = async (username: string) => {
  try {
    const accounts = await getAccount(username);
    console.log('account:', accounts);
    if (!accounts) {
      // the username is available
      console.log('username is avaliable', username);
      return true;
    } else {
      // the username exists
      return false;
    }
  } catch (error) {
    console.log('error on check username', error);
    return false;
  }
};

//// global properties
export const getDynamicGlobalProperties = () =>
  client.database.getDynamicGlobalProperties();
export const getRewardFund = () =>
  client.database.call('get_reward_fund', ['post']);
export const getFeedHistory = async (): Promise<any> => {
  try {
    const feedHistory = await client.database.call('get_feed_history');
    return feedHistory;
  } catch (error) {
    return error;
  }
};

// helper function
export const parseToken = (strVal: string): number => {
  if (!strVal) {
    return 0;
  }
  return Number(parseFloat(strVal.split(' ')[0]));
};
export const vestToSteem = async (
  vestingShares: string,
  totalVestingShares: string,
  totalVestingFundSteem: string,
) =>
  (
    parseFloat(totalVestingFundSteem) *
    (parseFloat(vestingShares) / parseFloat(totalVestingShares))
  ).toFixed(0);

export const vestsToRshares = (
  vests: number,
  votingPower: number,
  votePerc: number,
) => {
  if (!vests || !votingPower || !votePerc) {
    return 0;
  }
  const vestStr = (vests * 1e6).toString();
  const vestingShares = parseInt(vestStr, 10);
  const power = (votingPower * votePerc) / 1e4 / 50 + 1;

  return (power * vestingShares) / 1e4;
};

export interface BlockchainGlobalProps {
  steemPerMVests: number;
  base: number;
  quote: number;
  fundRecentClaims: number;
  fundRewardBalance: number;
  sbdPrintRate: number;
  dynamicProps: {};
}

//// global props
let globalProps: BlockchainGlobalProps = null;

// fetch global propperties
export const fetchGlobalProps = async (): Promise<BlockchainGlobalProps> => {
  let globalDynamic;
  let feedHistory;
  let rewardFund;

  try {
    globalDynamic = await getDynamicGlobalProperties();
    //    feedHistory = await getFeedHistory();
    rewardFund = await getRewardFund();
  } catch (error) {
    console.log('failed to fetch steem global properties', error);
    return null;
  }

  console.log('[fetchGlobalProps] globalDynamic', globalDynamic);
  //  console.log('[fetchGlobalProps] feedHistory', feedHistory);
  console.log('[fetchGlobalProps] rewardFund', rewardFund);

  const steemPerMVests =
    (parseToken(globalDynamic.total_vesting_fund_steem as string) /
      parseToken(globalDynamic.total_vesting_shares as string)) *
    1e6;
  const sbdPrintRate = globalDynamic.sbd_print_rate;
  //  const base = parseToken(feedHistory.current_median_history.base);
  //  const quote = parseToken(feedHistory.current_median_history.quote);
  const fundRecentClaims = rewardFund.recent_claims;
  const fundRewardBalance = parseToken(rewardFund.reward_balance);

  // update the globalProps
  globalProps = {
    steemPerMVests,
    base: 1,
    quote: 1,
    fundRecentClaims,
    fundRewardBalance,
    sbdPrintRate,
    dynamicProps: globalDynamic,
  };

  return globalProps;
};

////// user related
//// account
// get account
export const getAccount = async (
  username: string,
): Promise<ExtendedAccount | null> => {
  try {
    const accounts = await client.database.getAccounts([username]);
    console.log('[getAccount] username, account', username, accounts);
    // check exists
    if (accounts.length == 0) {
      return null;
    }
    return accounts[0];
  } catch (error) {
    console.log('failed to get account', error);
    return null;
  }
};

export const getVoteAmount = async (
  username: string,
  globalProps: BlockchainGlobalProps,
): Promise<string> => {
  try {
    console.log('[fetchUserData] fetching...');
    // fetch account
    //   const account = await client.database.getAccounts([username]);
    const account = await client.database.call('get_accounts', [[username]]);

    console.log('[getVoteAmount] account', account[0]);
    if (!account[0]) return;

    // get global properties
    if (!globalProps) globalProps = await fetchGlobalProps();

    // estimate vote amount
    const voteAmount = estimateVoteAmount(account[0], globalProps);
    return voteAmount;
  } catch (error) {
    console.log('failed to get vote amount', error);
    return null;
  }
};

//// fetch user state
export const fetchUserProfile = async (username: string) => {
  try {
    // get state
    const params = `@${username}`;
    const accountState = await client.call('condenser_api', `get_state`, [
      params,
    ]);
    console.log('[fetchUserProfile] accountState', accountState);
    if (!accountState) {
      console.log('[fetchUserProfile] accountState is null', accountState);
      return;
    }
    // get account
    const account = get(accountState.accounts, username, '');
    // destructure
    const {
      balance,
      voting_power,
      vesting_shares,
      received_vesting_shares,
      delegated_vesting_shares,
    } = account;
    const power =
      parseInt(vesting_shares.split(' ')[0]) +
      parseInt(received_vesting_shares.split(' ')[0]) -
      parseInt(delegated_vesting_shares.split(' ')[0]);

    // parse meta data
    if (
      has(account, 'posting_json_metadata') ||
      has(account, 'json_metadata')
    ) {
      try {
        account.about =
          JSON.parse(get(account, 'json_metadata')) ||
          JSON.parse(get(account, 'posting_json_metadata'));
        console.log('[fetchUserProfile]', account.about);
      } catch (error) {
        console.log('failed to fetch profile metadata', error);
        account.about = {};
      }
    }
    account.avatar = getAvatar(get(account, 'about'));
    account.nickname = getName(get(account, 'about'));

    // get followers/following count
    const followCount = await getFollows(username);
    console.log('[fetchUserProfile] follow count', followCount);

    // build profile data
    const profileData: ProfileData = {
      profile: {
        metadata: account.about.profile
          ? account.about.profile
          : {name: '', cover_image: '', profile_image: ''},
        name: username,
        voteAmount: estimateVoteAmount(account, globalProps),
        votePower: String(voting_power),
        balance: balance.split(' ')[0],
        power: String(power),
        stats: {
          post_count: account.post_count,
          following: followCount.following_count,
          followers: followCount.follower_count,
        },
      },
      blogRefs: account.blog,
      blogs: accountState.content,
    };
    return profileData;
  } catch (error) {
    console.log('Failed to fetch user profile data', error);
    return null;
  }
};

// get state using url
export const getState = async (url: string): Promise<any> => {
  try {
    const state = await client.database.getState(url);
    return state;
  } catch (error) {
    return error;
  }
};

//// following
// get followers/following counts
export const getFollows = (username: string) =>
  client.call('condenser_api', 'get_follow_count', [username]);

export const getFollowing = (
  follower: string,
  startFollowing: string,
  followType = 'blog',
  limit = 100,
) =>
  client.database.call('get_following', [
    follower,
    startFollowing,
    followType,
    limit,
  ]);

export const getFollowers = (
  follower: string,
  startFollowing: string,
  followType = 'blog',
  limit = 100,
) =>
  client.database.call('get_followers', [
    follower,
    startFollowing,
    followType,
    limit,
  ]);

export const isFollowing = (username: string, author: string) =>
  new Promise((resolve, reject) => {
    if (author) {
      client.database
        .call('get_following', [author, username, 'blog', 1])
        .then((result) => {
          if (
            result[0] &&
            result[0].follower === author &&
            result[0].following === username
          ) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      resolve(false);
    }
  });

///// communities
// fetch community list of a user
export const fetchCommunityList = async (username: string): Promise<any[]> => {
  try {
    const communities = await client.call('bridge', 'list_all_subscriptions', {
      account: username,
    });
    console.log('[fetchCommunityList] community list', communities);
    if (communities) {
      return communities;
    } else {
      return null;
    }
  } catch (error) {
    console.log('failed to fetch community list', error);
    return null;
  }
};

// fetch a community
export const fetchCommunity = async (tag: string, observer: string = '') =>
  new Promise(async (resolve, reject) => {
    try {
      const community = await client.call('bridge', 'get_community', {
        name: tag,
        observer: observer,
      });
      if (community) {
        resolve(community);
      } else {
        resolve({});
      }
    } catch (error) {
      reject(error);
    }
  });

///// posts
////
// fetch post summary
export const fetchPostsSummary = async (
  category: string,
  tag: string,
  startPostRef: PostRef,
  username: string = '',
  limit: number = NUM_FETCH_POSTS + 1,
  filterNsfw: boolean = true,
): Promise<PostData[]> => {
  // build query
  const query: DisqussionQuery = {
    tag: tag,
    limit: NUM_FETCH_POSTS + 1,
    start_permlink: startPostRef.permlink || undefined,
    start_author: startPostRef.author || undefined,
    truncate_body: TRUNCATE_BODY_LENGTH,
  };

  try {
    console.log('[fetchPostsSummary] category, query', category, query);
    const posts = await client.call(
      'condenser_api',
      `get_discussions_by_${category}`,
      [query],
    );

    console.log('[fetchPostsSummary] posts', posts);
    let postDataList: PostData[];
    if (posts.length > 0) {
      postDataList = await parsePosts(posts, username);

      // TODO: implement later
      // if (filterNsfw) {
      //   const updatedPosts = filterNSFWPosts(extPosts);
      //   return updatedPosts;
      // }
      return postDataList;
    } else {
      return null;
    }
  } catch (error) {
    console.log('failed to get posts summaries', error);
    return null;
  }
};

//// fetch post details
export const fetchPostDetails = async (
  author: string,
  permlink: string,
  username: string = null,
  isPromoted = false,
): Promise<PostData> => {
  try {
    const post = await client.database.call('get_content', [author, permlink]);
    const postData = await parsePost(post, username, isPromoted);
    return postData;
  } catch (error) {
    console.log('failed to fetch post details', error);
    return null;
  }
};

/// fetch a post
export const fetchPost = async (
  author: string,
  permlink: string,
  currentUserName?: string,
  isPromoted?: boolean,
) => {
  try {
    const post = await client.database.call('get_content', [author, permlink]);
    console.log('[fetchPost] post', post);

    return post ? await parsePost(post, currentUserName, isPromoted) : null;
  } catch (error) {
    return error;
  }
};

// fetch raw post
export const fetchRawPost = async (
  author: string,
  permlink: string,
): Promise<Discussion> => {
  try {
    return await client.database.call('get_content', [author, permlink]);
  } catch (error) {
    console.log('failed to get raw post');
    return error;
  }
};

// fetch comments
// TODO: use Promise All to fetch comment
export const fetchComments = async (
  author: string,
  permlink: string,
  username: string = null,
) => {
  let results;
  try {
    // get all comments of depth 1
    results = await client.database.call('get_content_replies', [
      author,
      permlink,
    ]);
  } catch (error) {
    console.log('failed to fetch comments', error);
  }

  // return if no comments
  if (!results) return null;

  // setup comments of parent
  const comments = [];
  // loop over children
  for (let i = 0; i < results.length; i++) {
    // parse comment
    const extComment = await parseComment(results[i], username);
    comments.push(extComment);

    // recursive call if a child exists
    if (results[i].children > 0) {
      const children = await fetchComments(
        results[i].author,
        results[i].permlink,
      );
      comments[i] = {...comments[i], comments: children};
    }
  }
  return comments;
};
//
// broadcast post
export const broadcastPost = async (
  postingData: PostingContent,
  password: string,
) => {
  // @test: etainclub
  //  password = Config.ETAINCLUB_POSTING_WIF;

  // verify the key
  const verified = await verifyPassoword(postingData.author, password);
  if (!verified) {
    return {success: false, message: 'the password is invalid'};
  }

  const privateKey = PrivateKey.from(password);

  try {
    await client.broadcast.comment(postingData, privateKey).then((result) => {
      console.log('result of post submission', result);
      return {success: true, message: 'submitted'};
    });
  } catch (error) {
    console.log('failed to submit a post', error);
    return {success: false, message: error.message};
  }
  return {success: true, message: 'submitted'};
};

export const broadcastPostUpdate = async (
  originalBody: string,
  originalPermlink: string,
  originalParentPermlink: string,
  postingContent: PostingContent,
  password: string,
) => {
  // @todo sometime no post exists why?
  console.log('[broadcastPostUpdate] org post', originalBody);
  console.log('[broadcastPostUpdate] new post', postingContent.body);

  // check validity of the password
  // verify the key
  // @todo check sanity of argument: exits? (it happend the empty post)
  const verified = await verifyPassoword(postingContent.author, password);
  if (!verified) {
    return {success: false, message: 'the password is invalid'};
  }

  //// create a patch
  const text = originalBody;
  // handle no text or null
  if (!text && text === '') {
    return {success: false, message: 'Nothing in the body'};
  }
  // get list of patches to turn text to newPost
  const patch_make = dmp.patch_make(text, postingContent.body);
  console.log('[broadcastPostUpdate] patch_make', patch_make);
  // turns the patch to text
  const patch = dmp.patch_toText(patch_make);

  console.log('[broadcastPostUpdate] patch', patch);

  // check if patch size is smaller than original post
  let body = patch;

  // set patch if exists
  if (patch) {
    body = patch;
  } else {
    console.log('no patch exists. keep the original body.');
    body = text;
  }

  console.log('org body length, patch body length', text.length, patch.length);
  console.log('[broadcastPostUpdate] patched body', body);

  //// build patched post
  // const patchPost: PostingContent = {
  //   parent_author: postingContent.parent_author,
  //   parent_permlink: originalParentPermlink,
  //   author: postingContent.author,
  //   permlink: originalPermlink,
  //   body: body,
  //   json_metadata: postingContent.json_metadata,
  //   title: postingContent.title,
  // };

  const patchPost: PostingContent = {
    parent_author: postingContent.parent_author,
    parent_permlink: originalParentPermlink,
    author: postingContent.author,
    permlink: originalPermlink,
    body: postingContent.body,
    json_metadata: postingContent.json_metadata,
    title: postingContent.title,
  };

  console.log('[broadcastPostUpdate] patchPost', patchPost);
  // submit
  const result = await broadcastPost(patchPost, password);
  return result;
};

//// sign image to upload
export const signImage = async (photo, username, password) => {
  // verify the user and password
  // @test
  //  password = Config.ETAINCLUB_POSTING_WIF;
  const verified = await verifyPassoword(username, password);
  if (!verified) {
    console.log('[signImage] failed to verify password');
    return null;
  }

  // create a buffer of image data
  const photoBuf = Buffer.from(photo.data, 'base64');
  // prefix buffer to upload an image to steemitimages.com
  const prefix = Buffer.from('ImageSigningChallenge');
  // build data to be signed
  const data = Buffer.concat([prefix, photoBuf]);

  //  console.log('[signImage] buf', buf);
  // get ec private key from wif pasword
  const privateKey = PrivateKey.fromString(password);
  // compute hash of the data
  const hash = cryptoUtils.sha256(data);
  //  console.log('[signImage] hash, type', hash, typeof hash);
  // sign the hash
  const signature = privateKey.sign(hash);

  //  console.log('[signImage] signature', signature, typeof signature);

  // verify the signature
  if (!privateKey.createPublic().verify(hash, signature)) {
    console.error('signaure is invalid');
  }
  //  console.log('sig is valid, sig', signature);

  return signature;
};

//// votes
// get active votes of the post
export const getActiveVotes = (
  author: string,
  permlink: string,
): Promise<any> =>
  new Promise((resolve, reject) => {
    client.database
      .call('get_active_votes', [author, permlink])
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });

const sendOperations = async (
  operations: Operation[],
  key: PrivateKey | PrivateKey[],
) => {
  console.log('[sendOperations]');

  const props = await getDynamicGlobalProperties();

  console.log('[sendOperations] global props', props);

  const ref_block_num = props.head_block_number & 0xffff;
  const ref_block_prefix = Buffer.from(props.head_block_id, 'hex').readUInt32LE(
    4,
  );
  const expireTime = 60 * 1000;
  const expiration = new Date(new Date(props.time + 'Z').getTime() + expireTime)
    .toISOString()
    .slice(0, -5);
  const extensions = [];

  const tx = {
    expiration,
    extensions,
    operations,
    ref_block_num,
    ref_block_prefix,
  };

  console.log('[sendOperations] tx', tx);
  const tx2 = cryptoUtils.signTransaction(tx, key, client.chainId);
  console.log('[sendOperations] tx2', tx);

  const result = await client.call(
    'condenser_api',
    'broadcast_transaction_synchronous',
    [tx2],
  );

  console.log('[sendOperations] result', result);

  return result;
};

// submit a vote
export const submitVote = async (
  voter: string,
  password: string,
  author: string,
  permlink: string,
  votingWeight: number,
) => {
  // build vote object
  const vote = {
    voter,
    author,
    permlink,
    weight: votingWeight * 100,
  };

  // @test: etainclub
  //  password = Config.ETAINCLUB_POSTING_WIF;

  console.log('[submitVote] vote', vote);

  // verify the key
  const verified = await verifyPassoword(voter, password);
  if (!verified) {
    return {success: false, message: 'the password is invalid'};
  }

  // get privake key from password
  const privateKey = PrivateKey.from(password);

  if (privateKey) {
    return new Promise((resolve, reject) => {
      // const op = ['vote', vote];
      // sendOperations([op], privateKey)
      //   .then((result) => {
      //     console.log('voting result', result);
      //     resolve(result);
      //   })
      //   .catch((error) => {
      //     console.log('failed to submit a vote', error);
      //     reject(error);
      //   });

      client.broadcast
        .vote(vote, privateKey)
        .then((result) => {
          console.log('voting result', result);
          resolve(result);
        })
        .catch((error) => {
          console.log('failed to submit a vote', error);
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key. Required private posting key or above'),
  );
};

export const calculateReputation = (reputation: number) => {
  const multi = reputation < 0 ? -9 : 9;
  let rep = Math.log10(Math.abs(reputation));
  rep = Math.max(rep - 9, 0);
  rep *= multi;
  rep += 25;
  return rep;
};

export const getName = (about) => {
  if (about.profile && about.profile.name) {
    return about.profile.name;
  }
  return null;
};

export const getAvatar = (about) => {
  if (about.profile && about.profile.profile_image) {
    return about.profile.profile_image;
  }
  return null;
};

/////// wallet
//// fetch wallet data
export const fetchWalletData = async (username: string) => {
  try {
    const params = `@${username}/transfers`;
    const accountState = await client.call('condenser_api', `get_state`, [
      params,
    ]);
    console.log('[fetchWalletData] accountState', accountState);
    // build wallet data
    if (accountState) {
      const account = get(accountState.accounts, username, '');
      console.log('[fetchWalletData] account', account);
      const {
        balance,
        savings_balance,
        voting_power,
        vesting_shares,
        received_vesting_shares,
        delegated_vesting_shares,
        reward_blurt_balance,
        reward_vesting_balance,
        reward_vesting_blurt,
        transfer_history,
      } = account;
      const power =
        parseInt(vesting_shares.split(' ')[0]) +
        parseInt(received_vesting_shares.split(' ')[0]) -
        parseInt(delegated_vesting_shares.split(' ')[0]);
      const rewards = reward_vesting_balance;
      const walletData: WalletData = {
        blurt: balance.split(' ')[0],
        power: String(power),
        savings: savings_balance.split(' ')[0],
        rewards: rewards.split(' ')[0],
        voteAmount: '0',
        votePower: String(voting_power),
        transactions: transfer_history
          ? transfer_history.slice(Math.max(transfer_history.length - 50, 0))
          : [],
      };
      return walletData;
    }
  } catch (error) {
    console.log('failed to fetch wallet data', error);
  }
};

export const fetchNotifications = async (username: string) => {
  debugger;
  try {
    const data = {
      id: 0,
      jsonrpc: '2.0',
      method: 'get_notifications',
      params: [username],
    };
    fetch('wss://notifications.blurt.world', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('[fetchNotifications] username, account', res.result);
        debugger;
      });
  } catch (error) {
    console.log('failed to fetch notifications', error);
  }

  // try {
  //   const params = `@${username}/notifications`;
  //   const accountState = await client.call('condenser_api', `get_state`, [
  //     params,
  //   ]);
  //   console.log('[fetchNotifications] accountState', accountState);

  //   // const params = username;
  //   // const notifications = await client.call('get_notifications', [params]);
  //   // console.log('[fetchNotifications] notifications', notifications);
  // } catch (error) {
  //   console.log('Failed to fetch notifications', error);
  // }
};

/*

// fetch user profile
export const fetchProfile = async (author: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const profile = await client.call('bridge', 'get_profile', {
        account: author,
      });
      console.log('[dSteem|fetchProfile] profile', profile);
      if (profile) {
        resolve(profile);
      } else {
        // TODO: handle null when fetching get_profile
        //        const _profile = await fetchUserProfile(author);
        //        console.log('[dSteem|fetchProfile] using standard. profile', _profile);
        resolve(null);
      }
    } catch (error) {
      console.log('failed to fetch profile', error);
      reject(error);
    }
  });

  
export const getAccount0 = async (username: string) => {
  try {
    const data = {
      id: 1,
      jsonrpc: '2.0',
      method: 'call',
      params: ['database_api', 'get_accounts', [[username]]],
    };
    let accounts = [];
    await fetch(MAINNET_OFFICIAL, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        accounts = res.result;
        console.log('[getAccount] username, account', username, accounts);
      });
    // check exists
    if (accounts.length == 0) {
      return null;
    }
    return accounts;
  } catch (error) {
    console.log('failed to get account', error);
    return null;
  }
};

// fetch comments
export const fetchComments = async (author: string, permlink: string) => {
  let results;
  try {
    // get all comments of depth 1
    results = await client.database.call('get_content_replies', [
      author,
      permlink,
    ]);
  } catch (error) {
    console.log('failed to fetch comments', error);
  }

  // return if no comments
  if (!results) return null;

  console.log('[fetchComments] results', results);
  // map over children
  const pArray1 = results.map(async (comment: Discussion, id) => {
    //
    const comments = [];
    // push the first children
    const extComment = await parseComment(comment);
    comments.push(extComment);
    // recursive call if a child exists
    if (comment.children > 0) {
      const children = await fetchComments(comment.author, comment.permlink);
    }
    return comments;
  });
  const _comments = Promise.all(pArray1);

  return _comments;
};
*/

/*
   case PostsActionTypes.VOTING_COMMENT:
      console.log('[postReducer] upvoting action payload', action.payload);
      // @todo find the comments in the comment tree
      // bfs
      // push the child comments of the post to a queue
      const q = [];
      state[postIndex].comments.forEach(comment => {
        q.push(comment);
      });
      let found = false;
      return state;
      /*
            while(!found) {
        //   pop a comment
        const comment = q.shift();
        //   try matching, 
        if (comment.author === postRef.author && comment.permlink === postRef.permlink) {
          // if success, update the payout, active_votes, votes_count
          payout = parseFloat(state[postIndex].postUserState.payout);
          newPayout = payout + voteAmount;
          newVotesCount = state[postIndex].postUserState.votes_count + 1;
          voters = state[postIndex].postUserState.active_votes;
          // @todo find the comment if the post is comment
          newVoters = [`${username} ($${voteAmount})`, ...voters];
          newPosts = [...state];
          newPosts[postIndex].postUserState.voted = true;
          newPosts[postIndex].postUserState.payout = newPayout.toFixed(2);
          newPosts[postIndex].postUserState.votes_count = newVotesCount;
          newPosts[postIndex].postUserState.active_votes = newVoters;
          return newPosts;    
        } else {
          // if failed, push the child of the comment to the queue
        }
      }
*/

/*
// fetch post summary
export const fetchPostsSummary = async (
  query: PostsQuery,
): Promise<ExtendedPost[]> => {
  try {
    console.log('[fetchPostsSummary] query', query);
    const _qeury = {
      tag: query.tag,
      start_author: query.start_author,
      start_permlink: query.start_permlink,
      limit: query.limit,
    };
    //    const posts = await client.database.getDiscussions(query.sort, query);
    const posts = await client.call('bridge', 'get_ranked_posts', {
      sort: query.sort,
      tag: query.tag,
      observer: query.observer,
      start_author: query.start_author,
      start_permlink: query.start_permlink,
      limit: 1,
    });
    console.log('[fetchPostsSummary] posts', posts);
    let extPosts: ExtendedPost[];
    if (posts) {
      extPosts = await parsePosts(posts, query.observer);

      // @todo implement later
      // if (filterNsfw) {
      //   const updatedPosts = filterNSFWPosts(extPosts);
      //   return updatedPosts;
      // }
    }
    return extPosts;
  } catch (error) {
    console.log('failed to get posts summaries', error);
    return null;
  }
};
*/

/*
export const fetchUserProfile = async (username: string) => {
  try {
    console.log('[fetchUserData] fetching...');
    // fetch account
    const accounts = await client.database.getAccounts([username]);
    const account = accounts[0];
    console.log('[fetchUserData] fetched. account0', account);
    // check sanity
    if (!account[0]) {
      return null;
    }

    // compute reputation
    const reputation = calculateReputation(
      parseInt(account[0].reputation as string),
    );
    // get followers count
    const followCount = await getFollows(username);
    console.log('[fetchUserData] follow count', followCount);
    // get global properties
    const globalProps = await fetchGlobalProps();
    // estimate vote amount
    const voteAmount = estimateVoteAmount(account, globalProps);
    // steem power
    const steem_power = await vestToSteem(
      account.vesting_shares as string,
      globalProps.dynamicProps.total_vesting_shares,
      globalProps.dynamicProps.total_vesting_fund_steem,
    );
    // received steem power
    const received_steem_power = await vestToSteem(
      get(account, 'received_vesting_shares' as string),
      get(globalProps.dynamicProps, 'total_vesting_shares'),
      get(
        globalProps.dynamicProps,
        'total_vesting_fund_steem',
        globalProps.dynamicProps.total_vesting_fund_steem,
      ),
    );
    // delegated steem power
    const delegated_steem_power = await vestToSteem(
      get(account, 'delegated_vesting_shares' as string),
      get(globalProps.dynamicProps, 'total_vesting_shares'),
      get(
        globalProps.dynamicProps,
        'total_vesting_fund_steem',
        globalProps.dynamicProps.total_vesting_fund_steem,
      ),
    );

    // parse meta data
    if (
      has(account, 'posting_json_metadata') ||
      has(account, 'json_metadata')
    ) {
      try {
        account.about =
          JSON.parse(get(account, 'json_metadata')) ||
          JSON.parse(get(account, 'posting_json_metadata'));
        console.log('[dSteem|fetchUserData]', account.about);
      } catch (error) {
        console.log('failed to fetch profile', error);
        account.about = {};
      }
    }
    account.avatar = getAvatar(get(account, 'about'));
    account.nickname = getName(get(account, 'about'));

    // build user data
    const _account: ProfileData = {
      profile: {
        post_count: account[0].post_count,
        metadata: {
          profile: account.about,
        },
        name: username,
        reputation: reputation,
        stats: {
          sp: parseFloat(steem_power),
          following: followCount.following_count,
          followers: followCount.followers_count,
        },
      },
      voteAmount,
    };

    return _account;
  } catch (error) {
    console.log('failed to fetch user data');
    return Promise.reject(error);
  }
};
*/

/*
// fetch user data
export const fetchUserData = async (username: string) => {
  try {
    console.log('[fetchUserData] fetching...');
    // fetch account
    const account = await client.database.getAccounts([username]);
    console.log('[fetchUserData] fetched. account0', account);

    // compute reputation
    const reputation = calculateReputation(
      parseInt(account[0].reputation as string),
    );
    // get followers count
    const followCount = await getFollows(username);
    console.log('[fetchUserData] follow count', followCount);
    // get global properties
    const globalProps = await fetchGlobalProps();
    // estimate vote amount
    const voteAmount = estimateVoteAmount(account[0], globalProps);
    // steem power
    const steem_power = await vestToSteem(
      account[0].vesting_shares as string,
      globalProps.dynamicProps.total_vesting_shares,
      globalProps.dynamicProps.total_vesting_fund_steem,
    );
    // received steem power
    const received_steem_power = await vestToSteem(
      get(account[0], 'received_vesting_shares' as string),
      get(globalProps.dynamicProps, 'total_vesting_shares'),
      get(
        globalProps.dynamicProps,
        'total_vesting_fund_steem',
        globalProps.dynamicProps.total_vesting_fund_steem,
      ),
    );
    // delegated steem power
    const delegated_steem_power = await vestToSteem(
      get(account[0], 'delegated_vesting_shares' as string),
      get(globalProps.dynamicProps, 'total_vesting_shares'),
      get(
        globalProps.dynamicProps,
        'total_vesting_fund_steem',
        globalProps.dynamicProps.total_vesting_fund_steem,
      ),
    );

    // build user data
    const _account: ProfileData = {
      ...account[0],
      author: username,
      reputation,
      voteAmount,
      follow_count: {
        following: followCount.following_count,
        follower: followCount.follower_count,
      },
      steem_power: {
        sp: parseFloat(steem_power),
        received: parseFloat(received_steem_power),
        delegated: parseFloat(delegated_steem_power),
      },
    };
    // check sanity
    if (account && account.length < 1) {
      return null;
    }
    // parse meta data
    if (
      has(_account, 'posting_json_metadata') ||
      has(_account, 'json_metadata')
    ) {
      console.log('[dSteem|fetchUserData] _account', _account);
      try {
        _account.about =
          JSON.parse(get(_account, 'json_metadata')) ||
          JSON.parse(get(_account, 'posting_json_metadata'));
        console.log('[dSteem|fetchUserData]', _account.about);
      } catch (error) {
        console.log('failed to fetch profile', error);
        _account.about = {};
      }
    }
    _account.avatar = getAvatar(get(_account, 'about'));
    _account.nickname = getName(get(_account, 'about'));
    return _account;
  } catch (error) {
    console.log('failed to fetch user data');
    return Promise.reject(error);
  }
};
*/
