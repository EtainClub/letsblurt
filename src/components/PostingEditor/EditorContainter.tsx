import React, {useState, useContext, useEffect} from 'react';
import {AuthContext, PostsContext, UIContext, UserContext} from '~/contexts';
//// navigation
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
//// components
import {AuthorList} from '~/components';
//// screens, views
import {EditorView} from './EditorView';
//// utils
import renderPostBody from '~/utils/render-helpers/markdown-2-html';

//// types
type Position = {
  start: number;
  end: number;
};
//// props
interface Props {
  isComment: boolean;
  originalPost?: string;
  depth?: number;
  close?: boolean;
  handleBodyChange?: (body: string) => void;
  handleSubmitComment?: (text: string) => Promise<boolean>;
}
const EditorContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  //// contexts
  const {userState} = useContext(UserContext);
  //// states
  const [body, setBody] = useState(props.originalPost);
  const [editable, setEditable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bodySelection, setBodySelection] = useState<Position>({
    start: 0,
    end: 0,
  });
  const [containerHeight, setContainerHeight] = useState(40);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

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

  //// edit event. set body
  useEffect(() => {
    if (props.originalPost) {
      console.log('original body exists', props.originalPost);
    }
  }, [props.originalPost]);

  //// event: close of comment input
  useEffect(() => {
    if (props.close) {
      // clear body
      setBody('');
      setShowAuthorsModal(false);
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
    const {key} = nativeEvent;
    if (key === '@') {
      setShowAuthorsModal(true);
    } else {
      setShowAuthorsModal(false);
    }
  };

  const _handleBodyChange = (text: string) => {
    console.log('_handleBodyChange. text', text);
    // check validity:
    setBody(text);
    // return the body (markdown) to the parent
    props.handleBodyChange(text);
  };

  const _insertMentionedAccount = (text: string) => {
    // hide the modal
    setShowAuthorsModal(false);

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
    _body;
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

  //// update input selection position
  const _handleOnSelectionChange = async (event) => {
    setBodySelection(event.nativeEvent.selection);
  };

  //// update the height of comment input
  const _handleContainerHeight = (event) => {
    if (props.isComment) {
      setContainerHeight(event.nativeEvent.contentSize.height);
    }
  };

  //// set uploaded image url
  const _handleUploadedImageURL = (url: string) => {
    setUploadedImageUrl(url);
  };

  //// submit the comment
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

  return (
    <Block>
      <EditorView
        isComment={props.isComment}
        depth={props.depth}
        body={body}
        editable={editable}
        containerHeight={containerHeight}
        submitting={submitting}
        close={props.close}
        handleBodyChange={_handleBodyChange}
        handleSubmitComment={_handleSubmitComment}
        handleOnSelectionChange={_handleOnSelectionChange}
        handlePressKey={_handlePressKey}
        handleContainerHeight={_handleContainerHeight}
        handleUploadedImageURL={_handleUploadedImageURL}
        handlePressMention={_handlePressMention}
      />
      {showAuthorsModal && (
        <AuthorList
          authors={userState.followings}
          handlePressAuthor={_insertMentionedAccount}
          cancelModal={() => setShowAuthorsModal(false)}
        />
      )}
    </Block>
  );
};

export {EditorContainer};
