import React, {useState, useEffect, useContext} from 'react';

import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActionSheetIOS,
  //  Slider,
} from 'react-native';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
// html render
const {width} = Dimensions.get('screen');
import {useIntl} from 'react-intl';
import Modal from 'react-native-modal';
import Slider from '@react-native-community/slider';
import {materialTheme} from '~/constants/materialTheme';
import {argonTheme} from '~/constants/argonTheme';
import {AccountScreen} from '~/screens/signup/screen/Account';

import {ActionBarStyle} from '~/constants/actionBarTypes';
import {PostState} from '~/contexts/types';
import ModalDropdown from 'react-native-modal-dropdown';

import {AuthContext, PostsContext, UIContext} from '~/contexts';
import {navigate} from '~/navigation/service';

interface Props {
  postState: PostState;
  postIndex?: number;
  actionBarStyle: ActionBarStyle;
  loggedIn: boolean;
  voteAmount: number;
  handlePressVoting: (votingWeight: number) => Promise<boolean>;
  handlePressComments?: () => void;
  handlePressEditPost?: () => void;
  handlePressEditComment?: () => void;
  handlePressBookmark?: () => void;
  handlePressResteem?: () => void;
  handlePressShare?: () => void;
  handlePressReply?: () => void;
  handlePressVoter?: (voter: string) => void;
}

const ActionBarView = (props: Props): JSX.Element => {
  // props
  const {actionBarStyle, postState, handlePressVoting} = props;
  const {vote_count, voters, payout, comment_count, bookmarked} = postState;
  const {voteAmount} = props;
  // language
  const intl = useIntl();
  // contexts
  const {postsState} = useContext(PostsContext);
  const {authState} = useContext(AuthContext);
  const {uiState, setToastMessage} = useContext(UIContext);
  // states
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(postState.voted);
  const [bookmarking, setBookmarking] = useState(false);
  const [votingWeight, setVotingWeight] = useState(100);
  const [votingDollar, setVotingDollar] = useState<string>(
    props.voteAmount.toFixed(2),
  );
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  //////// use effects
  // callback when postsState changes only for post
  useEffect(() => {
    // only for post
    if (!postState.isComment) {
      setVoted(postState.voted);
    }
  }, [postState]);

  //////// functions
  //// helper: check author is user
  const _isAuthor = () => {
    return authState.currentCredentials.username === postState.post_ref.author;
  };

  //// handle press vote icon of action bar
  const _onPressVoteIcon = () => {
    console.log('[Action] _onPressVoteIcon');
    setVotingDollar(voteAmount.toFixed(2));
    if (!props.loggedIn) {
      console.log('You need to login to vote');
      setToastMessage(intl.formatMessage({id: 'Actionbar.vote_wo_login'}));
      return;
    }
    if (voted) {
      //      console.log('You already voted on this post');
      setToastMessage(intl.formatMessage({id: 'Actionbar.vote_again'}));
      return;
    }
    console.log('vote amount', voteAmount);
    // get voting value
    if (voteAmount < 0.01) {
      console.log('voting value is too low', voteAmount);
      //      return;
    }
    // show voting modal
    setShowVotingModal(true);
  };

  //// handle press vote
  const _onPressVote = async () => {
    setVoting(true);
    setShowVotingModal(false);
    const _voted = await handlePressVoting(votingWeight);
    setVoted(_voted);
    setVoting(false);
  };
  const _onPressVotesCount = () => {
    console.log('[ActionBar] onPressVoteCounts', voters);
    // @todo show active votes
  };

  //// handle press comment icon of action bar
  const _onPressComments = () => {
    console.log('[ActionBar] onPressComments');
    // @todo go to the comment section
    props.handlePressComments();
  };

  //// handle press bookmark icon of action bar
  const _onPressBookmark = () => {
    console.log('[ActionBar] onPressBookMark');
    // @todo add bookmark
  };

  //// handle press reply button of action bar
  const _onPressReply = () => {
    console.log('[ActionBar] onPressReply');
    // @todo open comment form
    props.handlePressReply();
  };

  //// handle press edit button of action bar
  const _onPressEditPost = () => {
    console.log('[ActionBar] onPressEditPost');
    // @todo open comment form
    props.handlePressEditPost();
  };

  //// handle press edit button of action bar
  const _onPressEditComment = () => {
    console.log('[ActionBar] onPressEditComment');
    // open comment form
    props.handlePressEditComment();
  };

  //// handle press resteem button of action bar
  const _onPressResteem = () => {
    console.log('[ActionBar] onPressResteem');
    // @todo process resteem
  };

  //// handle press share icon of action bar
  const _onPressShare = () => {
    console.log('[ActionBar] onPressShare');
    // @todo open sharing ui
  };

  //// handle slide completion event
  const _onVotingSlidingComplete = (weight: number) => {
    const price = (voteAmount * weight) / 100;
    setVotingDollar(price.toFixed(2));
    setVotingWeight(weight);
  };

  //// render voting modal
  const _renderVotingModal = () => {
    // return if voting finishes
    if (voted) return null;

    return (
      <Modal
        isVisible={showVotingModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        onBackdropPress={() => setShowVotingModal(false)}>
        <Block card center style={styles.votingContainer}>
          <Text color={argonTheme.COLORS.ERROR}>
            {votingWeight} % ({votingDollar} BLT)
          </Text>

          <Slider
            style={{width: width * 0.5, height: 40}}
            value={100}
            onValueChange={(weight) => _onVotingSlidingComplete(weight)}
            minimumValue={0}
            maximumValue={100}
            step={1}
          />
          <Icon
            size={40}
            color={argonTheme.COLORS.ERROR}
            name="upcircleo"
            family="antdesign"
            onPress={_onPressVote}
          />
        </Block>
      </Modal>
    );
  };

  return (
    <Block>
      <Block row style={actionBarStyle.styles}>
        <Block row style={{paddingRight: 10}}>
          <Text
            size={actionBarStyle.textSize}
            color={argonTheme.COLORS.ERROR}
            style={{paddingRight: 5}}>
            {payout} BLT
          </Text>
          <Button
            onPress={_onPressVoteIcon}
            loading={voting}
            onlyIcon
            icon={voted ? 'upcircleo' : 'upcircle'}
            iconFamily="antdesign"
            iconSize={actionBarStyle.iconSize}
            color={argonTheme.COLORS.ERROR}
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              width: actionBarStyle.iconSize + 3,
              height: actionBarStyle.iconSize + 3,
            }}
          />
        </Block>
        <ModalDropdown
          options={voters}
          onSelect={(index, value) => {
            const voter = value.split(' ')[0];
            props.handlePressVoter(voter);
          }}>
          <Block row style={{paddingRight: 10}}>
            <Icon
              size={actionBarStyle.iconSize}
              color={theme.COLORS.MUTED}
              name="chevron-up"
              family="material-community"
            />
            <Text size={actionBarStyle.textSize}>{vote_count}</Text>
          </Block>
        </ModalDropdown>

        {actionBarStyle.reply ? (
          <Block row>
            <TouchableWithoutFeedback onPress={_onPressReply}>
              <Block row style={{paddingRight: 10}}>
                <Text size={actionBarStyle.textSize}>
                  {intl.formatMessage({id: 'reply'})}
                </Text>
              </Block>
            </TouchableWithoutFeedback>
            {_isAuthor() ? (
              <TouchableWithoutFeedback onPress={_onPressEditComment}>
                <Block row style={{paddingRight: 10}}>
                  <Text size={actionBarStyle.textSize}>
                    {intl.formatMessage({id: 'edit'})}
                  </Text>
                </Block>
              </TouchableWithoutFeedback>
            ) : null}
          </Block>
        ) : (
          <TouchableWithoutFeedback onPress={_onPressComments}>
            <Block row style={{paddingRight: 10}}>
              <Icon
                size={actionBarStyle.iconSize}
                color={theme.COLORS.MUTED}
                name="commenting-o"
                family="font-awesome"
                style={{paddingRight: 2}}
              />
              <Text size={actionBarStyle.textSize}>{comment_count}</Text>
            </Block>
          </TouchableWithoutFeedback>
        )}
        {actionBarStyle.bookmark ? (
          <TouchableWithoutFeedback onPress={_onPressBookmark}>
            <Block row style={{paddingRight: 10}}>
              <Icon
                size={actionBarStyle.iconSize}
                color={argonTheme.COLORS.ERROR}
                name={bookmarked ? 'heart' : 'hearto'}
                family="antdesign"
                style={{paddingHorizontal: 10}}
              />
            </Block>
          </TouchableWithoutFeedback>
        ) : null}
        {actionBarStyle.resteem ? (
          <TouchableWithoutFeedback onPress={_onPressResteem}>
            <Block row style={{paddingRight: 10}}>
              <Icon
                size={actionBarStyle.iconSize}
                color={argonTheme.COLORS.ERROR}
                name="repeat"
                family="material-community"
                style={{paddingHorizontal: 10}}
              />
            </Block>
          </TouchableWithoutFeedback>
        ) : null}
        {actionBarStyle.share ? (
          <TouchableWithoutFeedback onPress={_onPressShare}>
            <Block row style={{paddingRight: 10}}>
              <Icon
                size={actionBarStyle.iconSize}
                color={argonTheme.COLORS.ERROR}
                name="sharealt"
                family="antdesign"
                style={{paddingHorizontal: 10}}
              />
            </Block>
          </TouchableWithoutFeedback>
        ) : null}
        {actionBarStyle.bookmark && _isAuthor() ? (
          <TouchableWithoutFeedback onPress={_onPressEditPost}>
            <Text>{intl.formatMessage({id: 'edit'})}</Text>
          </TouchableWithoutFeedback>
        ) : null}
      </Block>
      {_renderVotingModal()}
    </Block>
  );
};

export {ActionBarView};

const styles = StyleSheet.create({
  votingContainer: {
    width: '70%',
    height: 'auto',
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
  signContainer: {
    width: '100%',
    height: 'auto',
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
});
