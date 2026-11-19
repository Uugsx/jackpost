import React, { useRef, useState } from 'react';
import get from 'lodash/get';
import CodeEditor from 'components/CodeEditor';
import FormUrlEncodedParams from 'components/RequestPane/FormUrlEncodedParams';
import MultipartFormParams from 'components/RequestPane/MultipartFormParams';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'providers/Theme';
import { updateRequestBody } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';
import FileBody from '../FileBody/index';
import { usePersistedState } from 'hooks/usePersistedState';
import { REQUEST_BODY_EDITOR_CLASS } from 'utils/common/constants';
import RecreateWsdlDialog from 'components/RequestPane/RecreateWsdlDialog';
import { validateXml, repairXml, formatXml } from 'utils/xml-tools';

const RequestBody = ({ item, collection }) => {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const [showRecreateDialog, setShowRecreateDialog] = useState(false);
  const body = item.draft ? get(item, 'draft.request.body') : get(item, 'request.body');
  const bodyMode = item.draft ? get(item, 'draft.request.body.mode') : get(item, 'request.body.mode');
  const { displayedTheme } = useTheme();
  const preferences = useSelector((state) => state.app.preferences);
  const [bodyScroll, setBodyScroll] = usePersistedState({ key: `request-body-${bodyMode}-scroll-${item.uid}`, default: 0 });

  const onEdit = (value) => {
    dispatch(
      updateRequestBody({
        content: value,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onRun = () => dispatch(sendRequest(item, collection.uid));
  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

  if (['json', 'xml', 'text', 'sparql'].includes(bodyMode)) {
    let codeMirrorMode = {
      json: 'application/ld+json',
      text: 'application/text',
      xml: 'application/xml',
      sparql: 'application/sparql-query'
    };

    let bodyContent = {
      json: body.json,
      text: body.text,
      xml: body.xml,
      sparql: body.sparql
    };

    const xmlText = bodyMode === 'xml' ? bodyContent.xml || '' : '';
    const xmlStatus = bodyMode === 'xml' ? validateXml(xmlText) : null;

    return (
      <StyledWrapper className={`w-full flex flex-col h-full ${REQUEST_BODY_EDITOR_CLASS}`} data-testid="request-body-editor">
        {xmlStatus && (
          <div className="flex flex-none items-center gap-2 text-xs pb-2" data-testid="xml-toolbar">
            <span style={{ color: xmlStatus.valid ? 'var(--color-text-green, #3a9d5d)' : 'var(--color-text-danger, #d9534f)' }}>
              {xmlStatus.valid ? 'XML OK' : `XML error${xmlStatus.line ? ` (line ${xmlStatus.line})` : ''}: ${xmlStatus.message}`}
            </span>
            {get(collection, 'jackpostConfig.wsdl.sourceUrl') && (
              <button
                type="button"
                className="ml-auto underline"
                title="Recreates a default request from the schema"
                data-testid="recreate-wsdl-request"
                onClick={() => setShowRecreateDialog(true)}
              >
                Recreate from schema
              </button>
            )}
            <button
              type="button"
              className={get(collection, 'jackpostConfig.wsdl.sourceUrl') ? 'underline' : 'ml-auto underline'}
              disabled={xmlStatus.valid}
              title="Close unclosed tags, escape &, quote attributes"
              onClick={() => onEdit(repairXml(xmlText).xml)}
            >
              Fix XML
            </button>
            <button type="button" className="underline" disabled={!xmlStatus.valid} onClick={() => onEdit(formatXml(xmlText))}>
              Format
            </button>
          </div>
        )}
        {showRecreateDialog && (
          <RecreateWsdlDialog collectionUid={collection.uid} itemUid={item.uid} onClose={() => setShowRecreateDialog(false)} />
        )}
        <div className="flex-1 min-h-0">
        <CodeEditor
          ref={editorRef}
          collection={collection}
          item={item}
          theme={displayedTheme}
          font={get(preferences, 'font.codeFont', 'default')}
          fontSize={get(preferences, 'font.codeFontSize')}
          value={bodyContent[bodyMode] || ''}
          onEdit={onEdit}
          onRun={onRun}
          onSave={onSave}
          initialScroll={bodyScroll}
          onScroll={setBodyScroll}
          mode={codeMirrorMode[bodyMode]}
          enableVariableHighlighting={true}
          showHintsFor={['variables']}
        />
        </div>
      </StyledWrapper>
    );
  }

  if (bodyMode === 'file') {
    return <FileBody item={item} collection={collection} />;
  }

  if (bodyMode === 'formUrlEncoded') {
    return <FormUrlEncodedParams item={item} collection={collection} />;
  }

  if (bodyMode === 'multipartForm') {
    return <MultipartFormParams item={item} collection={collection} />;
  }

  return <StyledWrapper className="w-full">No Body</StyledWrapper>;
};
export default RequestBody;
