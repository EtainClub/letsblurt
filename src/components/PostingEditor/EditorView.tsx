//// react
import React, {useState, useContext, useEffect, useRef} from 'react';
//// react native
import {Dimensions, StyleSheet} from 'react-native';
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
}
const EditorView = (props: Props): JSX.Element => {
  //// props
  const {isComment} = props;
  //// language
  const intl = useIntl();
  //// contexts

  //// states
  const [body, setBody] = useState('');
  const [previewBody, setPreviewBody] = useState('');
  const [bodySelection, setBodySelection] = useState<Position>({
    start: 0,
    end: 0,
  });
  const [mentioning, setMentioning] = useState(false);
  const [searchAuthor, setSearchAuthor] = useState('');
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  //// refs
  const inputRef = useRef(null);
  const photoUploadRef = useRef(null);
  const mentionRef = useRef(null);

  const _handleBodyChange = (text: string) => {
    // check validity:
    setBody(text);
    // set preview body
    // update the post body whenever image is uploaded..
    const _body = renderPostBody(text, true);
    setPreviewBody(_body);
  };

  const _getTypedCharacter = () => {
    /// get newly typed character
    const {start, end} = bodySelection;
    const char = start === end ? body[start - 1] : body[body.length - 1];
    return char;
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
    setBody(_body);
  };

  //// update input selection
  const _handleOnSelectionChange = async (event) => {
    setBodySelection(event.nativeEvent.selection);
  };

  ////
  const _handleUploadedImageURL = (url: string) => {
    setUploadedImageUrl(url);
  };

  const iconSend = (
    <Button
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

  return (
    <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
      <Input
        innerRef={inputRef}
        value={body}
        onChangeText={_handleBodyChange}
        onSelectionChange={_handleOnSelectionChange}
        style={isComment ? styles.commentContainer : styles.postContainer}
        right={isComment ? true : false}
        iconContent={isComment ? iconSend : null}
        placeholder={intl.formatMessage({id: 'Posting.body_placeholder'})}
        placeholderTextColor={argonTheme.COLORS.FACEBOOK}
        color="black"
        multiline
        textAlignVertical="top"
        autoCorrect={false}
      />
      <Block row style={{top: -10}}>
        <ImageUpload
          isComment={isComment}
          containerStyle={{right: true}}
          getImageURL={_handleUploadedImageURL}
        />
        <Button
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
