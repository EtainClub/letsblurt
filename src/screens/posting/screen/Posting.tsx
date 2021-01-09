//// react
import React, {useState, useEffect, useRef, useContext} from 'react';
//// react native
import {View, StyleSheet, Dimensions, ScrollView, Image} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import ActionSheet from 'react-native-actions-sheet';
import {DropdownModal} from '~/components/DropdownModal';
import {argonTheme} from '~/constants/argonTheme';
import renderPostBody from '~/utils/render-helpers/markdown-2-html';
const {width, height} = Dimensions.get('screen');
//// contexts
import {UserContext} from '~/contexts';
import {PostData} from '~/contexts/types';
//// components
import {PostBody, Editor} from '~/components';
//// constants
const MAX_TAGS = 5;
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

type Position = {
  start: number;
  end: number;
};

interface Props {
  originalPost?: PostData;
  uploading: boolean;
  uploadedImage: {};
  posting: boolean;
  handlePressPostSumbit: (title: string, body: string, tags: string) => void;
  followingList?: string[];
  handlePressBeneficiary: () => void;
  handleCancelEditing: () => void;
}

const PostingScreen = (props: Props): JSX.Element => {
  //// props
  const {originalPost} = props;
  let markdownBody = '';
  if (originalPost) markdownBody = originalPost.markdownBody;
  //// language
  const intl = useIntl();
  //// references
  const inputRef = useRef(null);
  //// contexts
  const {userState, getFollowings} = useContext(UserContext);
  // states
  const [title, setTitle] = useState('');
  const [titleEditable, setTitleEditable] = useState(false);
  const [body, setBody] = useState('');
  const [previewBody, setPreviewBody] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState(null);
  const [rewardIndex, setRewardIndex] = useState(0);

  //////// events
  //// mount
  useEffect(() => {
    setTimeout(() => setTitleEditable(true), 100);
  }, []);
  //// set original post event
  useEffect(() => {
    if (originalPost) {
      setTitle(originalPost.state.title);
      setBody(markdownBody);
      // tags
      const _tags = originalPost.metadata.tags.reduce(
        (tagString, tag) => tagString + tag + ' ',
        '',
      );
      setTags(_tags);
      // get html from markdown
      const _body = renderPostBody(markdownBody, true);
      // set preview
      setPreviewBody(_body);
    }
  }, [originalPost]);

  const _handleTitleChange = (text: string) => {
    // check validity: max-length
    setTitle(text);
  };

  const _handleTagsChange = (text: string) => {
    // check validity: maximum tags, wrong tag, max-length-per-tag
    setTags(text);
    const tagString = text.replace(/,/g, ' ').replace(/#/g, '');
    let cats = tagString.split(' ');
    // validate
    _validateTags(cats);
  };

  //// validate the tags
  const _validateTags = (tags: string[]) => {
    if (tags.length > 0) {
      tags.length > MAX_TAGS
        ? setMessage(intl.formatMessage({id: 'Posting.limited_tags'}))
        : tags.find((c) => c.length > 24)
        ? setMessage(intl.formatMessage({id: 'Posting.limited_length'}))
        : tags.find((c) => c.split('-').length > 2)
        ? setMessage(intl.formatMessage({id: 'Posting.limited_dash'}))
        : tags.find((c) => c.indexOf(',') >= 0)
        ? setMessage(intl.formatMessage({id: 'Posting.limited_space'}))
        : tags.find((c) => /[A-Z]/.test(c))
        ? setMessage(intl.formatMessage({id: 'Posting.limited_lowercase'}))
        : tags.find((c) => !/^[a-z0-9-#]+$/.test(c))
        ? setMessage(intl.formatMessage({id: 'Posting.limited_characters'}))
        : tags.find((c) => !/^[a-z-#]/.test(c))
        ? setMessage(intl.formatMessage({id: 'Posting.limited_firstchar'}))
        : tags.find((c) => !/[a-z0-9]$/.test(c))
        ? setMessage(intl.formatMessage({id: 'Posting.limited_lastchar'}))
        : setMessage(null);
    }
  };

  ////
  const _onPressPostSubmit = () => {
    props.handlePressPostSumbit(title, body, tags);
  };

  //// clear contents
  const _clearContents = () => {
    setTitle('');
    setBody('');
    setTags('');
    setPreviewBody('');
    setMessage(null);
  };
  const _onPressClear = () => {
    _clearContents();
  };

  //// cancel editing
  const _onPressCancel = () => {
    console.log('[Posting] _onPressCancel');
    // clear contents
    _clearContents();
    // go back
    props.handleCancelEditing();
  };

  //// handle reward option chnage
  const _handleRewardChange = (index: number, value: string) => {
    console.log('_handleRewardChange index', index);
    setRewardIndex(index);
  };

  ////
  const _handleBodyChange = (_body: string) => {
    // set body
    setBody(_body);
    // set preview
    const _preview = renderPostBody(_body, true);
    setPreviewBody(_preview);
  };

  //// render preview of posting
  const _renderPreview = () => (
    <Block>
      <Text style={{marginLeft: 5, borderTopWidth: 2, fontWeight: 'bold'}}>
        {intl.formatMessage({id: 'Posting.preview'})}
      </Text>
      <Block card style={{margin: 10}}>
        <PostBody body={previewBody} />
      </Block>
    </Block>
  );

  const rewardOptions = ['Power Up 100%', 'No Reward'];
  const defaultOptionText = '';
  return (
    <View>
      <ScrollView>
        <Block flex>
          <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
            <Input
              value={title}
              editable={titleEditable}
              onChangeText={_handleTitleChange}
              maxLength={100}
              borderless
              color="black"
              placeholder={intl.formatMessage({
                id: 'Posting.title_placeholder',
              })}
              placeholderTextColor={argonTheme.COLORS.FACEBOOK}
              bgColor="transparent"
              style={[styles.input, styles.inputDefault]}
            />
          </Block>
          <Editor
            isComment={false}
            originalPost={markdownBody}
            handleBodyChange={_handleBodyChange}
          />

          <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
            <Input
              color="black"
              placeholder={intl.formatMessage({id: 'Posting.tags_placeholder'})}
              placeholderTextColor={argonTheme.COLORS.FACEBOOK}
              bgColor="transparent"
              style={styles.input}
              value={tags}
              onChangeText={_handleTagsChange}
            />
            {message && <Text color="red">{message}</Text>}
          </Block>
          <Block row>
            <DropdownModal
              key={rewardOptions[rewardIndex]}
              defaultText={defaultOptionText || rewardOptions[rewardIndex]}
              dropdownButtonStyle={styles.dropdownButtonStyle}
              selectedOptionIndex={rewardIndex}
              rowTextStyle={styles.rowTextStyle}
              style={styles.dropdown}
              dropdownStyle={styles.dropdownStyle}
              textStyle={styles.dropdownText}
              options={rewardOptions}
              onSelect={_handleRewardChange}
            />
            <Button
              size="small"
              onPress={props.handlePressBeneficiary}
              shadowless
              color={argonTheme.COLORS.FACEBOOK}>
              {intl.formatMessage({id: 'Posting.beneficiary_button'})}
            </Button>
          </Block>

          <Block center row>
            <Button
              onPress={_onPressPostSubmit}
              shadowless
              loading={props.posting}
              lodingSize="large"
              color={argonTheme.COLORS.ERROR}>
              {props.originalPost
                ? intl.formatMessage({id: 'Posting.update_button'})
                : intl.formatMessage({id: 'Posting.post_button'})}
            </Button>
            {props.originalPost ? (
              <Button onPress={_onPressCancel} shadowless color="gray">
                {intl.formatMessage({id: 'Posting.cancel_button'})}
              </Button>
            ) : (
              <Button onPress={_onPressClear} shadowless color="gray">
                {intl.formatMessage({id: 'Posting.clear_button'})}
              </Button>
            )}
          </Block>
          {_renderPreview()}
        </Block>
      </ScrollView>
    </View>
  );
};

export {PostingScreen};

const styles = StyleSheet.create({
  components: {
    paddingTop: theme.SIZES.BASE * 3,
  },
  title: {
    paddingVertical: theme.SIZES.BASE / 12,
    paddingHorizontal: theme.SIZES.BASE * 1,
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
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
  searchBar: {
    backgroundColor: argonTheme.COLORS.ERROR,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: argonTheme.COLORS.BORDER,
  },
  mentionList: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
  // dropdown
  text: {
    color: '#788187',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '#788187',
  },
  rowTextStyle: {
    fontSize: 12,
    color: '#788187',
    padding: 5,
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 200,
    width: 200,
  },
  dropdownButtonStyle: {
    borderColor: '#f5f5f5',
    borderWidth: 1,
    height: 44,
    width: 200,
    borderRadius: 8,
    marginRight: 20,
  },
  dropdown: {
    flexGrow: 1,
    width: 120,
  },
  textStyle: {
    color: '#357ce6',
  },
  textButton: {
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 20,
  },
});
