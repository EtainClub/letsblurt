//// react
import React, {useState, useContext, useEffect, useRef} from 'react';
//// react native
import {Dimensions, StyleSheet, KeyboardAvoidingView} from 'react-native';
//// config
//// language
import {useIntl} from 'react-intl';
//// blockchain
import {signImage, fetchRawPost} from '~/providers/blurt/dblurtApi';
import {Discussion} from 'dblurt';
//// contexts
import {AuthContext, PostsContext, UIContext, UserContext} from '~/contexts';
import {PostingContent} from '~/contexts/types';
//// navigation
import {navigate} from '~/navigation/service';
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import ActionSheet from 'react-native-actions-sheet';
import {DropdownModal} from '~/components/DropdownModal';
import {argonTheme} from '~/constants/argonTheme';
const {height, width} = Dimensions.get('window');
//// components
import {Beneficiary, AuthorList, ImageUpload} from '~/components';
import {BeneficiaryItem} from '~/components/Beneficiary/BeneficiaryContainer';
import {BLURT_BENEFICIARY_WEIGHT} from '~/constants';
//// utils
import renderPostBody from '~/utils/render-helpers/markdown-2-html';

type Position = {
  start: number;
  end: number;
};

interface Props {
  isComment: boolean;
  originalPost: string;
  depth?: number;
  close?: boolean;
  handleBodyChange?: (body: string) => void;
  handleSubmitComment: (text: string) => Promise<boolean>;
}
const EditorView = (props: Props): JSX.Element => {
  //// props
  const {isComment} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {userState} = useContext(UserContext);
  //// states
  const [close, setClose] = useState(false);
  const [body, setBody] = useState(props.originalPost);
  const [editable, setEditable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewBody, setPreviewBody] = useState('');
  const [bodySelection, setBodySelection] = useState<Position>({
    start: 0,
    end: 0,
  });
  const [containerHeight, setContainerHeight] = useState(40);
  const [mentioning, setMentioning] = useState(false);
  const [searchAuthor, setSearchAuthor] = useState('');
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  console.log('EditorView. props original', props.originalPost);
  console.log('EditorView. props body', body);

  //////// events
  //// mount
  useEffect(() => {
    setTimeout(() => setEditable(true), 100);
  }, []);

  //// edit event. set body
  useEffect(() => {
    if (props.originalPost) {
      console.log('[EditorView] original body exists', props.originalPost);
      setBody(props.originalPost);
    }
  }, [props.originalPost]);

  //// close event
  useEffect(() => {
    if (props.close) {
      setBody('');
      setShowAuthorsModal(false);
      setClose(true);
    }
  }, [props.close]);

  //// uploading image event
  useEffect(() => {
    if (uploadedImageUrl) {
      const _body =
        body.substring(0, bodySelection.start) +
        uploadedImageUrl +
        body.substring(bodySelection.end);
      _handleBodyChange(_body);
    }
  }, [uploadedImageUrl]);

  //// handle press key event and catch '@' key
  const _handlePressKey = ({nativeEvent}) => {
    console.log('_handlePressKey', nativeEvent);
    const {key} = nativeEvent;
    if (key === '@') {
      setShowAuthorsModal(true);
    } else {
      setShowAuthorsModal(false);
    }
  };

  const _handleBodyChange = (text: string) => {
    // check validity:
    setBody(text);
    // set preview body
    // update the post body whenever image is uploaded..
    const _body = renderPostBody(text, true);
    setPreviewBody(_body);
    // for main posting, send the change to the parent
    if (!isComment) {
      props.handleBodyChange(_body);
    }
  };

  const _insertMentionedAccount = (text: string) => {
    console.log('_finalizeMention. author', text);
    // hide the modal
    setShowAuthorsModal(false);
    //
    setSearchAuthor('');

    // append the author int the body
    const _body =
      body.substring(0, bodySelection.start) +
      text +
      body.substring(bodySelection.end, body.length);
    console.log('_finalizeMention. body', _body);
    // update body selection
    setBodySelection({
      start: bodySelection.start + text.length,
      end: bodySelection.end + text.length,
    });
    setBody(_body);
    // send the change to the parent
    props.handleBodyChange(_body);
  };

  //// handle press mention icon
  const _handlePressMention = () => {
    // put @ in the body
    const _body =
      body.substring(0, bodySelection.start) +
      '@' +
      body.substring(bodySelection.end, body.length);
    console.log('_finalizeMention. body', _body);
    setBody(_body);
    // update body selection
    setBodySelection({
      start: bodySelection.start + 1,
      end: bodySelection.end + 1,
    });
    // show author list modal
    setShowAuthorsModal(true);
  };

  //// update input selection
  const _handleOnSelectionChange = async (event) => {
    setBodySelection(event.nativeEvent.selection);
  };

  ////
  const _handleContainerHeight = (event) => {
    if (isComment) {
      setContainerHeight(event.nativeEvent.contentSize.height);
    }
  };

  ////
  const _handleUploadedImageURL = (url: string) => {
    setUploadedImageUrl(url);
  };

  ////
  const _handleSubmitComment = async () => {
    setSubmitting(true);
    const result = await props.handleSubmitComment(body);
    setSubmitting(false);
    if (result) {
      console.log('_handleSubmitComment. result', result);
      // clear body
      setBody('');
    }
  };

  const iconSend = (
    <Button
      onPress={_handleSubmitComment}
      loading={submitting}
      onlyIcon
      icon="ios-send"
      iconFamily="ionicon"
      iconSize={24}
      color={argonTheme.COLORS.ERROR}
      style={{
        margin: 0,
        padding: 0,
        right: -10,
        width: 24 + 3,
        height: 24 + 3,
      }}
    />
  );

  return close ? null : (
    <Block>
      <KeyboardAvoidingView behavior="height" enabled>
        <Block
          center
          style={[
            props.depth ? {right: props.depth * 10} : null,
            {paddingHorizontal: theme.SIZES.BASE},
          ]}>
          <Input
            style={
              isComment
                ? [styles.commentContainer, {height: containerHeight}]
                : styles.postContainer
            }
            editable={editable}
            defaultValue={body}
            onChangeText={_handleBodyChange}
            onSelectionChange={_handleOnSelectionChange}
            onKeyPress={_handlePressKey}
            right={isComment ? true : false}
            iconContent={isComment ? iconSend : null}
            placeholder={intl.formatMessage({id: 'Posting.body_placeholder'})}
            placeholderTextColor={argonTheme.COLORS.FACEBOOK}
            color="black"
            multiline
            rounded
            blurOnSubmit={false}
            textAlignVertical="top"
            autoCorrect={false}
            onContentSizeChange={_handleContainerHeight}
          />
          <Block row left style={{top: -10}}>
            <ImageUpload
              isComment={isComment}
              containerStyle={{right: true}}
              getImageURL={_handleUploadedImageURL}
            />
            <Button
              onPress={_handlePressMention}
              onlyIcon
              icon="at"
              iconFamily="font-awesome"
              iconSize={isComment ? 10 : 14}
              color={argonTheme.COLORS.FACEBOOK}
            />
            <Button
              onlyIcon
              icon="trash"
              iconFamily="font-awesome"
              iconSize={isComment ? 10 : 14}
              color={argonTheme.COLORS.SWITCH_ON}
            />
          </Block>
        </Block>
      </KeyboardAvoidingView>
      {showAuthorsModal && (
        <AuthorList
          authors={userState.followings}
          showModal={showAuthorsModal}
          handlePressAuthor={_insertMentionedAccount}
        />
      )}
    </Block>
  );
};

export {EditorView};

const styles = StyleSheet.create({
  postContainer: {
    height: 250,
    margin: 0,
    padding: 0,
    fontSize: 14,
    borderColor: 'grey',
    borderWidth: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  commentContainer: {
    width: width * 0.8,
    height: theme.SIZES.BASE * 3,
    backgroundColor: theme.COLORS.WHITE,
    borderColor: 'red',
    borderWidth: 2,
    paddingVertical: 0,
    marginVertical: 0,
  },
  components: {
    paddingTop: theme.SIZES.BASE * 3,
  },
  input: {
    borderBottomWidth: 1,
  },
  inputDefault: {
    borderBottomColor: argonTheme.COLORS.PLACEHOLDER,
  },
  bodyContainer: {
    height: 250,
    margin: 0,
    padding: 0,
    fontSize: 14,
    borderColor: 'grey',
    borderWidth: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
