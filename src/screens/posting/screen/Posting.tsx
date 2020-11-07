import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {useIntl} from 'react-intl';
import ActionSheet from 'react-native-actions-sheet';
import {DropdownModal} from '~/components/DropdownModal';
import {argonTheme} from '~/constants/argonTheme';
import {PostBody} from '~/components';
import renderPostBody from '~/utils/render-helpers/markdown-2-html';
import {PostData} from '~/contexts/types';
const {width, height} = Dimensions.get('screen');

const MAX_TAGS = 5;

type Position = {
  start: number;
  end: number;
};

interface Props {
  originalPost?: PostData;
  uploading: boolean;
  uploadedImage: {};
  posting: boolean;
  handlePhotoUpload: () => void;
  handleCameraUpload: () => void;
  handlePressPostSumbit: (title: string, body: string, tags: string) => void;
}

const PostingScreen = (props: Props): JSX.Element => {
  //// props
  const {uploadedImage, originalPost} = props;
  //// language
  const intl = useIntl();
  //// references
  const inputRef = useRef(null);
  // states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [previewBody, setPreviewBody] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rewardIndex, setRewardIndex] = useState(0);
  const [bodySelection, setBodySelection] = useState<Position>({
    start: 0,
    end: 0,
  });
  // ref
  const photoUploadRef = useRef(null);

  //// set original post event
  useEffect(() => {
    if (originalPost) {
      setTitle(originalPost.title);
      setBody(originalPost.markdownBody);
      // tags
      const _tags = originalPost.metadata.tags.reduce(
        (tagString, tag) => tagString + tag + ' ',
        '',
      );
      setTags(_tags);
      // get markdown body
      const _body = renderPostBody(originalPost.markdownBody, true);
      // set preview
      setPreviewBody(_body);
      // go top
      setBodySelection({start: 0, end: 0});
    }
  }, [originalPost]);

  //// handle uploaded image event
  useEffect(() => {
    if (uploadedImage && uploadedImage.url) {
      const _body =
        body.substring(0, bodySelection.start) +
        uploadedImage.url +
        body.substring(bodySelection.end);
      _handleBodyChange(_body);
    }
  }, [uploadedImage]);

  const _handleTitleChange = (text: string) => {
    // check validity: max-length
    setTitle(text);
  };

  const _handleBodyChange = (text: string) => {
    // check validity:
    setBody(text);
    // set preview body
    // update the post body whenver image is uploaded..
    const _body = renderPostBody(text, true);
    setPreviewBody(_body);
  };

  //// update input selection
  const _handleOnSelectionChange = async (event) => {
    setBodySelection(event.nativeEvent.selection);
    console.log(
      '[handleOnSelectionChange] selection',
      event.nativeEvent.selection,
    );
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

  //// handle press photo upload
  const _handlePressPhotoUpload = () => {
    console.log('[Posting');
    // show the action modal
    photoUploadRef.current?.setModalVisible(true);
  };

  ////
  const _openImagePicker = () => {
    props.handlePhotoUpload();
    // hide the modal
    photoUploadRef.current?.setModalVisible(false);
  };

  ///
  const _openCamera = () => {
    props.handleCameraUpload();
    // hide the modal
    photoUploadRef.current?.setModalVisible(false);
  };

  ////
  const _closeActionSheet = () => {
    // hide the modal
    photoUploadRef.current?.setModalVisible(false);
  };

  ////
  const _onPressPostSubmit = () => {
    props.handlePressPostSumbit(title, body, tags);
  };

  ////
  const _onPressClear = () => {
    setTitle('');
    setBody('');
    setTags('');
    setPreviewBody('');
    setMessage(null);
  };

  //// handle reward option chnage
  const _handleRewardChange = (index: number, value: string) => {
    console.log('_handleRewardChange index', index);
    setRewardIndex(index);
  };

  //// render preview of posting
  const _renderPreview = () => (
    <Block>
      <Text style={{marginLeft: 5, fontWeight: 'bold'}}>Preview</Text>
      <Block card style={{margin: 10}}>
        <PostBody body={previewBody} />
      </Block>
    </Block>
  );

  const rewardOptions = ['Power Up 100%', 'No Reward'];
  const defaultOptionText = '';
  return (
    <ScrollView>
      <Block flex>
        <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
          <Input
            value={title}
            onChangeText={_handleTitleChange}
            maxLength={100}
            borderless
            color="black"
            placeholder={intl.formatMessage({id: 'Posting.title_placeholder'})}
            placeholderTextColor={argonTheme.COLORS.FACEBOOK}
            bgColor="transparent"
            style={[styles.input, styles.inputDefault]}
          />
        </Block>
        <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
          <Input
            innerRef={inputRef}
            value={body}
            onChangeText={_handleBodyChange}
            onSelectionChange={_handleOnSelectionChange}
            style={[styles.input, styles.bodyContainer]}
            placeholder={intl.formatMessage({id: 'Posting.body_placeholder'})}
            placeholderTextColor={argonTheme.COLORS.FACEBOOK}
            color="black"
            multiline
            textAlignVertical="top"
            autoCorrect={false}
          />
        </Block>
        <Block row>
          <Button
            onPress={_handlePressPhotoUpload}
            loading={props.uploading}
            onlyIcon
            icon="picture-o"
            iconFamily="font-awesome"
            iconSize={14}
            color={argonTheme.COLORS.ERROR}
          />
          {/* <Button
            onPress={() => {}}
            onlyIcon
            icon="speaker"
            iconFamily="Feather"
            iconSize={14}
            color={argonTheme.COLORS.FACEBOOK}
          /> */}
        </Block>
        <ActionSheet ref={photoUploadRef}>
          <Block center>
            <Button color="primary" onPress={_openImagePicker}>
              {intl.formatMessage({id: 'Actionsheet.gallery'})}
            </Button>
            <Button color="warning" onPress={_openCamera}>
              {intl.formatMessage({id: 'Actionsheet.camera'})}
            </Button>
            <Button color="gray" onPress={_closeActionSheet}>
              {intl.formatMessage({id: 'Actionsheet.close'})}
            </Button>
          </Block>
        </ActionSheet>

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
        {
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
        }

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
          <Button onPress={_onPressClear} shadowless color="gray">
            {intl.formatMessage({id: 'Posting.clear_button'})}
          </Button>
        </Block>
        {_renderPreview()}
      </Block>
    </ScrollView>
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
